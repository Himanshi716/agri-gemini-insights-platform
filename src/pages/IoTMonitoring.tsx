import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Thermometer, 
  Droplets,
  Zap, 
  Wifi, 
  AlertTriangle,
  Activity,
  Database,
  RefreshCw
} from "lucide-react"
import { useIoTData } from "@/hooks/useIoTData"
import { SensorCard } from "@/components/iot/SensorCard"
import { SensorChart } from "@/components/iot/SensorChart"
import { AlertsList } from "@/components/iot/AlertsList"
import { MetricsCard } from "@/components/dashboard/MetricsCard"
import { useState } from "react"
import { AddSensorDialog } from "@/components/iot/AddSensorDialog"

export default function IoTMonitoring() {
  const { sensors, readings, alerts, loading, refetch, generateDemoData } = useIoTData()
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const onlineSensors = sensors.filter(s => s.status === 'online').length
  const totalSensors = sensors.length
  const activeAlerts = alerts.filter(a => a.status === 'pending').length

  // Calculate average readings by type
  const getAverageReading = (type: string) => {
    const typeReadings = readings.filter(r => {
      const sensor = sensors.find(s => s.id === r.sensor_id)
      return sensor?.type === type
    })
    
    if (typeReadings.length === 0) return 'N/A'
    
    const avg = typeReadings.reduce((sum, r) => sum + Number(r.value), 0) / typeReadings.length
    const unit = typeReadings[0]?.unit || ''
    return `${avg.toFixed(1)}${unit}`
  }

  const handleViewTrends = (sensorId: string) => {
    setSelectedSensorId(selectedSensorId === sensorId ? null : sensorId)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Database className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading sensor data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IoT Monitoring</h1>
          <p className="text-muted-foreground">Real-time sensor data and environmental monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="h-4 w-4 mr-2" />
            Add Sensor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Online Sensors"
          value={`${onlineSensors}/${totalSensors}`}
          description={`${Math.round((onlineSensors/totalSensors) * 100)}% connectivity`}
          icon={Wifi}
          trend={onlineSensors === totalSensors ? 'up' : 'neutral'}
        />
        
        <MetricsCard
          title="Avg Temperature"
          value={getAverageReading('temperature')}
          description="Current conditions"
          icon={Thermometer}
        />
        
        <MetricsCard
          title="Soil Moisture"
          value={getAverageReading('soil_moisture')}
          description="Irrigation levels"
          icon={Droplets}
        />
        
        <MetricsCard
          title="Active Alerts"
          value={activeAlerts}
          description={activeAlerts > 0 ? "Requires attention" : "All systems normal"}
          icon={AlertTriangle}
          trend={activeAlerts > 0 ? 'down' : 'up'}
        />
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Sensors ({sensors.length})</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Data</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({activeAlerts})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          {sensors.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No Sensors Found</h3>
                  <p className="text-muted-foreground">
                    Get started by adding your first IoT sensor to monitor environmental conditions.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Zap className="h-4 w-4 mr-2" />
                      Add First Sensor
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={generateDemoData}
                      disabled={loading}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Generate Demo Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map((sensor) => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  onViewTrends={handleViewTrends}
                />
              ))}
            </div>
          )}

          {selectedSensorId && (
            <div className="mt-6">
              <SensorChart
                title="Sensor Trend Analysis"
                description="Real-time sensor data over time"
                data={readings.filter(r => r.sensor_id === selectedSensorId)}
                sensorType={sensors.find(s => s.id === selectedSensorId)?.type || 'unknown'}
                variant="area"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {['temperature', 'humidity', 'soil_moisture', 'ph'].map(type => {
              const typeReadings = readings.filter(r => {
                const sensor = sensors.find(s => s.id === r.sensor_id)
                return sensor?.type === type
              })
              
              return (
                <SensorChart
                  key={type}
                  title={`${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Trends`}
                  description={`Historical ${type.replace('_', ' ')} measurements`}
                  data={typeReadings}
                  sensorType={type}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsList alerts={alerts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Performance
                </CardTitle>
                <CardDescription>Overall IoT system health and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sensor Uptime</span>
                  <span className="font-medium">{Math.round((onlineSensors/totalSensors) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Points Today</span>
                  <span className="font-medium">{readings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alert Resolution Rate</span>
                  <span className="font-medium">94%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Insights</CardTitle>
                <CardDescription>AI-powered predictions and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and ML predictions will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddSensorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={refetch}
      />
    </div>
  )
}