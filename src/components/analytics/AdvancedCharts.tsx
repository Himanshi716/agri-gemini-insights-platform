import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from "recharts"
import { useState } from "react"
import { TrendingUp, TrendingDown, Download, Filter, Eye } from "lucide-react"

// Sample data for different chart types
const productivityData = [
  { month: 'Jan', yield: 18.2, quality: 92, cost: 2.45, revenue: 45200 },
  { month: 'Feb', yield: 19.1, quality: 94, cost: 2.38, revenue: 48300 },
  { month: 'Mar', yield: 17.8, quality: 91, cost: 2.52, revenue: 43800 },
  { month: 'Apr', yield: 20.3, quality: 96, cost: 2.29, revenue: 52100 },
  { month: 'May', yield: 21.5, quality: 95, cost: 2.35, revenue: 54700 },
  { month: 'Jun', yield: 19.9, quality: 93, cost: 2.41, revenue: 49800 }
]

const complianceData = [
  { standard: 'Organic', status: 98, color: '#22c55e' },
  { standard: 'Fair Trade', status: 95, color: '#3b82f6' },
  { standard: 'GlobalGAP', status: 92, color: '#f59e0b' },
  { standard: 'HACCP', status: 89, color: '#ef4444' }
]

const resourceData = [
  { resource: 'Water', efficiency: 85, target: 90, usage: 12500 },
  { resource: 'Energy', efficiency: 78, target: 85, usage: 8900 },
  { resource: 'Fertilizer', efficiency: 92, target: 88, usage: 450 },
  { resource: 'Labor', efficiency: 88, target: 90, usage: 2400 }
]

const cropCorrelationData = [
  { temperature: 22, humidity: 65, yield: 18.5 },
  { temperature: 25, humidity: 70, yield: 20.2 },
  { temperature: 21, humidity: 60, yield: 17.8 },
  { temperature: 24, humidity: 68, yield: 19.7 },
  { temperature: 23, humidity: 72, yield: 21.1 },
  { temperature: 26, humidity: 58, yield: 19.3 }
]

interface AdvancedChartsProps {
  chartType?: string
  timeRange?: string
  showDrillDown?: boolean
}

export function AdvancedCharts({ chartType = "productivity", timeRange = "6m", showDrillDown = true }: AdvancedChartsProps) {
  const [selectedChart, setSelectedChart] = useState(chartType)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [drillDownLevel, setDrillDownLevel] = useState(0)

  const handleDrillDown = (data: any) => {
    if (showDrillDown && drillDownLevel < 2) {
      setDrillDownLevel(prev => prev + 1)
      console.log("Drilling down into:", data)
    }
  }

  const renderProductivityChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={productivityData} onClick={handleDrillDown}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="yield" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          name="Yield (tons/ha)"
        />
        <Line 
          type="monotone" 
          dataKey="quality" 
          stroke="hsl(var(--accent))" 
          strokeWidth={2}
          dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
          name="Quality Score (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderComplianceChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart onClick={handleDrillDown}>
        <Pie
          data={complianceData}
          cx="50%"
          cy="50%"
          outerRadius={120}
          dataKey="status"
          label={({ standard, status }) => `${standard}: ${status}%`}
        >
          {complianceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderResourceChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={resourceData} onClick={handleDrillDown}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="resource" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }} 
        />
        <Legend />
        <Bar dataKey="efficiency" fill="hsl(var(--primary))" name="Current Efficiency %" />
        <Bar dataKey="target" fill="hsl(var(--accent))" name="Target %" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderCorrelationChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={cropCorrelationData} onClick={handleDrillDown}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="temperature" 
          type="number" 
          domain={['dataMin - 1', 'dataMax + 1']}
          name="Temperature"
          unit="°C"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          dataKey="humidity" 
          type="number" 
          domain={['dataMin - 5', 'dataMax + 5']}
          name="Humidity"
          unit="%"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
          formatter={(value, name) => [value, name === 'yield' ? 'Yield (tons/ha)' : name]}
        />
        <Scatter 
          name="Yield Data" 
          dataKey="yield" 
          fill="hsl(var(--primary))"
          r={8}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )

  const renderCurrentChart = () => {
    switch (selectedChart) {
      case 'productivity':
        return renderProductivityChart()
      case 'compliance':
        return renderComplianceChart()
      case 'resource':
        return renderResourceChart()
      case 'correlation':
        return renderCorrelationChart()
      default:
        return renderProductivityChart()
    }
  }

  const getChartTitle = () => {
    switch (selectedChart) {
      case 'productivity':
        return "Farm Productivity Analysis"
      case 'compliance':
        return "Compliance Standards Overview"
      case 'resource':
        return "Resource Efficiency Metrics"
      case 'correlation':
        return "Environmental Factor Correlation"
      default:
        return "Analytics Dashboard"
    }
  }

  const getChartDescription = () => {
    switch (selectedChart) {
      case 'productivity':
        return "Track yield performance and quality metrics over time"
      case 'compliance':
        return "Monitor compliance status across different certification standards"
      case 'resource':
        return "Analyze resource utilization efficiency against targets"
      case 'correlation':
        return "Understand relationships between environmental factors and yield"
      default:
        return "Interactive analytics with drill-down capabilities"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getChartTitle()}
              {drillDownLevel > 0 && (
                <Badge variant="outline">
                  Level {drillDownLevel + 1}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="resource">Resource Usage</SelectItem>
                <SelectItem value="correlation">Correlation</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {showDrillDown && drillDownLevel > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDrillDownLevel(prev => Math.max(0, prev - 1))}
              >
                ← Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Drill-down level {drillDownLevel + 1}
              </span>
            </div>
          )}
          
          {renderCurrentChart()}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {showDrillDown && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Click chart elements to drill down
                </div>
              )}
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                Performance trending upward
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}