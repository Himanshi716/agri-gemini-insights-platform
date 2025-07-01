import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, FileCheck, AlertCircle, Clock, CheckCircle } from "lucide-react"

export default function Compliance() {
  const standards = [
    {
      id: 1,
      name: "EU Organic Regulation",
      description: "European Union organic farming standards",
      status: "compliant",
      progress: 100,
      expiryDate: "2024-12-15",
      lastAudit: "2024-01-15"
    },
    {
      id: 2,
      name: "USDA Organic",
      description: "United States Department of Agriculture organic certification",
      status: "pending",
      progress: 75,
      expiryDate: "2024-08-30",
      lastAudit: "2023-11-20"
    },
    {
      id: 3,
      name: "GlobalGAP",
      description: "Good Agricultural Practices standard",
      status: "compliant",
      progress: 95,
      expiryDate: "2025-03-10",
      lastAudit: "2024-02-28"
    },
    {
      id: 4,
      name: "ISO 22000",
      description: "Food safety management systems",
      status: "non-compliant",
      progress: 45,
      expiryDate: "2024-06-20",
      lastAudit: "2023-12-05"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "default"
      case "pending": return "secondary"
      case "non-compliant": return "destructive"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return CheckCircle
      case "pending": return Clock
      case "non-compliant": return AlertCircle
      default: return Shield
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Center</h1>
          <p className="text-muted-foreground">Track certification standards and compliance status</p>
        </div>
        <Button>
          <FileCheck className="mr-2 h-4 w-4" />
          Request Audit
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">Standards met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Standards List */}
      <div className="space-y-4">
        {standards.map((standard) => {
          const StatusIcon = getStatusIcon(standard.status)
          
          return (
            <Card key={standard.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{standard.name}</CardTitle>
                      <CardDescription>{standard.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(standard.status)}>
                    {standard.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Progress</span>
                    <span>{standard.progress}%</span>
                  </div>
                  <Progress value={standard.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="ml-2 font-medium">{standard.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Audit:</span>
                    <span className="ml-2 font-medium">{standard.lastAudit}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Download Certificate
                  </Button>
                  <Button size="sm">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}