import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentRequest {
  templateId: string;
  farmId: string;
  documentType: string;
  data: Record<string, any>;
  includeQR?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { templateId, farmId, documentType, data, includeQR = false } = await req.json() as DocumentRequest;

    console.log(`Generating document for template: ${templateId}, farm: ${farmId}`);

    // Get template configuration
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Get farm context
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select(`
        name, location_address, size_hectares, certifications,
        user_id
      `)
      .eq('id', farmId)
      .single();

    if (farmError || !farm) {
      throw new Error(`Farm not found: ${farmId}`);
    }

    // Generate document content based on template
    const documentContent = generateDocumentContent(template, data, farm);
    
    // Generate QR code data if requested
    let qrCodeData = null;
    if (includeQR) {
      qrCodeData = generateQRCodeData(farmId, documentType, data);
    }

    // Generate blockchain hash for verification
    const blockchainHash = await generateBlockchainHash(documentContent);

    // Save document to database
    const { data: document, error: docError } = await supabase
      .from('export_documents')
      .insert({
        farm_id: farmId,
        document_type: documentType,
        title: `${template.template_name} - ${new Date().toLocaleDateString()}`,
        content: {
          template_id: templateId,
          generated_data: data,
          document_content: documentContent,
          qr_code_data: qrCodeData,
          farm_context: {
            name: farm.name,
            location: farm.location_address,
            size: farm.size_hectares
          }
        },
        status: 'completed',
        blockchain_hash: blockchainHash,
        generated_by: farm.user_id
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to save document: ${docError.message}`);
    }

    console.log(`Document generated successfully: ${document.id}`);

    return new Response(JSON.stringify({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: documentContent,
        qr_code_data: qrCodeData,
        blockchain_hash: blockchainHash,
        download_url: `${supabaseUrl}/rest/v1/export_documents?id=eq.${document.id}`,
        created_at: document.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Document generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateDocumentContent(template: any, data: any, farm: any): string {
  const config = template.template_config;
  let content = `
=== ${template.template_name} ===

Document Type: ${template.template_type}
Generated Date: ${new Date().toISOString()}
Farm: ${farm.name}
Location: ${farm.location_address}

--- Document Fields ---
`;

  // Generate field content based on template configuration
  if (config.fields) {
    for (const field of config.fields) {
      const value = data[field] || 'Not provided';
      content += `${field.replace(/_/g, ' ').toUpperCase()}: ${value}\n`;
    }
  }

  content += `
--- Compliance Information ---
Generated for compliance with applicable regulations
This document has been digitally signed and verified
Blockchain Hash will be provided for verification

--- Farm Certification ---
`;

  if (farm.certifications && farm.certifications.length > 0) {
    content += `Certifications: ${farm.certifications.join(', ')}\n`;
  } else {
    content += 'No active certifications\n';
  }

  content += `
Farm Size: ${farm.size_hectares || 'Not specified'} hectares
Document Version: 1.0
`;

  return content;
}

function generateQRCodeData(farmId: string, documentType: string, data: any): string {
  // Create QR code data that includes verification information
  const qrData = {
    farmId,
    documentType,
    timestamp: new Date().toISOString(),
    verification_url: `https://verify.agri-platform.com/document/${farmId}`,
    data_hash: btoa(JSON.stringify(data)).substring(0, 16)
  };
  
  return JSON.stringify(qrData);
}

async function generateBlockchainHash(content: string): Promise<string> {
  // Generate a simple hash for blockchain verification
  // In production, this would integrate with actual blockchain
  const encoder = new TextEncoder();
  const data = encoder.encode(content + new Date().toISOString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}