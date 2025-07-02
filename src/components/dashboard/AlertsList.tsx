import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"

interface Alert {
  id: string
  type: 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  timestamp: string
  farmId?: string
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'high',
    title: 'Pest Detection Alert',
    description: 'Aphids detected in Field A-3. Immediate action recommended.',
    timestamp: '2 hours ago',
    farmId: 'farm-001'
  },
  {
    id: '2',
    type: 'medium',
    title: 'Irrigation Maintenance',
    description: 'Sprinkler system maintenance due in Field B-1.',
    timestamp: '5 hours ago',
    farmId: 'farm-002'
  },
  {
    id: '3',
    type: 'low',
    title: 'Weather Update',
    description: 'Light rain expected tomorrow. Adjust watering schedule.',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    type: 'info',
    title: 'Harvest Reminder',
    description: 'Tomatoes in Field C-2 ready for harvest next week.',
    timestamp: '2 days ago',
    farmId: 'farm-003'
  }
]

export function AlertsList() {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'low':
        return <Info className="h-4 w-4 text-info" />
      default:
        return <CheckCircle className="h-4 w-4 text-success" />
    }
  }

  const getAlertBadge = (type: Alert['type']) => {
    switch (type) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Latest notifications from your farms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium">{alert.title}</h4>
                {getAlertBadge(alert.type)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{alert.timestamp}</span>
                {alert.farmId && <span>Farm: {alert.farmId}</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}