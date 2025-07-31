import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface DocumentGenerationRequest {
  templateId: string
  farmId: string
  documentType: string
  data: Record<string, any>
  includeQR?: boolean
}

interface GeneratedDocument {
  id: string
  title: string
  content: string
  qr_code_data?: string
  blockchain_hash: string
  download_url: string
  created_at: string
}

export function useDocumentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateDocument = async (request: DocumentGenerationRequest): Promise<GeneratedDocument | null> => {
    setIsGenerating(true)
    
    try {
      console.log('Generating document with request:', request)
      
      const { data, error } = await supabase.functions.invoke('document-generator', {
        body: request
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.success) {
        throw new Error(data.error || 'Document generation failed')
      }

      toast({
        title: "Success",
        description: `Document "${data.document.title}" generated successfully`
      })

      return data.document
    } catch (error) {
      console.error('Document generation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
        variant: "destructive"
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const previewDocument = async (request: DocumentGenerationRequest): Promise<string | null> => {
    try {
      // For preview, we can call the same function but with a preview flag
      const previewRequest = { ...request, preview: true }
      
      const { data, error } = await supabase.functions.invoke('document-generator', {
        body: previewRequest
      })

      if (error || !data.success) {
        throw new Error(data?.error || 'Preview generation failed')
      }

      return data.document.content
    } catch (error) {
      console.error('Document preview error:', error)
      toast({
        title: "Error",
        description: "Failed to generate document preview",
        variant: "destructive"
      })
      return null
    }
  }

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('export_documents')
        .select('title, content')
        .eq('id', documentId)
        .single()

      if (error || !data) {
        throw new Error('Document not found')
      }

      // Create and download the document
      const content = typeof data.content === 'object' && data.content !== null 
        ? (data.content as any).document_content || JSON.stringify(data.content, null, 2)
        : String(data.content)
        
      const blob = new Blob([content], {
        type: 'text/plain'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      })
    } catch (error) {
      console.error('Document download error:', error)
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      })
    }
  }

  return {
    generateDocument,
    previewDocument,
    downloadDocument,
    isGenerating
  }
}