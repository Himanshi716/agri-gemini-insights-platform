import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplets, Wind, Sun, Wifi, WifiOff, AlertTriangle } from "lucide-react"

export default function IoTMonitoring() {
  const sensors = [
    {
      id: 1,
      name: "Temperature Sensor A1",
      type: "temperature",
      value: "24.5°C",
      status: "online",
      location: "Field A - Zone 1",
      lastReading: "2 min ago",
      icon: Thermometer
    },
    {
      id: 2,
      name: "Soil Moisture B2",
      type: "moisture",
      value: "68%",
      status: "online", 
      location: "Field B - Zone 2",
      lastReading: "1 min ago",
      icon: Droplets
    },
    {
      id: 3,
      name: "Wind Speed C1",
      type: "wind",
      value: "12 km/h",
      status: "offline",
      location: "Field C - Zone 1", 
      lastReading: "15 min ago",
      icon: Wind
    },
    {
      id: 4,
      name: "Light Intensity D1",
      type: "light",
      value: "850 lux",
      status: "warning",
      location: "Greenhouse D",
      lastReading: "30 sec ago", 
      icon: Sun
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "default"
      case "offline": return "destructive"
      case "warning": return "secondary"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return Wifi
      case "offline": return WifiOff
      case "warning": return AlertTriangle
      default: return Wifi
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IoT Monitoring</h1>
          <p className="text-muted-foreground">Real-time sensor data from your farms</p>
        </div>
        <Button>Add Sensor</Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">Online and collecting data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offline Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Points Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">Collected in last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const IconComponent = sensor.icon
          const StatusIcon = getStatusIcon(sensor.status)
          
          return (
            <Card key={sensor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{sensor.name}</CardTitle>
                      <CardDescription className="text-xs">{sensor.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StatusIcon className="h-3 w-3" />
                    <Badge variant={getStatusColor(sensor.status)} className="text-xs">
                      {sensor.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{sensor.value}</div>
                  <p className="text-xs text-muted-foreground">Current reading</p>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  Last updated: {sensor.lastReading}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View History
                  </Button>
                  <Button size="sm" className="flex-1">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}