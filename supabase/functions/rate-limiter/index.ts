import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, identifier, limit = 10, windowMinutes = 60 } = await req.json()

    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Action and identifier are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limit using database function
    const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
      identifier_param: identifier,
      action_param: action,
      limit_param: limit,
      window_minutes: windowMinutes
    })

    if (error) {
      console.error('Rate limit check error:', error)
      return new Response(
        JSON.stringify({ error: 'Rate limit check failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!allowed) {
      // Rate limit exceeded
      const retryAfter = windowMinutes * 60 // seconds
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter,
          action,
          limit
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString()
          } 
        }
      )
    }

    // Rate limit passed
    return new Response(
      JSON.stringify({ allowed: true, action, limit }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Rate limiter error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})