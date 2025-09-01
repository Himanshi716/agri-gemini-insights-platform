import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: any
}

interface AIAnalysis {
  type: 'crop_analysis' | 'compliance_check' | 'general_advice'
  analysis: string
  recommendations: string[]
  confidence: number
  data_sources?: string[]
}

export function useAdvancedAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const sendMessage = useCallback(async (content: string, imageData?: string, context?: any) => {
    if (!content.trim()) return

    setIsLoading(true)
    
    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: { hasImage: !!imageData, context }
    })

    try {
      const { data, error } = await supabase.functions.invoke('farmer-assistant', {
        body: {
          message: content,
          image_data: imageData,
          context: context,
          conversation_history: messages.slice(-5) // Last 5 messages for context
        }
      })

      if (error) throw error

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.analysis
      })

      setIsConnected(true)
    } catch (error) {
      console.error('Error sending message:', error)
      
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: { error: true }
      })

      toast({
        title: "Assistant Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [messages, addMessage, toast])

  const analyzeCropImage = useCallback(async (imageData: string, cropType?: string, location?: string) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('crop-vision-analysis', {
        body: {
          image_data: imageData,
          crop_type: cropType,
          location: location,
          analysis_type: 'comprehensive'
        }
      })

      if (error) throw error

      const analysis: AIAnalysis = {
        type: 'crop_analysis',
        analysis: data.analysis,
        recommendations: data.recommendations || [],
        confidence: data.confidence || 0,
        data_sources: data.data_sources
      }

      addMessage({
        role: 'assistant',
        content: `## Crop Analysis Results\n\n${data.analysis}\n\n### Recommendations:\n${data.recommendations?.map((r: string) => `• ${r}`).join('\n') || 'No specific recommendations at this time.'}`,
        timestamp: new Date(),
        metadata: analysis
      })

      return analysis
    } catch (error) {
      console.error('Error analyzing crop image:', error)
      toast({
        title: "Analysis Error",
        description: "Failed to analyze crop image",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, toast])

  const generateComplianceReport = useCallback(async (farmId: string, standards: string[]) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('compliance-analysis', {
        body: {
          farm_id: farmId,
          standards: standards,
          include_recommendations: true
        }
      })

      if (error) throw error

      addMessage({
        role: 'assistant',
        content: `## Compliance Analysis\n\n${data.analysis}\n\n### Compliance Score: ${data.score}/100\n\n### Action Items:\n${data.action_items?.map((item: string) => `• ${item}`).join('\n') || 'No immediate actions required.'}`,
        timestamp: new Date(),
        metadata: {
          type: 'compliance_check',
          analysis: data.analysis,
          recommendations: data.action_items || [],
          confidence: data.score / 100
        }
      })

      return data
    } catch (error) {
      console.error('Error generating compliance report:', error)
      toast({
        title: "Compliance Error",
        description: "Failed to generate compliance report",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, toast])

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    analyzeCropImage,
    generateComplianceReport,
    clearChat,
    addMessage
  }
}