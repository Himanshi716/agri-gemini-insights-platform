import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentTemplate } from "@/components/export/DocumentTemplate"
import { QRCodeGenerator } from "@/components/export/QRCodeGenerator"
import { BlockchainVerification } from "@/components/export/BlockchainVerification"
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
  Leaf,
  QrCode,
  Hash,
  Zap
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
    id: 'cert_origin',
    name: 'Certificate of Origin',
    description: 'Document certifying the country of origin for agricultural products',
    icon: Globe,
    fields: ['Product Name', 'Origin Country', 'Destination Country', 'Export Date', 'Quantity', 'Product Description', 'Exporter Details', 'Importer Details', 'Batch Number', 'Quality Grade', 'Certification Authority', 'Additional Notes'],
    type: 'Certificate',
    compliance_standards: ['WTO Rules of Origin', 'NAFTA', 'GSP']
  },
  {
    id: 'phyto_cert',
    name: 'Phytosanitary Certificate',
    description: 'Plant health certificate for international trade',
    icon: Leaf,
    fields: ['Plant Species', 'Scientific Name', 'Quantity', 'Origin Country', 'Destination Country', 'Inspection Date', 'Inspection Authority', 'Treatment Details', 'Pest Status', 'Health Declaration', 'Inspector Name', 'Certificate Number', 'Validity Period', 'Additional Requirements', 'Inspection Notes'],
    type: 'Health Certificate',
    compliance_standards: ['IPPC', 'WTO SPS Agreement', 'ISPM Standards']
  },
  {
    id: 'quality_cert',
    name: 'Quality Certificate',
    description: 'Product quality assurance documentation',
    icon: Shield,
    fields: ['Product Name', 'Quality Grade', 'Testing Date', 'Laboratory Name', 'Test Results', 'Standards Met', 'Batch Number', 'Additional Notes'],
    type: 'Quality Assurance',
    compliance_standards: ['ISO 9001', 'HACCP', 'SQF']
  },
  {
    id: 'export_license',
    name: 'Export License',
    description: 'Official export authorization document',
    icon: FileCheck,
    fields: ['License Number', 'Product Category', 'Destination Country', 'Export Quantity', 'Value', 'License Authority', 'Issue Date', 'Expiry Date', 'Conditions', 'Restrictions'],
    type: 'License',
    compliance_standards: ['Export Administration Regulations', 'ITAR', 'Local Export Laws']
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
          <TabsTrigger value="qr-generator">QR & Traceability</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
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
          <div className="space-y-6">
            {templates.map((template) => (
              <DocumentTemplate
                key={template.id}
                template={template}
                onGenerate={(data) => {
                  console.log('Generate document:', data)
                  // Integrate with document generation service
                }}
                onPreview={(data) => {
                  console.log('Preview document:', data)
                  // Show document preview
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qr-generator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeGenerator
              onCodeGenerated={(qrData, imageData) => {
                console.log('QR Code generated:', { qrData, imageData })
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Supply Chain Tracking
                </CardTitle>
                <CardDescription>
                  Track products through the entire supply chain using QR codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-success" />
                      <span className="text-sm">Farm Origin</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-info" />
                      <span className="text-sm">Quality Testing</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-warning" />
                      <span className="text-sm">Transportation</span>
                    </div>
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Retail/Consumer</span>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Button className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Traceability QR
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockchainVerification
              onVerificationComplete={(result) => {
                console.log('Blockchain verification result:', result)
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Smart Contract Integration
                </CardTitle>
                <CardDescription>
                  Future-ready blockchain features for supply chain transparency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Smart Contracts</p>
                    <p className="text-xs text-muted-foreground">Automated compliance</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="font-medium">Immutable Records</p>
                    <p className="text-xs text-muted-foreground">Tamper-proof data</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-info" />
                    <p className="font-medium">Public Verification</p>
                    <p className="text-xs text-muted-foreground">Consumer transparency</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <FileCheck className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="font-medium">Digital Signatures</p>
                    <p className="text-xs text-muted-foreground">Cryptographic proof</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Hash className="h-4 w-4 mr-2" />
                    Deploy Smart Contract
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Create Digital Signature
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground bg-info/10 p-3 rounded-lg">
                  <p className="font-medium text-info">Coming Soon</p>
                  <p>Full blockchain integration will be available in the next release</p>
                </div>
              </CardContent>
            </Card>
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