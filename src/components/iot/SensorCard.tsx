import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  TestTube,
  Gauge,
  Signal, 
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SensorCardProps {
  sensor: {
    id: string
    name: string
    type: string
    location_description?: string
    status: 'online' | 'offline' | 'warning'
    latest_reading?: {
      value: number
      unit: string
      timestamp: string
    }
    battery?: number
  }
  onViewTrends: (sensorId: string) => void
}

export function SensorCard({ sensor, onViewTrends }: SensorCardProps) {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />
      case 'humidity': return <Droplets className="h-5 w-5" />
      case 'soil_moisture': return <Droplets className="h-5 w-5" />
      case 'ph': return <TestTube className="h-5 w-5" />
      case 'light': return <Sun className="h-5 w-5" />
      case 'co2': return <Gauge className="h-5 w-5" />
      case 'wind': return <Wind className="h-5 w-5" />
      default: return <Gauge className="h-5 w-5" />
    }
  }

  const getSignalIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <SignalHigh className="h-4 w-4 text-success" />
      case 'warning':
        return <SignalMedium className="h-4 w-4 text-warning" />
      case 'offline':
        return <SignalZero className="h-4 w-4 text-destructive" />
      default:
        return <SignalLow className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Online</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Warning</Badge>
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getBatteryColor = (battery?: number) => {
    if (!battery) return "bg-muted"
    if (battery > 60) return "bg-success"
    if (battery > 30) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      sensor.status === 'offline' && "opacity-75",
      sensor.status === 'warning' && "border-warning/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSensorIcon(sensor.type)}
            <CardTitle className="text-lg">{sensor.name}</CardTitle>
            {sensor.status === 'warning' && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
          {getSignalIcon(sensor.status)}
        </div>
        <CardDescription>{sensor.location_description || 'No location set'}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(sensor.status)}
        </div>
        
        {sensor.latest_reading ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Value:</span>
            <span className="font-medium text-lg">
              {sensor.latest_reading.value}{sensor.latest_reading.unit}
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2">
            No recent readings
          </div>
        )}

        {sensor.latest_reading && (
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(sensor.latest_reading.timestamp).toLocaleString()}
          </div>
        )}
        
        {sensor.battery && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Battery:</span>
              <span>{sensor.battery}%</span>
            </div>
            <Progress 
              value={sensor.battery} 
              className={cn("h-2", getBatteryColor(sensor.battery))}
            />
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full"
          onClick={() => onViewTrends(sensor.id)}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Trends
        </Button>
      </CardContent>
    </Card>
  )
}