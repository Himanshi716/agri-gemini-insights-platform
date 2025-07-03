
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ChartCardProps {
  title: string
  description: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  chartType: string
}

export function ChartCard({ title, description, value, change, trend, chartType }: ChartCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />
    return null
  }

  const getTrendColor = () => {
    if (trend === "up") return "text-success"
    if (trend === "down") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="outline">{chartType}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{change}</span>
        </div>
        <div className="mt-4 h-[60px] bg-muted/50 rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Chart visualization</span>
        </div>
      </CardContent>
    </Card>
  )
}
