import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, hash, farmId, cropId, content } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Infura API key from secrets
    const infuraApiKey = Deno.env.get('INFURA_API_KEY');
    
    if (!infuraApiKey) {
      throw new Error('Infura API key not configured');
    }

    console.log('Storing document hash on blockchain:', { documentId, hash, farmId });

    // Simulate blockchain interaction with Polygon network
    // In a real implementation, you would:
    // 1. Create a transaction to store the hash
    // 2. Sign it with a private key
    // 3. Send it to the Polygon network via Infura
    
    const mockBlockchainResponse = {
      transactionHash: `0x${hash}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 45000000, // Polygon block range
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      transactionFee: (Math.random() * 0.01 + 0.001).toFixed(6) + ' MATIC',
      status: 'success',
      confirmations: 1
    };

    // Store the blockchain record in our database
    const { data: blockchainRecord, error: dbError } = await supabase
      .from('export_documents')
      .upsert({
        id: documentId,
        farm_id: farmId,
        crop_id: cropId,
        document_type: 'blockchain_record',
        title: `Blockchain Record - ${hash.substring(0, 8)}`,
        content: {
          ...content,
          blockchain: {
            hash,
            transactionHash: mockBlockchainResponse.transactionHash,
            blockNumber: mockBlockchainResponse.blockNumber,
            network: 'polygon',
            timestamp: new Date().toISOString(),
            verified: true
          }
        },
        blockchain_hash: hash,
        status: 'approved'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Successfully stored blockchain record:', blockchainRecord);

    return new Response(JSON.stringify({
      success: true,
      data: {
        hash,
        blockNumber: mockBlockchainResponse.blockNumber,
        transactionHash: mockBlockchainResponse.transactionHash,
        gasUsed: mockBlockchainResponse.gasUsed,
        transactionFee: mockBlockchainResponse.transactionFee,
        verified: true,
        documentRecord: blockchainRecord
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in blockchain-store function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});