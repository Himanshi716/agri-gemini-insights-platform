import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Brain, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Download,
  Calendar
} from 'lucide-react'
import { useGeminiChat } from '@/hooks/useGeminiChat'
import { useFarmData } from '@/hooks/useFarmData'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const complianceStandards = [
  { id: 'organic', name: 'USDA Organic', description: 'United States Department of Agriculture Organic Standards' },
  { id: 'gmp', name: 'Good Manufacturing Practices', description: 'GMP for Agricultural Operations' },
  { id: 'haccp', name: 'HACCP', description: 'Hazard Analysis and Critical Control Points' },
  { id: 'globalgap', name: 'GlobalGAP', description: 'Global Good Agricultural Practice' },
  { id: 'sqs', name: 'SQF', description: 'Safe Quality Food Program' },
  { id: 'brc', name: 'BRC Global Standards', description: 'British Retail Consortium Food Safety' },
  { id: 'iso22000', name: 'ISO 22000', description: 'Food Safety Management Systems' }
]

const complianceAreas = [
  { id: 'food_safety', name: 'Food Safety', icon: Shield },
  { id: 'environmental', name: 'Environmental Impact', icon: TrendingUp },
  { id: 'worker_safety', name: 'Worker Safety', icon: CheckCircle },
  { id: 'traceability', name: 'Traceability', icon: FileText },
  { id: 'pest_management', name: 'Pest Management', icon: AlertTriangle },
  { id: 'water_quality', name: 'Water Quality', icon: TrendingUp }
]

interface ComplianceAnalysis {
  overall_score: number
  standard_specific_scores: Record<string, number>
  recommendations: string[]
  critical_issues: string[]
  documentation_gaps: string[]
  action_plan: string[]
  timeline: string
  estimated_cost: string
}

export function GeminiComplianceAnalyzer() {
  const [selectedStandards, setSelectedStandards] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [farmId, setFarmId] = useState<string>('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  const { generateComplianceReport } = useGeminiChat()
  const { farms } = useFarmData()
  const { toast } = useToast()

  const handleStandardToggle = (standardId: string) => {
    setSelectedStandards(prev => 
      prev.includes(standardId) 
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    )
  }

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const runComplianceAnalysis = async () => {
    if (!farmId || selectedStandards.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a farm and at least one compliance standard",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('compliance-analysis', {
        body: {
          farm_id: farmId,
          standards: selectedStandards,
          focus_areas: selectedAreas,
          additional_context: additionalContext,
          analysis_type: 'comprehensive'
        }
      })

      if (error) throw error

      const analysisResult: ComplianceAnalysis = {
        overall_score: data.overall_score || 0,
        standard_specific_scores: data.standard_scores || {},
        recommendations: data.recommendations || [],
        critical_issues: data.critical_issues || [],
        documentation_gaps: data.documentation_gaps || [],
        action_plan: data.action_plan || [],
        timeline: data.timeline || 'TBD',
        estimated_cost: data.estimated_cost || 'TBD'
      }

      setAnalysis(analysisResult)
      
      toast({
        title: "🔍 Analysis Complete",
        description: "Compliance analysis has been completed"
      })
    } catch (error) {
      console.error('Compliance analysis error:', error)
      toast({
        title: "Analysis Error",
        description: "Failed to complete compliance analysis",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateDetailedReport = async () => {
    if (!analysis) return

    setIsGeneratingReport(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('document-generator', {
        body: {
          template_type: 'compliance_report',
          farm_id: farmId,
          data: {
            analysis,
            standards: selectedStandards,
            areas: selectedAreas,
            context: additionalContext
          }
        }
      })

      if (error) throw error

      // Create downloadable report
      const reportBlob = new Blob([data.document], { type: 'application/pdf' })
      const url = URL.createObjectURL(reportBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      
      toast({
        title: "📄 Report Generated",
        description: "Compliance report has been downloaded"
      })
    } catch (error) {
      console.error('Report generation error:', error)
      toast({
        title: "Report Error",
        description: "Failed to generate compliance report",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Critical'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Compliance Analyzer
          </CardTitle>
          <CardDescription>
            Comprehensive compliance analysis powered by Proprietary AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Farm Selection */}
          <div className="space-y-2">
            <Label>Select Farm</Label>
            <Select value={farmId} onValueChange={setFarmId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a farm to analyze" />
              </SelectTrigger>
              <SelectContent>
                {farms.map(farm => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name} - {farm.location_address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Standards Selection */}
          <div className="space-y-3">
            <Label>Compliance Standards</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complianceStandards.map(standard => (
                <div key={standard.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={standard.id}
                    checked={selectedStandards.includes(standard.id)}
                    onCheckedChange={() => handleStandardToggle(standard.id)}
                  />
                  <Label htmlFor={standard.id} className="text-sm font-medium">
                    {standard.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-3">
            <Label>Focus Areas (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {complianceAreas.map(area => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={area.id}
                    checked={selectedAreas.includes(area.id)}
                    onCheckedChange={() => handleAreaToggle(area.id)}
                  />
                  <Label htmlFor={area.id} className="text-sm font-medium">
                    {area.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label>Additional Context (Optional)</Label>
            <Textarea
              placeholder="Provide any additional information about your farm operations, recent changes, or specific concerns..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={runComplianceAnalysis}
            disabled={!farmId || selectedStandards.length === 0 || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Compliance...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run AI Compliance Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">
                  <span className={getScoreColor(analysis.overall_score)}>
                    {analysis.overall_score}%
                  </span>
                </div>
                <div className="flex-1">
                  <Progress value={analysis.overall_score} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {getScoreLabel(analysis.overall_score)} compliance rating
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standard-Specific Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Standard-Specific Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis.standard_specific_scores).map(([standardId, score]) => {
                  const standard = complianceStandards.find(s => s.id === standardId)
                  return (
                    <div key={standardId} className="flex items-center justify-between">
                      <span className="font-medium">{standard?.name || standardId}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={score} className="w-32" />
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {analysis.critical_issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.critical_issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Action Plan
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">Timeline: {analysis.timeline}</Badge>
                <Badge variant="outline">Est. Cost: {analysis.estimated_cost}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.action_plan.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-xs bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Detailed Report
              </CardTitle>
              <CardDescription>
                Create a comprehensive compliance report for documentation and auditing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={generateDetailedReport}
                disabled={isGeneratingReport}
                className="w-full"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Compliance Report (PDF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}