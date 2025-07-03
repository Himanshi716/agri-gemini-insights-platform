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
    const { document, documentType, farmId, extractionType = 'general' } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Processing document intelligence for type:', documentType)

    // Customize prompt based on extraction type
    const getPrompt = (type: string) => {
      const basePrompt = `You are an expert document analysis AI specializing in agricultural and export documentation.`

      switch (type) {
        case 'compliance':
          return `${basePrompt}

Extract and validate compliance information from this document:

1. **Certificate Details**:
   - Certificate name/type
   - Issuing authority
   - Certificate number
   - Issue date and expiry date
   - Status (valid/expired/pending)

2. **Standards & Requirements**:
   - Compliance standards met
   - Requirements fulfilled
   - Any gaps or missing items

3. **Validation**:
   - Document authenticity indicators
   - Required signatures/seals present
   - Completeness assessment

4. **Next Actions**:
   - Renewal requirements
   - Missing documentation
   - Compliance deadlines

Return structured JSON data with these fields.`

        case 'export':
          return `${basePrompt}

Extract export documentation data:

1. **Shipment Details**:
   - Product information
   - Quantities and weights
   - Origin and destination
   - Shipping dates

2. **Quality Information**:
   - Grade/quality standards
   - Testing results
   - Certifications attached

3. **Regulatory Data**:
   - Export licenses
   - Phytosanitary certificates
   - Country-specific requirements

4. **Financial Data**:
   - Values and pricing
   - Currency information
   - Payment terms

Return as structured JSON.`

        default:
          return `${basePrompt}

Perform comprehensive document analysis:

1. **Document Type**: Identify the document type and purpose
2. **Key Information**: Extract all important data points
3. **Data Validation**: Check for completeness and consistency
4. **Structured Output**: Organize information logically
5. **Action Items**: Identify any follow-up actions needed

Return structured data that can be easily processed.`
      }
    }

    const prompt = getPrompt(extractionType)

    // Determine if it's an image or text document
    const isImage = document.startsWith('data:image')
    
    const requestBody: any = {
      contents: [{
        parts: isImage 
          ? [
              { text: prompt },
              {
                inline_data: {
                  mime_type: document.includes('png') ? "image/png" : "image/jpeg",
                  data: document.split(',')[1]
                }
              }
            ]
          : [{ text: `${prompt}\n\nDocument Content:\n${document}` }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const extractedData = data.candidates[0].content.parts[0].text

    // Try to parse as JSON, fallback to text
    let structuredData
    try {
      structuredData = JSON.parse(extractedData)
    } catch {
      structuredData = { raw_analysis: extractedData }
    }

    // Save extracted data to database
    if (farmId) {
      const { error: dbError } = await supabase
        .from('export_documents')
        .insert({
          farm_id: farmId,
          document_type: `document_analysis_${extractionType}`,
          title: `Document Analysis - ${documentType} - ${new Date().toLocaleDateString()}`,
          content: {
            extracted_data: structuredData,
            document_type: documentType,
            extraction_type: extractionType,
            timestamp: new Date().toISOString()
          },
          status: 'approved'
        })

      if (dbError) {
        console.error('Failed to save document analysis:', dbError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData: structuredData,
        documentType,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Document intelligence error:', error)
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