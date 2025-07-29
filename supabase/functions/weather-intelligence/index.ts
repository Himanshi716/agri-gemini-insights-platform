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
    const { location, farmId, userId } = await req.json()
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')

    if (!weatherApiKey) {
      console.log('Weather API key not configured, returning mock data')
      return new Response(
        JSON.stringify({
          success: true,
          current: {
            temperature: 22,
            humidity: 65,
            windSpeed: 8,
            description: "Partly cloudy",
            icon: "02d"
          },
          forecast: [
            { date: "2024-01-21", high: 25, low: 18, description: "Sunny", rainfall: 0 },
            { date: "2024-01-22", high: 23, low: 16, description: "Cloudy", rainfall: 2 },
            { date: "2024-01-23", high: 21, low: 15, description: "Light rain", rainfall: 5 }
          ],
          alerts: [
            { type: "info", message: "Configure OpenWeather API key for real weather data", severity: "low" }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching weather data for location:', location)

    // Get coordinates for location
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`
    )
    
    if (!geoResponse.ok) {
      throw new Error('Failed to get location coordinates')
    }

    const geoData = await geoResponse.json()
    if (geoData.length === 0) {
      throw new Error('Location not found')
    }

    const { lat, lon } = geoData[0]

    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`
    )

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current weather')
    }

    const currentData = await currentResponse.json()

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`
    )

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch weather forecast')
    }

    const forecastData = await forecastResponse.json()

    // Process current weather
    const current = {
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      pressure: currentData.main.pressure,
      visibility: currentData.visibility / 1000, // Convert to km
      uvIndex: 0 // Would need additional API call for UV data
    }

    // Process 5-day forecast (take one forecast per day at noon)
    const forecast = []
    const processedDates = new Set()
    
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]
      const hour = new Date(item.dt * 1000).getHours()
      
      if (!processedDates.has(date) && hour >= 12) {
        forecast.push({
          date,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          rainfall: item.rain?.['3h'] || 0,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6)
        })
        processedDates.add(date)
        
        if (forecast.length >= 5) break
      }
    }

    // Generate weather alerts and farming recommendations
    const alerts = []
    
    // Temperature alerts
    if (current.temperature > 35) {
      alerts.push({
        type: "warning",
        message: "High temperature alert. Consider increasing irrigation and providing shade for sensitive crops.",
        severity: "high"
      })
    } else if (current.temperature < 5) {
      alerts.push({
        type: "warning", 
        message: "Frost risk. Protect sensitive crops and consider covering young plants.",
        severity: "high"
      })
    }

    // Humidity alerts
    if (current.humidity > 85) {
      alerts.push({
        type: "info",
        message: "High humidity may increase disease pressure. Monitor crops for fungal issues.",
        severity: "medium"
      })
    }

    // Wind alerts
    if (current.windSpeed > 50) {
      alerts.push({
        type: "warning",
        message: "Strong winds expected. Secure equipment and check for crop damage.",
        severity: "high"
      })
    }

    // Rainfall forecast alerts
    const upcomingRain = forecast.reduce((total, day) => total + day.rainfall, 0)
    if (upcomingRain > 20) {
      alerts.push({
        type: "info",
        message: "Heavy rainfall expected. Adjust irrigation schedules and check drainage.",
        severity: "medium"
      })
    } else if (upcomingRain < 2) {
      alerts.push({
        type: "info",
        message: "Dry conditions ahead. Plan irrigation accordingly.",
        severity: "low"
      })
    }

    // Store weather data for historical tracking
    if (farmId) {
      const { error: logError } = await supabase
        .from('export_documents')
        .insert({
          farm_id: farmId,
          document_type: 'weather_data',
          title: `Weather Report - ${new Date().toLocaleDateString()}`,
          content: {
            current,
            forecast,
            alerts,
            location,
            timestamp: new Date().toISOString()
          },
          status: 'approved',
          generated_by: userId
        })

      if (logError) {
        console.error('Failed to log weather data:', logError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        current,
        forecast,
        alerts,
        location: geoData[0].name,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Weather service error:', error)
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