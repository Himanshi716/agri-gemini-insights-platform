import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface RealTimeReading {
  id: string
  sensor_id: string
  data_type: string
  value: number
  unit: string
  timestamp: string
  metadata?: any
}

export function useRealTimeData() {
  const [realTimeData, setRealTimeData] = useState<RealTimeReading[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel('real-time-data')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_data'
        },
        (payload) => {
          const newReading = payload.new as RealTimeReading
          setRealTimeData(prev => [newReading, ...prev.slice(0, 99)]) // Keep last 100 readings
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as any
          // Convert sensor_reading to real-time format
          const rtReading: RealTimeReading = {
            id: newReading.id,
            sensor_id: newReading.sensor_id,
            data_type: 'sensor_reading',
            value: newReading.value,
            unit: newReading.unit,
            timestamp: newReading.timestamp,
            metadata: newReading.metadata
          }
          setRealTimeData(prev => [rtReading, ...prev.slice(0, 99)])
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Fetch initial data
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('real_time_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (data && !error) {
        setRealTimeData(data)
      }
    }

    fetchInitialData()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const simulateReading = async (sensorId: string, dataType: string, value: number, unit: string) => {
    try {
      const { error } = await supabase
        .from('real_time_data')
        .insert({
          sensor_id: sensorId,
          data_type: dataType,
          value,
          unit,
          metadata: { simulated: true }
        })

      if (error) throw error
    } catch (error) {
      console.error('Error simulating reading:', error)
    }
  }

  return {
    realTimeData,
    isConnected,
    simulateReading
  }
}