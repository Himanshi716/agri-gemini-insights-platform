
import { useState } from 'react'
import { geminiService, GeminiTextRequest, GeminiVisionRequest, GeminiResponse } from '@/services/gemini'

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateText = async (request: GeminiTextRequest): Promise<GeminiResponse> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await geminiService.generateText(request)
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

  const analyzeImage = async (request: GeminiVisionRequest): Promise<GeminiResponse> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await geminiService.analyzeImage(request)
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

  const isConfigured = geminiService.isConfigured()

  return {
    generateText,
    analyzeImage,
    isLoading,
    error,
    isConfigured
  }
}
