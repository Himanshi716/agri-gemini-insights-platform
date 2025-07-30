import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalytics } from "@/hooks/useAnalytics"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileCheck,
  TrendingUp,
  ExternalLink,
  Download
} from "lucide-react"

export function ComplianceManager() {
  const { 
    requirements, 
    loading, 
    calculateOverallComplianceScore, 
    getCriticalIssues, 
    getComplianceByCategory 
  } = useAnalytics()

  const overallScore = calculateOverallComplianceScore()
  const criticalIssues = getCriticalIssues()
  const complianceByCategory = getComplianceByCategory()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-warning text-warning-foreground">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="border-info text-info">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 95) return <Badge variant="secondary" className="bg-success text-success-foreground">Excellent</Badge>
    if (score >= 85) return <Badge variant="secondary" className="bg-info text-info-foreground">Good</Badge>
    if (score >= 70) return <Badge variant="outline" className="border-warning text-warning">Needs Improvement</Badge>
    return <Badge variant="destructive">Critical</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading compliance data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{overallScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requirements</p>
                <p className="text-2xl font-bold">{requirements.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">{criticalIssues.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Standards</p>
                <p className="text-2xl font-bold">{new Set(requirements.map(r => r.standard_name)).size}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="issues">Critical Issues</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score Breakdown</CardTitle>
                <CardDescription>Performance across all compliance standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{category.score}%</span>
                    </div>
                    <Progress value={category.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>Scheduled compliance reviews and audits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-info" />
                      <span className="text-sm">GlobalGAP Audit</span>
                    </div>
                    <span className="text-sm text-muted-foreground">In 2 weeks</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-sm">Organic Review</span>
                    </div>
                    <span className="text-sm text-muted-foreground">In 1 month</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Fair Trade Inspection</span>
                    </div>
                    <span className="text-sm text-muted-foreground">In 3 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{requirement.standard_name}</h3>
                        {getPriorityBadge(requirement.priority)}
                        {getScoreBadge(requirement.compliance_score)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{requirement.category}</p>
                      <p className="text-sm">{requirement.requirement_text}</p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">{requirement.compliance_score}%</div>
                      <Progress value={requirement.compliance_score} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                  
                  {requirement.evidence_required.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Evidence Required:</p>
                      <div className="flex flex-wrap gap-1">
                        {requirement.evidence_required.map((evidence, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {evidence.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-muted-foreground">
                      {requirement.last_assessed && (
                        <span>Last assessed: {new Date(requirement.last_assessed).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {criticalIssues.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Critical Issues</h3>
                  <p className="text-muted-foreground">
                    All critical compliance requirements are meeting standards
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {criticalIssues.map((issue) => (
                <Card key={issue.id} className="border-destructive">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-destructive">{issue.standard_name}</h3>
                          <Badge variant="destructive">Critical</Badge>
                          <Badge variant="outline">{issue.compliance_score}%</Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.requirement_text}</p>
                        <p className="text-xs text-muted-foreground">Category: {issue.category}</p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Resolve Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceByCategory.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    {getScoreBadge(category.score)}
                  </div>
                  <CardDescription>{category.count} requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{category.score}%</div>
                      <Progress value={category.score} className="mt-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button size="sm" variant="outline">
                        <FileCheck className="h-4 w-4 mr-2" />
                        View Requirements
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}