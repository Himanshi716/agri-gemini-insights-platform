import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface WeatherData {
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    description: string
    icon: string
    pressure?: number
    visibility?: number
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    description: string
    icon?: string
    rainfall: number
    humidity?: number
    windSpeed?: number
  }>
  alerts: Array<{
    type: 'info' | 'warning' | 'alert'
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  location?: string
  timestamp: string
}

interface MarketData {
  marketData: Record<string, {
    price: number
    change: number
    trend: 'up' | 'down'
    volume: number
    lastUpdate: string
  }>
  insights: Array<{
    type: 'opportunity' | 'alert' | 'forecast'
    message: string
    priority: 'low' | 'medium' | 'high'
  }>
  exportOpportunities: Array<{
    crop: string
    destination: string
    price: number
    demand: 'low' | 'medium' | 'high'
    requirements: string[]
  }>
  timestamp: string
}

export function useExternalData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchWeatherData = async (location: string, farmId?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('weather-intelligence', {
        body: {
          location,
          farmId,
          userId: user?.id
        }
      })

      if (error) throw error

      setWeatherData(data)
      return data
    } catch (error) {
      console.error('Weather data error:', error)
      toast({
        title: "Weather Error",
        description: "Failed to fetch weather data",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketData = async (crops: string[], region = 'global', farmId?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          crops,
          region,
          farmId,
          userId: user?.id
        }
      })

      if (error) throw error

      setMarketData(data)
      return data
    } catch (error) {
      console.error('Market data error:', error)
      toast({
        title: "Market Data Error", 
        description: "Failed to fetch market intelligence",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh data every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (weatherData) {
        const lastUpdate = new Date(weatherData.timestamp)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
        
        if (diffMinutes > 30) {
          // Refresh weather data if available
          fetchWeatherData(weatherData.location || 'California, US')
        }
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [weatherData])

  return {
    weatherData,
    marketData,
    loading,
    fetchWeatherData,
    fetchMarketData
  }
}