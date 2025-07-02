import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileCheck,
  Globe,
  Truck,
  Shield,
  Leaf
} from "lucide-react"

const exportDocuments = [
  {
    id: 'EXP-001',
    type: 'Certificate of Origin',
    status: 'completed',
    destination: 'European Union',
    created: '2024-01-15',
    expires: '2024-02-15'
  },
  {
    id: 'EXP-002',
    type: 'Phytosanitary Certificate',
    status: 'pending',
    destination: 'United States',
    created: '2024-01-20',
    expires: '2024-02-20'
  },
  {
    id: 'EXP-003',
    type: 'Quality Certificate',
    status: 'draft',
    destination: 'Japan',
    created: '2024-01-18',
    expires: '2024-02-18'
  }
]

const templates = [
  {
    name: 'Certificate of Origin',
    description: 'Document certifying the country of origin for agricultural products',
    icon: Globe,
    fields: 12
  },
  {
    name: 'Phytosanitary Certificate',
    description: 'Plant health certificate for international trade',
    icon: Leaf,
    fields: 15
  },
  {
    name: 'Quality Certificate',
    description: 'Product quality assurance documentation',
    icon: Shield,
    fields: 8
  },
  {
    name: 'Export License',
    description: 'Official export authorization document',
    icon: FileCheck,
    fields: 10
  }
]

export default function ExportDocuments() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Completed</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'draft':
        return <FileText className="h-4 w-4 text-muted-foreground" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export Documents</h1>
          <p className="text-muted-foreground">Generate and manage export documentation for international trade</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <FileText className="h-4 w-4 mr-2" />
          Create Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">32</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exports This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Truck className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-4">
            {exportDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(doc.status)}
                      <div>
                        <h3 className="font-semibold">{doc.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {doc.id} • Destination: {doc.destination}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Created: {doc.created}</p>
                        <p className="text-sm text-muted-foreground">Expires: {doc.expires}</p>
                      </div>
                      {getStatusBadge(doc.status)}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <template.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fields:</span>
                    <span className="font-medium">{template.fields}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Automation</CardTitle>
              <CardDescription>Automated document generation and processing workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Automation Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated workflows for document generation
                </p>
                <Button>Configure Automation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Archive</CardTitle>
              <CardDescription>Historical export documents and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Archived Documents</h3>
                <p className="text-muted-foreground">Access historical export documentation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}