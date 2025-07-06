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
    const { hash } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Verifying document hash on blockchain:', hash);

    // Look up the blockchain record in our database
    const { data: blockchainRecord, error: dbError } = await supabase
      .from('export_documents')
      .select('*')
      .eq('blockchain_hash', hash)
      .eq('document_type', 'blockchain_record')
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (!blockchainRecord) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          hash,
          verified: false,
          timestamp: new Date().toISOString(),
          blockNumber: 0,
          error: 'Document hash not found on blockchain'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract blockchain info from the stored record
    const blockchainData = blockchainRecord.content?.blockchain || {};

    console.log('Found blockchain record:', blockchainData);

    return new Response(JSON.stringify({
      success: true,
      data: {
        hash,
        verified: true,
        timestamp: blockchainData.timestamp || blockchainRecord.created_at,
        blockNumber: blockchainData.blockNumber || 0,
        transactionHash: blockchainData.transactionHash,
        network: blockchainData.network || 'polygon',
        gasUsed: blockchainData.gasUsed,
        transactionFee: blockchainData.transactionFee,
        documentId: blockchainRecord.id,
        farmId: blockchainRecord.farm_id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in blockchain-verify function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});