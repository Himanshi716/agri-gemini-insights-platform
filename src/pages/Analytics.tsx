import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, TrendingDown, Activity, Download, Filter } from "lucide-react"

export default function Analytics() {
  const kpis = [
    {
      title: "Total Revenue",
      value: "$48,250",
      change: "+12.5%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Crop Yield",
      value: "2,847 kg",
      change: "+8.3%", 
      trend: "up",
      period: "vs last harvest"
    },
    {
      title: "Export Efficiency",
      value: "94.2%",
      change: "-2.1%",
      trend: "down",
      period: "vs last quarter"
    },
    {
      title: "Compliance Score",
      value: "96.8%",
      change: "+3.4%",
      trend: "up",
      period: "vs last audit"
    }
  ]

  const reports = [
    {
      name: "Monthly Farm Performance",
      description: "Comprehensive overview of farm productivity and efficiency metrics",
      lastGenerated: "2024-03-01",
      type: "Monthly"
    },
    {
      name: "Export Documentation Analysis",
      description: "Analysis of export documentation processing times and success rates",
      lastGenerated: "2024-02-28",
      type: "Weekly"
    },
    {
      name: "Compliance Audit Report",
      description: "Detailed compliance status across all certification standards",
      lastGenerated: "2024-02-15",
      type: "Quarterly"
    },
    {
      name: "IoT Sensor Performance",
      description: "Analysis of sensor data quality, uptime, and maintenance needs",
      lastGenerated: "2024-03-05",
      type: "Daily"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and reporting</p>
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className={`flex items-center ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {kpi.change}
                </div>
                <span>{kpi.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder - In a real app, you'd use a chart library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Farm Productivity Trends</CardTitle>
            <CardDescription>Monthly yield and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Productivity chart visualization</p>
                <p className="text-sm">Chart component would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Performance</CardTitle>
            <CardDescription>Documentation success rates and processing times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Export performance chart</p>
                <p className="text-sm">Chart component would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generated reports and analysis documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{report.name}</h3>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last generated: {report.lastGenerated}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button size="sm">
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}