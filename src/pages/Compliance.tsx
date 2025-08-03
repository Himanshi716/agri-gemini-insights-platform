import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ComplianceManager } from "@/components/compliance/ComplianceManager"
import { ComplianceCertificateManager } from "@/components/compliance/ComplianceCertificateManager"
import { GeminiComplianceAnalyzer } from "@/components/compliance/GeminiComplianceAnalyzer"
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe,
  Building,
  Leaf,
  Truck
} from "lucide-react"

const complianceData = {
  overallScore: 94,
  certifications: [
    { name: "GlobalGAP", status: "active", expires: "2024-12-15", score: 96 },
    { name: "Organic Certification", status: "active", expires: "2024-10-30", score: 98 },
    { name: "Fair Trade", status: "pending", expires: "2024-11-20", score: 92 },
    { name: "ISO 22000", status: "active", expires: "2025-01-15", score: 90 }
  ],
  requirements: [
    { category: "Food Safety", completed: 28, total: 30, critical: 2 },
    { category: "Environmental", completed: 22, total: 25, critical: 1 },
    { category: "Labor Standards", completed: 18, total: 20, critical: 0 },
    { category: "Quality Control", completed: 35, total: 38, critical: 3 }
  ]
}

export default function Compliance() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Center</h1>
          <p className="text-muted-foreground">Monitor certification status and regulatory compliance</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <FileCheck className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{complianceData.overallScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Certs</p>
                <p className="text-2xl font-bold">3/4</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Audit</p>
                <p className="text-2xl font-bold">45d</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analyzer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyzer">AI Analyzer</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-4">
          <GeminiComplianceAnalyzer />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <ComplianceCertificateManager />
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <ComplianceManager />
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>Previous certification audits and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Audit Records</h3>
                <p className="text-muted-foreground">Historical audit data and compliance assessments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Documents</CardTitle>
              <CardDescription>Certificates, policies, and compliance documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Document Library</h3>
                <p className="text-muted-foreground">Access and manage compliance documentation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}