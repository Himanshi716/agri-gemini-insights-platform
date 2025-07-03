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
    const { farmId, complianceStandard, targetMarket, cropType } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Analyzing compliance for farm:', farmId, 'standard:', complianceStandard)

    // Get farm and compliance data
    const { data: farmData } = await supabase
      .from('farms')
      .select(`
        *,
        crops(*),
        compliance_records(*),
        iot_sensors(*)
      `)
      .eq('id', farmId)
      .single()

    if (!farmData) {
      throw new Error('Farm not found')
    }

    const farmContext = `
FARM INFORMATION:
- Name: ${farmData.name}
- Location: ${farmData.location_address}
- Size: ${farmData.size_hectares} hectares
- Current Certifications: ${farmData.certifications?.join(', ') || 'None'}

CROPS:
${farmData.crops?.map(crop => `- ${crop.name} (${crop.variety}) - Status: ${crop.status}`).join('\n') || 'No crops recorded'}

EXISTING COMPLIANCE:
${farmData.compliance_records?.map(comp => `- ${comp.standard_name}: ${comp.status} (Expires: ${comp.expiry_date})`).join('\n') || 'No compliance records'}

MONITORING CAPABILITIES:
${farmData.iot_sensors?.map(sensor => `- ${sensor.type} sensor: ${sensor.is_active ? 'Active' : 'Inactive'}`).join('\n') || 'No sensors deployed'}
`

    const prompt = `You are an expert agricultural compliance analyst specializing in export standards and certifications.

Analyze the compliance requirements for:
- Standard: ${complianceStandard || 'General agricultural export standards'}
- Target Market: ${targetMarket || 'International markets'}
- Crop Type: ${cropType || 'Mixed crops'}

${farmContext}

Provide a comprehensive compliance analysis including:

1. **COMPLIANCE STATUS**:
   - Current compliance level (0-100%)
   - Standards met vs. required
   - Critical gaps identified

2. **REQUIREMENTS ANALYSIS**:
   - Mandatory certifications needed
   - Documentation requirements
   - Testing and inspection needs
   - Record-keeping requirements

3. **GAP ANALYSIS**:
   - Missing certifications
   - Documentation gaps
   - Process improvements needed
   - Infrastructure requirements

4. **ACTION PLAN**:
   - Priority actions (immediate, short-term, long-term)
   - Estimated timelines
   - Cost implications
   - Required resources

5. **RISK ASSESSMENT**:
   - Compliance risks
   - Market access risks
   - Mitigation strategies

6. **MONITORING & MAINTENANCE**:
   - Ongoing compliance activities
   - Renewal schedules
   - Performance indicators

7. **RECOMMENDATIONS**:
   - Best practices to implement
   - Efficiency improvements
   - Technology solutions

Provide specific, actionable guidance tailored to this farm's situation.`

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
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = data.candidates[0].content.parts[0].text

    // Save compliance analysis
    const { error: dbError } = await supabase
      .from('export_documents')
      .insert({
        farm_id: farmId,
        document_type: 'compliance_analysis',
        title: `Compliance Analysis - ${complianceStandard} - ${new Date().toLocaleDateString()}`,
        content: {
          analysis,
          compliance_standard: complianceStandard,
          target_market: targetMarket,
          crop_type: cropType,
          farm_context: farmContext,
          timestamp: new Date().toISOString()
        },
        status: 'approved'
      })

    if (dbError) {
      console.error('Failed to save compliance analysis:', dbError)
    }

    // Create or update compliance record
    const { error: complianceError } = await supabase
      .from('compliance_records')
      .upsert({
        farm_id: farmId,
        standard_name: complianceStandard || 'General Export Standards',
        status: 'pending',
        audit_notes: 'Generated by AI compliance analysis',
      })

    if (complianceError) {
      console.error('Failed to create compliance record:', complianceError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        complianceStandard,
        targetMarket,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Compliance analysis error:', error)
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