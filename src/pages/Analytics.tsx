
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartCard } from "@/components/analytics/ChartCard"
import { ReportCard } from "@/components/analytics/ReportCard"
import { BarChart3, Download, Filter, Zap } from "lucide-react"

const performanceMetrics = [
  {
    title: "Farm Productivity",
    description: "Yield per hectare this season",
    value: "18.7 tons/ha",
    change: "+12.5% vs last season",
    trend: "up" as const,
    chartType: "Line Chart"
  },
  {
    title: "Resource Efficiency",
    description: "Water usage optimization",
    value: "85.3%",
    change: "+5.2% improvement",
    trend: "up" as const,
    chartType: "Bar Chart"
  },
  {
    title: "Cost per Unit",
    description: "Production cost efficiency",
    value: "$2.34/kg",
    change: "-8.1% reduction",
    trend: "up" as const,
    chartType: "Area Chart"
  },
  {
    title: "Quality Score",
    description: "Average crop quality rating",
    value: "94.2%",
    change: "+2.8% improvement",
    trend: "up" as const,
    chartType: "Gauge"
  }
]

const reports = [
  {
    name: "Monthly Farm Performance",
    description: "Comprehensive overview of farm productivity and efficiency metrics",
    lastGenerated: "2024-03-01",
    type: "Monthly",
    status: "ready"
  },
  {
    name: "Export Documentation Analysis",
    description: "Analysis of export documentation processing times and success rates",
    lastGenerated: "2024-02-28",
    type: "Weekly",
    status: "ready"
  },
  {
    name: "Compliance Audit Report",
    description: "Detailed compliance status across all certification standards",
    lastGenerated: "2024-02-15",
    type: "Quarterly",
    status: "generating"
  },
  {
    name: "IoT Sensor Performance",
    description: "Analysis of sensor data quality, uptime, and maintenance needs",
    lastGenerated: "2024-03-05",
    type: "Daily",
    status: "ready"
  }
]

const predictiveInsights = [
  {
    title: "Harvest Prediction",
    description: "AI-powered yield forecasting",
    value: "2,950 kg",
    change: "Expected in 3 weeks",
    trend: "neutral" as const,
    chartType: "Forecast"
  },
  {
    title: "Market Price Trend",
    description: "Price prediction for next quarter",
    value: "$3.85/kg",
    change: "+15% price increase expected",
    trend: "up" as const,
    chartType: "Trend Analysis"
  }
]

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and AI-powered analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <ChartCard key={index} {...metric} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
                <CardDescription>Farm output over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Interactive productivity chart</p>
                    <p className="text-sm">Recharts integration placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Water, energy, and input efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <p>Resource efficiency visualization</p>
                    <p className="text-sm">Multi-metric dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveInsights.map((insight, index) => (
              <ChartCard key={index} {...insight} />
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Forecasting</CardTitle>
              <CardDescription>Machine learning predictions for optimal farming decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Predictive Analytics Engine</h3>
                  <p className="mb-4">Advanced forecasting using historical data and AI models</p>
                  <Button variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-4">
            {reports.map((report, index) => (
              <ReportCard key={index} {...report} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>Live data streams from IoT sensors and farm operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Zap className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Live Data Dashboard</h3>
                  <p>Real-time sensor data and operational metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
