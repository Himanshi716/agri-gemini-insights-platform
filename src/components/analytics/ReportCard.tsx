
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"

interface ReportCardProps {
  name: string
  description: string
  lastGenerated: string
  type: string
  status?: string
}

export function ReportCard({ name, description, lastGenerated, type, status = "ready" }: ReportCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "generating":
        return <Badge variant="outline" className="border-warning text-warning">Generating</Badge>
      case "ready":
        return <Badge variant="secondary" className="bg-success text-success-foreground">Ready</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium">{name}</h3>
              <Badge variant="outline">{type}</Badge>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Last generated: {lastGenerated}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button size="sm" disabled={status !== "ready"}>
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
