import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ExportDocuments() {
  const documents = [
    {
      id: 1,
      name: "Phytosanitary Certificate",
      type: "certificate",
      status: "approved",
      destination: "European Union",
      createdDate: "2024-03-01",
      expiryDate: "2024-06-01",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Certificate of Origin",
      type: "certificate", 
      status: "pending",
      destination: "Japan",
      createdDate: "2024-03-05",
      expiryDate: "2024-09-05",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Export Invoice",
      type: "invoice",
      status: "draft",
      destination: "Canada",
      createdDate: "2024-03-10",
      expiryDate: "2024-12-10",
      size: "856 KB"
    },
    {
      id: 4,
      name: "Organic Certification",
      type: "certificate",
      status: "approved", 
      destination: "United States",
      createdDate: "2024-02-15",
      expiryDate: "2025-02-15",
      size: "3.2 MB"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default"
      case "pending": return "secondary"
      case "draft": return "outline"
      case "rejected": return "destructive"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle
      case "pending": return Clock
      case "draft": return FileText
      case "rejected": return AlertCircle
      default: return FileText
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export Documents</h1>
          <p className="text-muted-foreground">Manage export documentation and certificates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Document Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18</div>
            <p className="text-xs text-muted-foreground">Ready for export</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">4</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((document) => {
          const StatusIcon = getStatusIcon(document.status)
          
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{document.name}</CardTitle>
                      <CardDescription>
                        Destination: {document.destination} • Type: {document.type}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge variant={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">{document.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="ml-2 font-medium">{document.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 font-medium">{document.size}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm">
                    Edit
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