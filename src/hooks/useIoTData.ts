import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type Sensor = Database['public']['Tables']['iot_sensors']['Row']
type SensorReading = Database['public']['Tables']['sensor_readings']['Row']

interface SensorWithLatestReading extends Sensor {
  latest_reading?: SensorReading
  status: 'online' | 'offline' | 'warning'
  battery?: number
}

export function useIoTData() {
  const [sensors, setSensors] = useState<SensorWithLatestReading[]>([])
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])
  const { toast } = useToast()

  // Fetch sensors and their latest readings
  const fetchSensors = async () => {
    try {
      const { data: sensorsData, error } = await supabase
        .from('iot_sensors')
        .select(`
          *,
          sensor_readings(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedSensors = sensorsData?.map(sensor => {
        const latestReading = sensor.sensor_readings?.[0]
        const isOnline = sensor.last_reading_at && 
          new Date(sensor.last_reading_at).getTime() > Date.now() - 5 * 60 * 1000 // 5 minutes
        
        return {
          ...sensor,
          latest_reading: latestReading,
          status: isOnline ? 'online' as const : 'offline' as const,
          battery: Math.floor(Math.random() * 40 + 60) // Mock battery level
        }
      }) || []

      setSensors(enrichedSensors)
    } catch (error) {
      console.error('Error fetching sensors:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sensor data",
        variant: "destructive"
      })
    }
  }

  // Fetch recent readings for charts
  const fetchRecentReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select(`
          *,
          iot_sensors(name, type)
        `)
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error
      setReadings(data || [])
    } catch (error) {
      console.error('Error fetching readings:', error)
    }
  }

  // Fetch recent alerts
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('export_documents')
        .select('*')
        .eq('document_type', 'sensor_alert')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchSensors(), fetchRecentReadings(), fetchAlerts()])
      setLoading(false)
    }

    fetchData()

    // Subscribe to sensor readings updates
    const readingsChannel = supabase
      .channel('sensor-readings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as SensorReading
          setReadings(prev => [newReading, ...prev.slice(0, 99)])
          
          // Update sensor status
          setSensors(prev => prev.map(sensor => 
            sensor.id === newReading.sensor_id 
              ? { ...sensor, latest_reading: newReading, status: 'online' as const }
              : sensor
          ))

          toast({
            title: "New sensor data",
            description: `Received reading from sensor`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'iot_sensors'
        },
        () => {
          fetchSensors()
        }
      )
      .subscribe()

    // Subscribe to alerts
    const alertsChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'export_documents',
          filter: 'document_type=eq.sensor_alert'
        },
        (payload) => {
          const newAlert = payload.new
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
          
          toast({
            title: "⚠️ Sensor Alert",
            description: newAlert.title,
            variant: "destructive"
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(readingsChannel)
      supabase.removeChannel(alertsChannel)
    }
  }, [toast])

  // Generate demo data for testing
  const generateDemoData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Generate demo sensors directly since the edge function might not exist
      const demoSensors = [
        { name: 'Temperature Sensor 1', type: 'temperature' as const, location_description: 'Greenhouse A' },
        { name: 'Humidity Sensor 1', type: 'humidity' as const, location_description: 'Greenhouse A' },
        { name: 'Soil Moisture Sensor 1', type: 'soil_moisture' as const, location_description: 'Field B' },
        { name: 'pH Sensor 1', type: 'ph' as const, location_description: 'Field B' }
      ]

      // First, get user's farm
      const { data: farms, error: farmError } = await supabase
        .from('farms')
        .select('id')
        .limit(1)

      if (farmError) throw farmError
      
      let farmId = farms?.[0]?.id
      
      // Create a demo farm if none exists
      if (!farmId) {
        const { data: newFarm, error: newFarmError } = await supabase
          .from('farms')
          .insert({
            name: 'Demo Farm',
            description: 'Demonstration farm for IoT monitoring',
            location_address: 'Demo Location',
            size_hectares: 10,
            user_id: user.id
          })
          .select('id')
          .single()

        if (newFarmError) throw newFarmError
        farmId = newFarm.id
      }

      // Create demo sensors
      const { data: createdSensors, error: sensorError } = await supabase
        .from('iot_sensors')
        .insert(
          demoSensors.map(sensor => ({
            ...sensor,
            farm_id: farmId,
            is_active: true,
            latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.01
          }))
        )
        .select()

      if (sensorError) throw sensorError

      // Generate sample readings for each sensor
      for (const sensor of createdSensors) {
        const readings = []
        const now = new Date()
        
        // Create 10 readings over the last hour
        for (let i = 0; i < 10; i++) {
          const timestamp = new Date(now.getTime() - (i * 6 * 60 * 1000)) // Every 6 minutes
          let value = 0
          let unit = ''
          
          switch (sensor.type) {
            case 'temperature':
              value = 20 + Math.random() * 15 // 20-35°C
              unit = '°C'
              break
            case 'humidity':
              value = 40 + Math.random() * 40 // 40-80%
              unit = '%'
              break
            case 'soil_moisture':
              value = 30 + Math.random() * 50 // 30-80%
              unit = '%'
              break
            case 'ph':
              value = 6 + Math.random() * 2 // 6-8 pH
              unit = 'pH'
              break
          }
          
          readings.push({
            sensor_id: sensor.id,
            value: parseFloat(value.toFixed(2)),
            unit,
            timestamp: timestamp.toISOString(),
            metadata: { demo: true, batch: i }
          })
        }
        
        // Insert readings
        await supabase.from('sensor_readings').insert(readings)
      }
      
      toast({
        title: "✅ Demo Data Generated",
        description: `Created ${createdSensors.length} sensors with sample readings`,
      })
      
      // Refresh data after generation
      setTimeout(() => {
        fetchSensors()
        fetchRecentReadings()
        fetchAlerts()
      }, 1000)
    } catch (error) {
      console.error('Error generating demo data:', error)
      toast({
        title: "Error",
        description: "Failed to generate demo data",
        variant: "destructive"
      })
    }
  }

  return {
    sensors,
    readings,
    alerts,
    loading,
    refetch: () => {
      fetchSensors()
      fetchRecentReadings()
      fetchAlerts()
    },
    generateDemoData
  }
}