import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Zap, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  TrendingUp
} from "lucide-react"

const mockSensors = [
  {
    id: 'sensor-001',
    name: 'Temperature Sensor A1',
    type: 'temperature',
    location: 'Field A - Zone 1',
    status: 'online',
    value: '24.5°C',
    battery: 85
  },
  {
    id: 'sensor-002',
    name: 'Soil Moisture B2',
    type: 'moisture',
    location: 'Field B - Zone 2',
    status: 'online',
    value: '68%',
    battery: 72
  }
]

export default function IoTMonitoring() {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />
      case 'moisture': return <Droplets className="h-5 w-5" />
      case 'wind': return <Wind className="h-5 w-5" />
      default: return <Sun className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Online</Badge>
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IoT Monitoring</h1>
          <p className="text-muted-foreground">Real-time sensor data and environmental monitoring</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Zap className="h-4 w-4 mr-2" />
          Add Sensor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Sensors</p>
                <p className="text-2xl font-bold">12/15</p>
              </div>
              <Wifi className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold">24.5°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soil Moisture</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Droplets className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSensors.map((sensor) => (
              <Card key={sensor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSensorIcon(sensor.type)}
                      <CardTitle className="text-lg">{sensor.name}</CardTitle>
                    </div>
                    {sensor.status === 'online' ? 
                      <Wifi className="h-4 w-4 text-success" /> : 
                      <WifiOff className="h-4 w-4 text-destructive" />
                    }
                  </div>
                  <CardDescription>{sensor.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {getStatusBadge(sensor.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Value:</span>
                    <span className="font-medium">{sensor.value}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Battery:</span>
                      <span>{sensor.battery}%</span>
                    </div>
                    <Progress value={sensor.battery} className="h-2" />
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Trends
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Parameters</CardTitle>
              <CardDescription>Current environmental conditions and optimal ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Environmental Data</h3>
                <p className="text-muted-foreground">Real-time environmental monitoring dashboard</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Data Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Historical trends, correlations, and predictive analytics
                </p>
                <Button>View Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}