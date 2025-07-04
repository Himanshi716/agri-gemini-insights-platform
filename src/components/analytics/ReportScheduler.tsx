import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Download, 
  Play, 
  Pause,
  Trash2,
  Plus,
  BarChart3,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduledReport {
  id: string
  name: string
  type: string
  schedule: string
  format: string
  recipients: string[]
  enabled: boolean
  lastRun: string
  nextRun: string
  parameters: Record<string, any>
}

const reportTypes = [
  { value: "farm_performance", label: "Farm Performance Report" },
  { value: "compliance_audit", label: "Compliance Audit Report" },
  { value: "export_documentation", label: "Export Documentation Analysis" },
  { value: "iot_sensors", label: "IoT Sensor Performance" },
  { value: "financial_summary", label: "Financial Summary" },
  { value: "sustainability", label: "Sustainability Metrics" }
]

const scheduleOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" }
]

const formatOptions = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" }
]

export function ReportScheduler() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Weekly Farm Performance",
      type: "farm_performance",
      schedule: "weekly",
      format: "pdf",
      recipients: ["manager@farm.com", "owner@farm.com"],
      enabled: true,
      lastRun: "2024-01-08T09:00:00Z",
      nextRun: "2024-01-15T09:00:00Z",
      parameters: { includeCharts: true, timeRange: "1w" }
    },
    {
      id: "2",
      name: "Monthly Compliance Audit",
      type: "compliance_audit",
      schedule: "monthly",
      format: "pdf",
      recipients: ["compliance@farm.com"],
      enabled: true,
      lastRun: "2024-01-01T10:00:00Z",
      nextRun: "2024-02-01T10:00:00Z",
      parameters: { includeRecommendations: true }
    }
  ])

  const [showNewReportForm, setShowNewReportForm] = useState(false)
  const [newReport, setNewReport] = useState({
    name: "",
    type: "",
    schedule: "",
    format: "pdf",
    recipients: "",
    enabled: true,
    parameters: {}
  })

  const { toast } = useToast()

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(reports =>
      reports.map(report =>
        report.id === reportId 
          ? { ...report, enabled: !report.enabled }
          : report
      )
    )
    
    const report = scheduledReports.find(r => r.id === reportId)
    toast({
      title: `Report ${report?.enabled ? 'Disabled' : 'Enabled'}`,
      description: `${report?.name} has been ${report?.enabled ? 'disabled' : 'enabled'}`
    })
  }

  const deleteReport = (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId)
    setScheduledReports(reports => reports.filter(r => r.id !== reportId))
    
    toast({
      title: "Report Deleted",
      description: `${report?.name} has been deleted`
    })
  }

  const runReportNow = (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId)
    toast({
      title: "Report Generation Started",
      description: `Generating ${report?.name}. You'll receive it via email shortly.`
    })
  }

  const createNewReport = () => {
    if (!newReport.name || !newReport.type || !newReport.schedule) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const report: ScheduledReport = {
      id: Date.now().toString(),
      name: newReport.name,
      type: newReport.type,
      schedule: newReport.schedule,
      format: newReport.format,
      recipients: newReport.recipients.split(',').map(email => email.trim()),
      enabled: newReport.enabled,
      lastRun: "",
      nextRun: calculateNextRun(newReport.schedule),
      parameters: newReport.parameters
    }

    setScheduledReports(prev => [...prev, report])
    setNewReport({
      name: "",
      type: "",
      schedule: "",
      format: "pdf",
      recipients: "",
      enabled: true,
      parameters: {}
    })
    setShowNewReportForm(false)

    toast({
      title: "Report Scheduled",
      description: `${report.name} has been scheduled successfully`
    })
  }

  const calculateNextRun = (schedule: string): string => {
    const now = new Date()
    switch (schedule) {
      case 'daily':
        now.setDate(now.getDate() + 1)
        break
      case 'weekly':
        now.setDate(now.getDate() + 7)
        break
      case 'monthly':
        now.setMonth(now.getMonth() + 1)
        break
      case 'quarterly':
        now.setMonth(now.getMonth() + 3)
        break
    }
    return now.toISOString()
  }

  const getStatusBadge = (report: ScheduledReport) => {
    if (!report.enabled) {
      return <Badge variant="secondary">Disabled</Badge>
    }
    
    const nextRun = new Date(report.nextRun)
    const now = new Date()
    const hoursUntilNext = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilNext < 24) {
      return <Badge variant="default">Due Soon</Badge>
    }
    
    return <Badge variant="outline">Active</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Report Scheduler
              </CardTitle>
              <CardDescription>
                Automate report generation and delivery with customizable schedules
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewReportForm(!showNewReportForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showNewReportForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="text-lg font-semibold">Create New Scheduled Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    placeholder="Enter report name"
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select value={newReport.schedule} onValueChange={(value) => setNewReport(prev => ({ ...prev, schedule: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={newReport.format} onValueChange={(value) => setNewReport(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input
                  id="recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={newReport.recipients}
                  onChange={(e) => setNewReport(prev => ({ ...prev, recipients: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newReport.enabled} 
                  onCheckedChange={(checked) => setNewReport(prev => ({ ...prev, enabled: checked }))}
                />
                <Label>Enable immediately</Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createNewReport}>Create Report</Button>
                <Button variant="outline" onClick={() => setShowNewReportForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scheduled Reports</h3>
            
            {scheduledReports.map((report) => (
              <Card key={report.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{report.name}</h4>
                        {getStatusBadge(report)}
                        <Badge variant="outline" className="text-xs">
                          {reportTypes.find(t => t.value === report.type)?.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.schedule}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {report.format.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} recipients
                        </div>
                        <div>
                          Next: {new Date(report.nextRun).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runReportNow(report.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleReportStatus(report.id)}
                      >
                        {report.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}