import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  className?: string
}

export function MetricsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  badge,
  className 
}: MetricsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success'
      case 'down': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={cn("text-xs", getTrendColor())}>
            {description}
          </p>
        )}
        {badge && (
          <Badge variant={badge.variant || 'secondary'} className="text-xs mt-1">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}