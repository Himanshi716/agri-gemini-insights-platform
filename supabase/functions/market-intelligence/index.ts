import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { cropType, targetMarkets, farmId, analysisType = 'pricing' } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Generating market intelligence for:', cropType, 'in markets:', targetMarkets)

    // Get farm context if available
    let farmContext = ''
    if (farmId) {
      const { data: farm } = await supabase
        .from('farms')
        .select(`
          name, location_address, size_hectares,
          crops(name, variety, area_hectares, planting_date, expected_harvest_date)
        `)
        .eq('id', farmId)
        .single()

      if (farm) {
        farmContext = `
FARM CONTEXT:
- Farm: ${farm.name}
- Location: ${farm.location_address}
- Total Size: ${farm.size_hectares} hectares
- Current Crops: ${farm.crops?.map(c => `${c.name} (${c.area_hectares}ha)`).join(', ') || 'None'}
`
      }
    }

    const getPrompt = (type: string) => {
      const baseContext = `You are an expert agricultural market analyst providing insights for export planning.

${farmContext}

ANALYSIS REQUEST:
- Crop: ${cropType}
- Target Markets: ${Array.isArray(targetMarkets) ? targetMarkets.join(', ') : targetMarkets}
- Analysis Type: ${type}
`

      switch (type) {
        case 'pricing':
          return `${baseContext}

Provide comprehensive pricing analysis:

1. **CURRENT MARKET PRICES**:
   - Current spot prices in target markets
   - Price ranges (low, average, high)
   - Currency considerations
   - Price comparison across markets

2. **PRICE TRENDS**:
   - 12-month price history
   - Seasonal patterns
   - Year-over-year changes
   - Market volatility indicators

3. **PRICE FORECASTING**:
   - 3-month price outlook
   - 6-month projections
   - Key factors affecting prices
   - Risk factors and opportunities

4. **MARKET DYNAMICS**:
   - Supply and demand factors
   - Competition analysis
   - Quality premiums/discounts
   - Market access costs

5. **OPTIMIZATION STRATEGIES**:
   - Best timing for sales
   - Target market prioritization
   - Value-addition opportunities
   - Contract vs. spot market advice

Provide specific, actionable pricing intelligence.`

        case 'demand':
          return `${baseContext}

Analyze market demand patterns:

1. **DEMAND ANALYSIS**:
   - Current demand levels
   - Growth trends
   - Market size and share
   - Consumer preferences

2. **MARKET OPPORTUNITIES**:
   - Emerging markets
   - Niche segments
   - Premium categories
   - Organic/sustainable demand

3. **COMPETITIVE LANDSCAPE**:
   - Key competitors
   - Market positioning
   - Differentiation opportunities
   - Barriers to entry

4. **TIMING OPTIMIZATION**:
   - Seasonal demand patterns
   - Market windows
   - Supply chain considerations
   - Harvest timing alignment

Provide strategic market entry guidance.`

        case 'regulatory':
          return `${baseContext}

Analyze regulatory and trade requirements:

1. **MARKET ACCESS REQUIREMENTS**:
   - Import regulations by market
   - Required certifications
   - Documentation needs
   - Quality standards

2. **TRADE BARRIERS**:
   - Tariffs and duties
   - Quotas and restrictions
   - Phytosanitary requirements
   - Country-specific regulations

3. **COMPLIANCE TIMELINE**:
   - Certification lead times
   - Registration requirements
   - Renewal schedules
   - Critical deadlines

4. **MARKET ENTRY STRATEGY**:
   - Easiest markets to enter
   - High-value opportunities
   - Risk assessment
   - Compliance costs

Provide regulatory roadmap for market access.`

        default:
          return `${baseContext}

Provide comprehensive market intelligence covering pricing, demand, and regulatory aspects.`
      }
    }

    const prompt = getPrompt(analysisType)

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const intelligence = data.candidates[0].content.parts[0].text

    // Save market intelligence
    if (farmId) {
      const { error: dbError } = await supabase
        .from('export_documents')
        .insert({
          farm_id: farmId,
          document_type: 'market_intelligence',
          title: `Market Intelligence - ${cropType} - ${new Date().toLocaleDateString()}`,
          content: {
            intelligence,
            crop_type: cropType,
            target_markets: targetMarkets,
            analysis_type: analysisType,
            timestamp: new Date().toISOString()
          },
          status: 'approved'
        })

      if (dbError) {
        console.error('Failed to save market intelligence:', dbError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        intelligence,
        cropType,
        targetMarkets,
        analysisType,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Market intelligence error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})