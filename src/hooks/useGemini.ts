
import { useState } from 'react'
import { proprietaryAIService, ProprietaryAITextRequest, ProprietaryAIVisionRequest, ProprietaryAIResponse } from '@/services/gemini'

export function useAdvancedAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateText = async (request: ProprietaryAITextRequest): Promise<ProprietaryAIResponse> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await proprietaryAIService.generateText(request)
      if (!response.success && response.error) {
        setError(response.error)
      }
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate text'
      setError(errorMessage)
      return { text: '', success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeImage = async (request: ProprietaryAIVisionRequest): Promise<ProprietaryAIResponse> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await proprietaryAIService.analyzeImage(request)
      if (!response.success && response.error) {
        setError(response.error)
      }
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
      setError(errorMessage)
      return { text: '', success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const isConfigured = proprietaryAIService.isConfigured()

  return {
    generateText,
    analyzeImage,
    isLoading,
    error,
    isConfigured
  }
}
