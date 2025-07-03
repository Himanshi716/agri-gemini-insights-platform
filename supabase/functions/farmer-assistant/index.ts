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
    const { message, userId, farmId, language = 'en' } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Processing farmer assistant query for user:', userId)

    // Get farm context if farmId provided
    let farmContext = ''
    if (farmId) {
      const { data: farm } = await supabase
        .from('farms')
        .select(`
          name, location_address, size_hectares, certifications,
          crops(name, variety, status, planting_date),
          iot_sensors(type, last_reading_at),
          compliance_records(standard_name, status)
        `)
        .eq('id', farmId)
        .single()

      if (farm) {
        farmContext = `
FARM CONTEXT:
- Farm: ${farm.name}
- Location: ${farm.location_address}
- Size: ${farm.size_hectares} hectares
- Certifications: ${farm.certifications?.join(', ') || 'None'}
- Active Crops: ${farm.crops?.map(c => `${c.name} (${c.variety})`).join(', ') || 'None'}
- Sensors: ${farm.iot_sensors?.map(s => s.type).join(', ') || 'None'}
- Compliance: ${farm.compliance_records?.map(c => `${c.standard_name} (${c.status})`).join(', ') || 'None'}
`
      }
    }

    const systemPrompt = `You are AgriBot, an expert agricultural AI assistant helping farmers optimize their operations. You provide practical, science-based advice on:

- Crop management and optimization
- Pest and disease identification and treatment
- Soil health and fertilization
- Irrigation and water management
- Weather adaptation strategies
- Compliance with agricultural standards
- Export documentation requirements
- Sustainable farming practices
- Market trends and pricing insights

${farmContext}

GUIDELINES:
- Always provide actionable, practical advice
- Consider local conditions and seasonal factors
- Suggest both organic and conventional solutions when relevant
- Include timing recommendations for treatments/actions
- Explain the reasoning behind your recommendations
- Ask clarifying questions when needed
- Be encouraging and supportive
- ${language !== 'en' ? `Respond in ${language} language` : 'Respond in English'}

Keep responses focused and helpful for busy farmers.`

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nFarmer Question: ${message}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantResponse = data.candidates[0].content.parts[0].text

    // Log the conversation for improvements
    if (userId) {
      const { error: logError } = await supabase
        .from('export_documents')
        .insert({
          farm_id: farmId,
          document_type: 'assistant_conversation',
          title: `Assistant Chat - ${new Date().toLocaleDateString()}`,
          content: {
            user_message: message,
            assistant_response: assistantResponse,
            language,
            timestamp: new Date().toISOString()
          },
          status: 'approved',
          generated_by: userId
        })

      if (logError) {
        console.error('Failed to log conversation:', logError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: assistantResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Farmer assistant error:', error)
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