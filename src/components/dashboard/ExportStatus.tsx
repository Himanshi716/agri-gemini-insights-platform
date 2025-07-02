import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileCheck, FileX, FilePenLine } from "lucide-react"

interface ExportDocument {
  id: string
  name: string
  status: 'approved' | 'pending' | 'draft' | 'rejected'
  progress: number
  dueDate: string
}

const mockDocuments: ExportDocument[] = [
  {
    id: '1',
    name: 'EU Organic Certification',
    status: 'approved',
    progress: 100,
    dueDate: '2024-12-31'
  },
  {
    id: '2',
    name: 'Phytosanitary Certificate',
    status: 'pending',
    progress: 75,
    dueDate: '2024-08-15'
  },
  {
    id: '3',
    name: 'GLOBALG.A.P. Certificate',
    status: 'draft',
    progress: 30,
    dueDate: '2024-09-01'
  },
  {
    id: '4',
    name: 'Fair Trade Certificate',
    status: 'pending',
    progress: 85,
    dueDate: '2024-08-30'
  }
]

export function ExportStatus() {
  const getStatusIcon = (status: ExportDocument['status']) => {
    switch (status) {
      case 'approved':
        return <FileCheck className="h-4 w-4 text-success" />
      case 'rejected':
        return <FileX className="h-4 w-4 text-destructive" />
      default:
        return <FilePenLine className="h-4 w-4 text-warning" />
    }
  }

  const getStatusBadge = (status: ExportDocument['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Documentation</CardTitle>
        <CardDescription>Current certification and compliance status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(doc.status)}
                <span className="text-sm font-medium">{doc.name}</span>
              </div>
              {getStatusBadge(doc.status)}
            </div>
            <div className="space-y-1">
              <Progress value={doc.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{doc.progress}% complete</span>
                <span>Due: {doc.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}