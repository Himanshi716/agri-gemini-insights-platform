import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsCard } from "@/components/dashboard/MetricsCard"
import { AlertsList } from "@/components/dashboard/AlertsList"
import { ExportStatus } from "@/components/dashboard/ExportStatus"
import { useAuth } from "@/hooks/useAuth"
import { useFarmData } from "@/hooks/useFarmData"
import { useIoTData } from "@/hooks/useIoTData"
import { useExternalData } from "@/hooks/useExternalData"
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Leaf,
  Zap,
  Globe,
  Calendar,
  MapPin,
  RefreshCw,
  Shield,
  Users
} from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const { farms, crops, loading: farmLoading } = useFarmData()
  const { readings, loading: iotLoading } = useIoTData()
  const { weatherData, marketData, loading: externalLoading, fetchWeatherData, fetchMarketData } = useExternalData()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Load external data on component mount
  useEffect(() => {
    if (farms.length > 0) {
      const primaryFarm = farms[0]
      const location = primaryFarm.location_address || 'California, US'
      const farmCrops = crops.map(c => c.name.toLowerCase())
      
      fetchWeatherData(location, primaryFarm.id)
      fetchMarketData(farmCrops, 'global', primaryFarm.id)
    }
  }, [farms, crops])

  const refreshExternalData = async () => {
    if (farms.length > 0) {
      const primaryFarm = farms[0]
      const location = primaryFarm.location_address || 'California, US'
      const farmCrops = crops.map(c => c.name.toLowerCase())
      
      await Promise.all([
        fetchWeatherData(location, primaryFarm.id),
        fetchMarketData(farmCrops, 'global', primaryFarm.id)
      ])
      setLastRefresh(new Date())
    }
  }

  // Calculate metrics from real data
  const getTotalFarms = () => farms.length
  const getAverageTemperature = () => {
    if (weatherData?.current?.temperature) {
      return `${weatherData.current.temperature}°C`
    }
    if (readings.length > 0) {
      const tempReadings = readings.filter(r => r.unit === '°C')
      if (tempReadings.length > 0) {
        const avg = tempReadings.reduce((sum, r) => sum + r.value, 0) / tempReadings.length
        return `${Math.round(avg)}°C`
      }
    }
    return '24°C'
  }

  const getAverageMoisture = () => {
    const moistureReadings = readings.filter(r => r.unit === '%')
    if (moistureReadings.length > 0) {
      const avg = moistureReadings.reduce((sum, r) => sum + r.value, 0) / moistureReadings.length
      return `${Math.round(avg)}%`
    }
    return '68%'
  }

  const getComplianceScore = () => {
    const activeCrops = crops.filter(c => c.status === 'growing' || c.status === 'planted')
    if (activeCrops.length === 0) return '95%'
    
    // Simple compliance calculation based on crop status and farm certifications
    const farmWithCertifications = farms.filter(f => f.certifications && f.certifications.length > 0)
    const baseScore = farmWithCertifications.length > 0 ? 90 : 75
    const cropBonus = Math.min(activeCrops.length * 2, 10)
    return `${Math.min(baseScore + cropBonus, 98)}%`
  }

  const getTemperatureTrend = () => {
    if (weatherData?.forecast && weatherData.forecast.length > 1) {
      const today = weatherData.current.temperature
      const tomorrow = weatherData.forecast[0]?.high || today
      return tomorrow > today ? 'up' : tomorrow < today ? 'down' : 'neutral'
    }
    return 'neutral'
  }

  const getMoistureTrend = () => {
    if (weatherData?.forecast) {
      const upcomingRain = weatherData.forecast.reduce((sum, day) => sum + day.rainfall, 0)
      return upcomingRain > 10 ? 'up' : upcomingRain < 2 ? 'down' : 'neutral'
    }
    return 'neutral'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farm Dashboard</h1>
          <p className="text-muted-foreground">Overview of your agricultural operations and export readiness</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshExternalData}
            disabled={externalLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${externalLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Active Farms"
          value={getTotalFarms()}
          description={`${crops.length} crops planted`}
          icon={Leaf}
          trend="up"
        />
        
        <MetricsCard
          title="Avg Temperature"
          value={getAverageTemperature()}
          description={weatherData?.current?.description || "Optimal range"}
          icon={Thermometer}
          trend={getTemperatureTrend()}
          badge={{ text: "Live Data", variant: "secondary" }}
        />
        
        <MetricsCard
          title="Soil Moisture"
          value={getAverageMoisture()}
          description="From IoT sensors"
          icon={Droplets}
          trend={getMoistureTrend()}
          badge={{ text: readings.length > 0 ? "Live" : "Demo", variant: "secondary" }}
        />
        
        <MetricsCard
          title="Compliance Score"
          value={getComplianceScore()}
          description="Export ready"
          icon={Shield}
          trend="up"
          badge={{ text: "Excellent", variant: "default" }}
        />
      </div>

      {/* Weather & Market Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Weather Conditions
            </CardTitle>
            <CardDescription>
              {weatherData?.location || 'Loading weather data...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weatherData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {weatherData.current.description}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="h-3 w-3" />
                      {weatherData.current.humidity}%
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Wind className="h-3 w-3" />
                      {weatherData.current.windSpeed} km/h
                    </div>
                  </div>
                </div>
                
                {/* Weather Alerts */}
                {weatherData.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Alerts</h4>
                    {weatherData.alerts.slice(0, 2).map((alert, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-lg text-xs ${
                          alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                          alert.severity === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-info/10 text-info'
                        }`}
                      >
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3-Day Forecast */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">3-Day Forecast</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {weatherData.forecast.slice(0, 3).map((day, index) => (
                      <div key={index} className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </div>
                        <div className="text-sm font-medium">{day.high}°</div>
                        <div className="text-xs text-muted-foreground">{day.low}°</div>
                        {day.rainfall > 0 && (
                          <div className="text-xs text-blue-600">{day.rainfall}mm</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Loading weather data...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Intelligence
            </CardTitle>
            <CardDescription>
              Real-time pricing and export opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {marketData ? (
              <div className="space-y-4">
                {/* Top Market Prices */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Crop Prices</h4>
                  {marketData.marketData && Object.entries(marketData.marketData).slice(0, 3).map(([crop, data]) => (
                    <div key={crop} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{crop}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${data.price.toFixed(2)}</span>
                        <span className={`text-xs ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
                        </span>
                        {data.trend === 'up' ? 
                          <TrendingUp className="h-3 w-3 text-green-600" /> : 
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Insights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Insights</h4>
                  {marketData.insights.slice(0, 2).map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-lg text-xs ${
                        insight.type === 'opportunity' ? 'bg-green-50 text-green-700' :
                        insight.type === 'alert' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>

                {/* Export Opportunities */}
                {marketData.exportOpportunities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Export Opportunities</h4>
                    {marketData.exportOpportunities.slice(0, 2).map((opp, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium capitalize">{opp.crop}</div>
                            <div className="text-xs text-muted-foreground">{opp.destination}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">${opp.price.toFixed(2)}</div>
                            <Badge variant={opp.demand === 'high' ? 'default' : 'secondary'} className="text-xs">
                              {opp.demand} demand
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Loading market data...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsList />
        <ExportStatus />
      </div>
    </div>
  )
}