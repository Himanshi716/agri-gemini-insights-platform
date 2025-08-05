import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useIoTWebSocket } from './useIoTWebSocket'

interface StreamData {
  id: string
  sensor_id: string
  device_id?: string
  data_type: string
  value: number
  unit: string
  quality_score: number
  timestamp: string
  metadata: any
  stream_sequence: number
}

interface AggregateData {
  id: string
  sensor_id: string
  data_type: string
  aggregation_type: string
  time_bucket: string
  count_readings: number
  min_value: number
  max_value: number
  avg_value: number
  sum_value: number
  first_reading: string
  last_reading: string
}

export function useIoTDataStream() {
  const [streamData, setStreamData] = useState<StreamData[]>([])
  const [aggregateData, setAggregateData] = useState<AggregateData[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSensors, setHasSensors] = useState(false)
  const { toast } = useToast()
  const { 
    isConnected, 
    realtimeReadings, 
    subscribeSensor, 
    unsubscribeSensor,
    sendDataBatch,
    connect
  } = useIoTWebSocket()

  // Fetch recent stream data
  const fetchStreamData = async (sensorId?: string, limit = 100) => {
    try {
      let query = supabase
        .from('iot_data_stream')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (sensorId) {
        query = query.eq('sensor_id', sensorId)
      }

      const { data, error } = await query

      if (error) throw error
      setStreamData(data || [])
    } catch (error) {
      console.error('Error fetching stream data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch stream data",
        variant: "destructive"
      })
    }
  }

  // Fetch aggregate data
  const fetchAggregateData = async (
    aggregationType: 'hourly' | 'daily' | 'weekly' = 'hourly',
    sensorId?: string,
    limit = 50
  ) => {
    try {
      let query = supabase
        .from('iot_data_aggregates')
        .select('*')
        .eq('aggregation_type', aggregationType)
        .order('time_bucket', { ascending: false })
        .limit(limit)

      if (sensorId) {
        query = query.eq('sensor_id', sensorId)
      }

      const { data, error } = await query

      if (error) throw error
      setAggregateData(data || [])
    } catch (error) {
      console.error('Error fetching aggregate data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch aggregate data",
        variant: "destructive"
      })
    }
  }

  // Generate data aggregates
  const generateAggregates = async (period: 'hourly' | 'daily' | 'weekly' = 'hourly') => {
    try {
      const { data, error } = await supabase.rpc('aggregate_iot_data', {
        aggregation_period: period
      })

      if (error) throw error
      
      toast({
        title: "✅ Aggregation Complete",
        description: `Processed ${data} data points for ${period} aggregation`,
      })

      // Refresh aggregate data
      await fetchAggregateData(period)
    } catch (error) {
      console.error('Error generating aggregates:', error)
      toast({
        title: "Error",
        description: "Failed to generate data aggregates",
        variant: "destructive"
      })
    }
  }

  // Simulate high-frequency data ingestion
  const simulateDataStream = async (sensorId: string, duration = 60000) => {
    if (!isConnected) {
      toast({
        title: "⚠️ Not Connected",
        description: "WebSocket connection required for data streaming",
        variant: "destructive"
      })
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      
      if (elapsed >= duration) {
        clearInterval(interval)
        toast({
          title: "🏁 Simulation Complete",
          description: `Data stream simulation finished for sensor ${sensorId}`,
        })
        return
      }

      // Generate realistic sensor data based on time of day
      const now = new Date()
      const hour = now.getHours()
      
      // Simulate temperature with daily cycle
      const baseTemp = 20 + Math.sin((hour / 24) * 2 * Math.PI) * 10
      const tempVariation = (Math.random() - 0.5) * 4
      const temperature = baseTemp + tempVariation

      // Simulate humidity inversely related to temperature
      const humidity = Math.max(30, Math.min(90, 80 - (temperature - 20) * 2 + (Math.random() - 0.5) * 10))

      const readings = [
        {
          data_type: 'temperature',
          value: parseFloat(temperature.toFixed(2)),
          unit: '°C',
          quality_score: Math.floor(Math.random() * 20) + 80, // 80-100%
          metadata: { simulation: true, cycle: Math.floor(elapsed / 5000) }
        },
        {
          data_type: 'humidity',
          value: parseFloat(humidity.toFixed(2)),
          unit: '%',
          quality_score: Math.floor(Math.random() * 20) + 80,
          metadata: { simulation: true, cycle: Math.floor(elapsed / 5000) }
        }
      ]

      sendDataBatch({
        sensor_id: sensorId,
        readings,
        batch_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    }, 2000) // Every 2 seconds

    toast({
      title: "🚀 Data Stream Started",
      description: `Simulating high-frequency data for ${duration / 1000}s`,
    })
  }

  // Set up real-time subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([
        checkSensors(),
        fetchStreamData(),
        fetchAggregateData()
      ])
      setLoading(false)
    }

    fetchData()

    // Subscribe to stream data updates
    const streamChannel = supabase
      .channel('iot-data-stream-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iot_data_stream'
        },
        (payload) => {
          const newData = payload.new as StreamData
          setStreamData(prev => [newData, ...prev.slice(0, 99)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(streamChannel)
    }
  }, [])

  // Update stream data when new realtime readings arrive
  useEffect(() => {
    if (realtimeReadings.length > 0) {
      // Refresh stream data to get the latest entries
      fetchStreamData()
    }
  }, [realtimeReadings])

  // Check if user has sensors before connecting WebSocket
  const checkSensors = async () => {
    try {
      const { count } = await supabase
        .from('iot_sensors')
        .select('*', { count: 'exact', head: true })
      
      const sensorsExist = (count || 0) > 0
      setHasSensors(sensorsExist)
      return sensorsExist
    } catch (error) {
      console.error('Error checking sensors:', error)
      return false
    }
  }

  // Enhanced WebSocket management with sensor check
  const connectIfNeeded = async () => {
    const sensorsExist = await checkSensors()
    if (sensorsExist && !isConnected) {
      connect()
    } else if (!sensorsExist) {
      toast({
        title: "No Sensors Found",
        description: "Add sensors first before connecting to the live stream",
        variant: "destructive"
      })
    }
  }

  return {
    streamData,
    aggregateData,
    realtimeReadings,
    isWebSocketConnected: isConnected,
    loading,
    hasSensors,
    subscribeSensor,
    unsubscribeSensor,
    sendDataBatch,
    fetchStreamData,
    fetchAggregateData,
    generateAggregates,
    simulateDataStream,
    connectIfNeeded,
    checkSensors
  }
}