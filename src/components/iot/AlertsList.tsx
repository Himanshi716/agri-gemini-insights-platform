import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  title: string
  content: any
  created_at: string
  status: string
}

interface AlertsListProps {
  alerts: Alert[]
  onResolveAlert?: (alertId: string) => void
}

export function AlertsList({ alerts, onResolveAlert }: AlertsListProps) {
  const getAlertIcon = (content: any) => {
    if (content?.alert_message?.includes('too high')) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
    if (content?.alert_message?.includes('too low')) {
      return <AlertTriangle className="h-4 w-4 text-warning" />
    }
    return <AlertTriangle className="h-4 w-4 text-info" />
  }

  const getSeverityBadge = (content: any) => {
    const message = content?.alert_message?.toLowerCase() || ''
    if (message.includes('critical') || message.includes('too high')) {
      return <Badge variant="destructive">Critical</Badge>
    }
    if (message.includes('warning') || message.includes('too low')) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Warning</Badge>
    }
    return <Badge variant="outline">Info</Badge>
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            No Active Alerts
          </CardTitle>
          <CardDescription>All sensors are operating within normal parameters</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Recent Alerts ({alerts.length})
        </CardTitle>
        <CardDescription>Sensor threshold violations and system notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              "flex items-start justify-between p-4 rounded-lg border transition-colors",
              alert.status === 'pending' ? "bg-muted/30" : "bg-background"
            )}
          >
            <div className="flex items-start gap-3 flex-1">
              {getAlertIcon(alert.content)}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  {getSeverityBadge(alert.content)}
                </div>
                
                {alert.content?.alert_message && (
                  <p className="text-sm text-muted-foreground">
                    {alert.content.alert_message}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                  
                  {alert.content?.sensor_type && (
                    <div className="capitalize">
                      Sensor: {alert.content.sensor_type.replace('_', ' ')}
                    </div>
                  )}
                  
                  {alert.content?.current_value && alert.content?.unit && (
                    <div>
                      Value: {alert.content.current_value}{alert.content.unit}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {alert.status === 'pending' && onResolveAlert && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onResolveAlert(alert.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              )}
              
              {alert.status === 'approved' && (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}