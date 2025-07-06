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
      const { data, error } = await supabase.functions.invoke('iot-simulator')
      
      if (error) throw error
      
      toast({
        title: "Demo Data Generated",
        description: `Generated readings for ${data?.data?.readings_generated || 0} sensors`,
      })
      
      // Refresh data after generation
      setTimeout(() => {
        fetchSensors()
        fetchRecentReadings()
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