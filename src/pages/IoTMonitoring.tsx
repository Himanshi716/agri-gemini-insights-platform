import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Thermometer, 
  Droplets,
  Zap, 
  Wifi, 
  AlertTriangle,
  Activity,
  Database,
  RefreshCw,
  Signal,
  SignalHigh,
  BarChart3,
  TrendingUp,
  Clock,
  Settings
} from "lucide-react"
import { useIoTData } from "@/hooks/useIoTData"
import { useIoTDataStream } from "@/hooks/useIoTDataStream"
import { SensorCard } from "@/components/iot/SensorCard"
import { SensorChart } from "@/components/iot/SensorChart"
import { AlertsList } from "@/components/iot/AlertsList"
import { MetricsCard } from "@/components/dashboard/MetricsCard"
import { useState } from "react"
import { AddSensorDialog } from "@/components/iot/AddSensorDialog"

export default function IoTMonitoring() {
  const { sensors, readings, alerts, loading, refetch, generateDemoData } = useIoTData()
  const { 
    streamData, 
    aggregateData, 
    realtimeReadings, 
    isWebSocketConnected,
    hasSensors,
    subscribeSensor,
    unsubscribeSensor,
    simulateDataStream,
    generateAggregates,
    connectIfNeeded
  } = useIoTDataStream()
  
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'realtime' | 'historical' | 'aggregated'>('realtime')
  const [aggregationPeriod, setAggregationPeriod] = useState<'hourly' | 'daily' | 'weekly'>('hourly')

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
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">Real-time sensor data and environmental monitoring</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {isWebSocketConnected ? (
                  <SignalHigh className="h-4 w-4 text-success" />
                ) : (
                  <Signal className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge variant={isWebSocketConnected ? "secondary" : "outline"} className="text-xs">
                  {isWebSocketConnected ? "Live Stream" : "Offline"}
                </Badge>
              </div>
              {realtimeReadings.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {realtimeReadings.length} live readings
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => generateAggregates(aggregationPeriod)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Aggregates
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

      {/* Data View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Data View:</span>
              </div>
              <Select value={viewMode} onValueChange={(value: 'realtime' | 'historical' | 'aggregated') => setViewMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4" />
                      Real-time
                    </div>
                  </SelectItem>
                  <SelectItem value="historical">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Historical
                    </div>
                  </SelectItem>
                  <SelectItem value="aggregated">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Aggregated
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {viewMode === 'aggregated' && (
                <Select value={aggregationPeriod} onValueChange={(value: 'hourly' | 'daily' | 'weekly') => setAggregationPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {viewMode === 'realtime' && `Stream: ${streamData.length} entries`}
                {viewMode === 'historical' && `Historical: ${readings.length} readings`}
                {viewMode === 'aggregated' && `Aggregated: ${aggregateData.length} buckets`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Sensors ({sensors.length})</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Data</TabsTrigger>
          <TabsTrigger value="stream">Live Stream</TabsTrigger>
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
                <div key={sensor.id} className="space-y-2">
                  <SensorCard
                    sensor={sensor}
                    onViewTrends={handleViewTrends}
                  />
                  <div className="flex gap-2">
                     <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        if (!isWebSocketConnected) {
                          await connectIfNeeded()
                        }
                        subscribeSensor(sensor.id)
                      }}
                    >
                      <Signal className="h-3 w-3 mr-1" />
                      {isWebSocketConnected ? 'Subscribe' : 'Connect & Subscribe'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        if (!isWebSocketConnected) {
                          await connectIfNeeded()
                        }
                        simulateDataStream(sensor.id, 30000)
                      }}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Simulate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSensorId && (
            <div className="mt-6">
              <SensorChart
                title="Sensor Trend Analysis"
                description={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} sensor data over time`}
                data={
                  viewMode === 'realtime' 
                    ? streamData.filter(d => d.sensor_id === selectedSensorId).map(d => ({
                        id: d.id,
                        sensor_id: d.sensor_id,
                        value: d.value,
                        unit: d.unit,
                        timestamp: d.timestamp,
                        metadata: d.metadata
                      }))
                    : readings.filter(r => r.sensor_id === selectedSensorId)
                }
                sensorType={sensors.find(s => s.id === selectedSensorId)?.type || 'unknown'}
                variant="area"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {['temperature', 'humidity', 'soil_moisture', 'ph'].map(type => {
              let typeData;
              
              if (viewMode === 'realtime') {
                typeData = streamData
                  .filter(d => d.data_type === type)
                  .map(d => ({
                    id: d.id,
                    sensor_id: d.sensor_id,
                    value: d.value,
                    unit: d.unit,
                    timestamp: d.timestamp,
                    metadata: d.metadata
                  }));
              } else {
                typeData = readings.filter(r => {
                  const sensor = sensors.find(s => s.id === r.sensor_id)
                  return sensor?.type === type
                });
              }
              
              return (
                <SensorChart
                  key={type}
                  title={`${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Trends`}
                  description={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} ${type.replace('_', ' ')} measurements`}
                  data={typeData}
                  sensorType={type}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="stream" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Real-time Stream Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signal className="h-5 w-5" />
                  Live Data Stream
                  {isWebSocketConnected && (
                    <Badge variant="secondary" className="ml-2">Connected</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Real-time sensor data streaming via WebSocket connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{streamData.length}</div>
                    <div className="text-sm text-muted-foreground">Stream Entries</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">{realtimeReadings.length}</div>
                    <div className="text-sm text-muted-foreground">Live Readings</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-warning">{aggregateData.length}</div>
                    <div className="text-sm text-muted-foreground">Aggregate Buckets</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Stream Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Stream Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {streamData.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{entry.data_type}</Badge>
                        <span className="font-medium">{entry.value}{entry.unit}</span>
                        <span className="text-sm text-muted-foreground">
                          Quality: {entry.quality_score}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {streamData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No stream data available. Start streaming by subscribing to sensors.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsList alerts={alerts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Enhanced System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Performance
                </CardTitle>
                <CardDescription>Real-time IoT system health and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sensor Uptime</span>
                  <span className="font-medium">{Math.round((onlineSensors/totalSensors) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">WebSocket Status</span>
                  <Badge variant={isWebSocketConnected ? "secondary" : "destructive"}>
                    {isWebSocketConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stream Data Points</span>
                  <span className="font-medium">{streamData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Historical Readings</span>
                  <span className="font-medium">{readings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Aggregate Buckets</span>
                  <span className="font-medium">{aggregateData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alert Resolution Rate</span>
                  <span className="font-medium">94%</span>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Data Quality & Insights
                </CardTitle>
                <CardDescription>Stream quality and predictive analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {streamData.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Quality Score</span>
                      <span className="font-medium">
                        {Math.round(streamData.reduce((sum, d) => sum + d.quality_score, 0) / streamData.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Types</span>
                      <span className="font-medium">
                        {Array.from(new Set(streamData.map(d => d.data_type))).length}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm">Aggregation Period</span>
                  <Badge variant="outline">{aggregationPeriod}</Badge>
                </div>
                <div className="pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => generateAggregates(aggregationPeriod)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate {aggregationPeriod} Aggregates
                  </Button>
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