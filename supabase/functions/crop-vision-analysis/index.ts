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
    const { image, cropType, farmId } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Analyzing crop image for farm:', farmId)

    // Prepare the prompt for crop analysis
    const prompt = `You are an expert agricultural AI assistant specializing in crop health analysis. 

Analyze this ${cropType || 'crop'} image and provide:

1. **Health Assessment**: Overall health status (Healthy, Stressed, Diseased, Critical)
2. **Disease Detection**: Any visible diseases, pests, or disorders
3. **Symptoms**: Specific symptoms observed (leaf spots, discoloration, wilting, etc.)
4. **Severity**: Rate severity from 1-10 if issues found
5. **Recommendations**: 
   - Immediate actions needed
   - Treatment options (organic/chemical)
   - Prevention strategies
   - Timeline for action
6. **Monitoring**: What to watch for next

Provide practical, actionable advice for farmers. Be specific about treatments and timing.`

    // Call Gemini Vision API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image.split(',')[1] // Remove data:image/jpeg;base64, prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = data.candidates[0].content.parts[0].text

    // Save analysis to database if farmId provided
    if (farmId) {
      const { error: dbError } = await supabase
        .from('export_documents')
        .insert({
          farm_id: farmId,
          document_type: 'crop_analysis',
          title: `Crop Vision Analysis - ${new Date().toLocaleDateString()}`,
          content: {
            analysis,
            crop_type: cropType,
            timestamp: new Date().toISOString(),
            image_analyzed: true
          },
          status: 'approved'
        })

      if (dbError) {
        console.error('Failed to save analysis:', dbError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Crop analysis error:', error)
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