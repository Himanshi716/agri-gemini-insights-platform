import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

interface IoTReading {
  sensor_id: string
  sensor_name: string
  sensor_type: string
  reading: {
    id: string
    value: number
    unit: string
    timestamp: string
    metadata?: any
  }
  timestamp: string
}

interface WebSocketMessage {
  type: string
  [key: string]: any
}

export function useIoTWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeReadings, setRealtimeReadings] = useState<IoTReading[]>([])
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const maxReconnectAttempts = 3
  const reconnectAttempts = useRef(0)
  const connectionRef = useRef<boolean>(false)
  const lastNotificationRef = useRef<number>(0)
  const notificationCooldown = 5000 // 5 seconds between notifications

  const showNotification = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    const now = Date.now()
    if (now - lastNotificationRef.current > notificationCooldown) {
      toast({ title, description, variant })
      lastNotificationRef.current = now
    }
  }, [toast])

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (connectionRef.current) {
      console.log('Connection already in progress, skipping...')
      return
    }
    
    connectionRef.current = true
    
    try {
      const wsUrl = `wss://ugtfatgzpclrmgjhitqm.functions.supabase.co/functions/v1/iot-websocket-stream`
      console.log('Connecting to IoT WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('IoT WebSocket connected')
        connectionRef.current = false
        setIsConnected(true)
        reconnectAttempts.current = 0
        
        showNotification(
          "🔌 IoT Stream Connected",
          "Real-time sensor data streaming active"
        )
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('IoT WebSocket disconnected:', event.code, event.reason)
        connectionRef.current = false
        setIsConnected(false)
        setSocket(null)

        // Only attempt to reconnect for unexpected closures
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current), 30000) // Longer delays
          reconnectAttempts.current++
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          showNotification(
            "❌ Connection Failed",
            "IoT stream temporarily unavailable",
            "destructive"
          )
        }
      }

      ws.onerror = (error) => {
        console.error('IoT WebSocket error:', error)
        connectionRef.current = false
        
        // Only show error notification if we haven't shown one recently
        showNotification(
          "⚠️ Connection Issue",
          "IoT stream connection interrupted",
          "destructive"
        )
      }

      setSocket(ws)
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      toast({
        title: "❌ Connection Failed",
        description: "Unable to establish IoT stream connection",
        variant: "destructive"
      })
    }
  }, [toast])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect')
    }
    
    setSocket(null)
    setIsConnected(false)
    setSubscriptions(new Set())
  }, [socket])

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log('IoT stream connection established:', message.message)
        break

      case 'realtime_reading':
        if (message.sensor_id && message.sensor_name && message.reading) {
          const reading: IoTReading = {
            sensor_id: message.sensor_id,
            sensor_name: message.sensor_name,
            sensor_type: message.sensor_type,
            reading: message.reading,
            timestamp: message.timestamp
          }
          setRealtimeReadings(prev => [reading, ...prev.slice(0, 99)]) // Keep last 100
        }
        break

      case 'subscription_confirmed':
        console.log(`Subscribed to sensor: ${message.sensor_name} (${message.sensor_id})`)
        toast({
          title: "📡 Sensor Subscribed",
          description: `Now streaming data from ${message.sensor_name}`,
        })
        break

      case 'subscription_error':
        console.error('Subscription error:', message.message)
        toast({
          title: "❌ Subscription Failed",
          description: message.message,
          variant: "destructive"
        })
        break

      case 'batch_processed':
        console.log(`Batch processed: ${message.processed_count} readings from sensor ${message.sensor_id}`)
        break

      case 'batch_error':
        console.error('Batch processing error:', message.message)
        break

      case 'pong':
        // Heartbeat response
        break

      case 'error':
        console.error('WebSocket error:', message.message)
        toast({
          title: "⚠️ Stream Error",
          description: message.message,
          variant: "destructive"
        })
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }, [toast])

  const subscribeSensor = useCallback((sensorId: string) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'subscribe_sensor',
        sensor_id: sensorId
      }))
      
      setSubscriptions(prev => new Set([...prev, sensorId]))
    }
  }, [socket, isConnected])

  const unsubscribeSensor = useCallback((sensorId: string) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'unsubscribe_sensor',
        sensor_id: sensorId
      }))
      
      setSubscriptions(prev => {
        const newSet = new Set(prev)
        newSet.delete(sensorId)
        return newSet
      })
    }
  }, [socket, isConnected])

  const sendDataBatch = useCallback((packet: {
    sensor_id: string
    device_id?: string
    readings: Array<{
      data_type: string
      value: number
      unit: string
      timestamp?: string
      quality_score?: number
      metadata?: any
    }>
    batch_id?: string
  }) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'iot_data_batch',
        packet
      }))
    }
  }, [socket, isConnected])

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (socket && isConnected) {
      const heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000) // Every 30 seconds

      return () => clearInterval(heartbeat)
    }
  }, [socket, isConnected])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    realtimeReadings,
    subscriptions: Array.from(subscriptions),
    subscribeSensor,
    unsubscribeSensor,
    sendDataBatch,
    connect,
    disconnect
  }
}
