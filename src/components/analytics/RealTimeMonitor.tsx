import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealTimeData } from "@/hooks/useRealTimeData"
import { useIoTData } from "@/hooks/useIoTData"
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Thermometer, 
  Droplets, 
  Zap,
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function RealTimeMonitor() {
  const { realTimeData, isConnected, simulateReading } = useRealTimeData()
  const { sensors } = useIoTData()

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Data Stream
            </CardTitle>
            <CardDescription>Live sensor readings and updates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "secondary" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button size="sm" onClick={handleSimulateData} disabled={sensors.length === 0}>
              <Zap className="h-4 w-4 mr-1" />
              Simulate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {realTimeData.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Real-Time Data</h3>
            <p className="text-muted-foreground mb-4">
              Waiting for sensor readings to stream in real-time
            </p>
            {sensors.length > 0 && (
              <Button onClick={handleSimulateData}>
                <Zap className="h-4 w-4 mr-2" />
                Generate Sample Data
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realTimeData.slice(0, 20).map((reading) => {
              const sensor = sensors.find(s => s.id === reading.sensor_id)
              return (
                <div 
                  key={reading.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(reading.data_type)}
                    <div>
                      <p className="font-medium">{sensor?.name || 'Unknown Sensor'}</p>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}