import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useRealTimeData } from "@/hooks/useRealTimeData"
import { useIoTData } from "@/hooks/useIoTData"
import { useIoTDataStream } from "@/hooks/useIoTDataStream"
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Thermometer, 
  Droplets, 
  Zap,
  Clock,
  Signal,
  SignalHigh,
  TrendingUp,
  Play,
  Pause
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

export function RealTimeMonitor() {
  const { realTimeData, isConnected, simulateReading } = useRealTimeData()
  const { sensors } = useIoTData()
  const { 
    streamData, 
    realtimeReadings, 
    isWebSocketConnected,
    subscribeSensor,
    simulateDataStream 
  } = useIoTDataStream()
  
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [selectedSensors, setSelectedSensors] = useState<string[]>([])

  // Auto-subscribe to first sensor for demo
  useEffect(() => {
    if (isWebSocketConnected && sensors.length > 0 && selectedSensors.length === 0) {
      const firstSensorId = sensors[0].id
      subscribeSensor(firstSensorId)
      setSelectedSensors([firstSensorId])
    }
  }, [isWebSocketConnected, sensors, selectedSensors.length, subscribeSensor])

  const getIcon = (dataType: string) => {
    switch (dataType) {
      case 'temperature':
        return <Thermometer className="h-4 w-4" />
      case 'humidity':
      case 'soil_moisture':
        return <Droplets className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getValueColor = (dataType: string, value: number) => {
    switch (dataType) {
      case 'temperature':
        if (value > 35) return 'text-destructive'
        if (value < 10) return 'text-info'
        return 'text-success'
      case 'soil_moisture':
        if (value < 30) return 'text-warning'
        if (value > 80) return 'text-info'
        return 'text-success'
      default:
        return 'text-foreground'
    }
  }

  const handleSimulateData = () => {
    if (sensors.length > 0) {
      const randomSensor = sensors[Math.floor(Math.random() * sensors.length)]
      const dataTypes = ['temperature', 'humidity', 'soil_moisture', 'ph']
      const randomType = dataTypes[Math.floor(Math.random() * dataTypes.length)]
      
      let value: number
      let unit: string
      
      switch (randomType) {
        case 'temperature':
          value = Math.round((Math.random() * 20 + 15) * 10) / 10
          unit = '°C'
          break
        case 'humidity':
          value = Math.round(Math.random() * 40 + 40)
          unit = '%'
          break
        case 'soil_moisture':
          value = Math.round(Math.random() * 50 + 30)
          unit = '%'
          break
        case 'ph':
          value = Math.round((Math.random() * 3 + 5.5) * 10) / 10
          unit = 'pH'
          break
        default:
          value = Math.round(Math.random() * 100)
          unit = ''
      }
      
      simulateReading(randomSensor.id, randomType, value, unit)
    }
  }

  const handleWebSocketSimulate = () => {
    if (selectedSensors.length > 0 && isWebSocketConnected) {
      selectedSensors.forEach(sensorId => {
        simulateDataStream(sensorId, 30000) // 30 seconds of simulation
      })
    }
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  // Combine real-time data sources
  const combinedData = [
    ...realtimeReadings.map(r => ({
      id: r.sensor_id + r.timestamp,
      sensor_id: r.sensor_id,
      data_type: r.sensor_type,
      value: r.reading.value,
      unit: r.reading.unit,
      timestamp: r.timestamp,
      source: 'websocket' as const
    })),
    ...realTimeData.map(r => ({
      ...r,
      source: 'legacy' as const
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Enhanced Real-Time Monitor
            </CardTitle>
            <CardDescription>Live sensor readings with WebSocket streaming</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isWebSocketConnected ? "secondary" : "outline"} className="flex items-center gap-1">
              {isWebSocketConnected ? <SignalHigh className="h-3 w-3" /> : <Signal className="h-3 w-3" />}
              WebSocket {isWebSocketConnected ? 'Live' : 'Offline'}
            </Badge>
            <Badge variant={isConnected ? "secondary" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              Legacy {isConnected ? 'Connected' : 'Offline'}
            </Badge>
            <div className="flex items-center gap-2">
              <Switch checked={isMonitoring} onCheckedChange={toggleMonitoring} />
              <span className="text-sm">{isMonitoring ? 'Active' : 'Paused'}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button size="sm" onClick={handleSimulateData} disabled={sensors.length === 0}>
            <Zap className="h-4 w-4 mr-1" />
            Legacy Simulate
          </Button>
          <Button 
            size="sm" 
            onClick={handleWebSocketSimulate} 
            disabled={!isWebSocketConnected || selectedSensors.length === 0}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            WebSocket Stream
          </Button>
        </div>
        {combinedData.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Real-Time Data</h3>
            <p className="text-muted-foreground mb-4">
              Waiting for sensor readings to stream in real-time via WebSocket or legacy channels
            </p>
            {sensors.length > 0 && (
              <div className="flex justify-center gap-2">
                <Button onClick={handleSimulateData}>
                  <Zap className="h-4 w-4 mr-2" />
                  Legacy Simulate
                </Button>
                <Button onClick={handleWebSocketSimulate} disabled={!isWebSocketConnected}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  WebSocket Stream
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isMonitoring && combinedData.slice(0, 20).map((reading) => {
              const sensor = sensors.find(s => s.id === reading.sensor_id)
              return (
                <div 
                  key={reading.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(reading.data_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{sensor?.name || 'Unknown Sensor'}</p>
                        <Badge variant="outline" className="text-xs">
                          {reading.source}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {reading.data_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${getValueColor(reading.data_type, reading.value)}`}>
                      {reading.value}{reading.unit}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            
            {!isMonitoring && (
              <div className="text-center py-4 text-muted-foreground">
                <Pause className="h-8 w-8 mx-auto mb-2" />
                <p>Monitoring paused</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}