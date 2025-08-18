import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Loader2,
  Database,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  FileText
} from 'lucide-react'
import { DemoSystemManager, type DemoProgress } from '@/services/demoSystem'
import { useToast } from '@/hooks/use-toast'

export function DemoController() {
  const [progress, setProgress] = useState<DemoProgress | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const { toast } = useToast()

  const demoManager = new DemoSystemManager((progress) => {
    setProgress(progress)
  })

  const handleGenerateDemo = async () => {
    setIsGenerating(true)
    setProgress(null)

    try {
      const success = await demoManager.generateCompleteDemoData()
      
      if (success) {
        setLastGenerated(new Date())
        toast({
          title: "🎉 Demo System Ready!",
          description: "Complete demo data has been generated for all modules",
        })
      } else {
        toast({
          title: "Demo Generation Failed",
          description: "Please try again or check your connection",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Demo generation error:', error)
      toast({
        title: "Demo Generation Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }

  const handleCleanupDemo = async () => {
    setIsCleaningUp(true)

    try {
      const success = await demoManager.cleanupDemoData()
      
      if (success) {
        setLastGenerated(null)
        toast({
          title: "🧹 Demo Data Cleaned",
          description: "All demo data has been removed",
        })
      } else {
        toast({
          title: "Cleanup Failed",
          description: "Some demo data may still remain",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      toast({
        title: "Cleanup Error",
        description: "An unexpected error occurred during cleanup",
        variant: "destructive"
      })
    } finally {
      setIsCleaningUp(false)
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'farms': return Database
      case 'iot': return Zap
      case 'data': return Activity
      case 'compliance': return Shield
      case 'exports': return FileText
      case 'analytics': return TrendingUp
      default: return Database
    }
  }

  const demoFeatures = [
    { name: 'Farms & Crops', description: '3 realistic farms with diverse operations', icon: Database },
    { name: 'IoT Sensors', description: '18+ sensors with 3 days of historical data', icon: Zap },
    { name: 'Real-time Data', description: 'Live sensor readings and WebSocket streams', icon: Activity },
    { name: 'Compliance Records', description: 'Certifications and audit documentation', icon: Shield },
    { name: 'Export Documents', description: 'Phytosanitary and quality certificates', icon: FileText },
    { name: 'Analytics Reports', description: 'AI-generated insights and trends', icon: TrendingUp }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Demo System Controller
          </CardTitle>
          <CardDescription>
            Generate comprehensive demo data for all platform modules or clean up existing demo data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Demo Status</div>
              <div className="text-sm text-muted-foreground">
                {lastGenerated 
                  ? `Last generated: ${lastGenerated.toLocaleString()}`
                  : 'No demo data currently active'
                }
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastGenerated && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(getStageIcon(progress.stage), { className: "h-4 w-4" })}
                  <span className="font-medium capitalize">{progress.stage}</span>
                </div>
                <span className="text-sm text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateDemo}
              disabled={isGenerating || isCleaningUp}
              size="lg"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Demo...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Complete Demo
                </>
              )}
            </Button>

            {lastGenerated && (
              <Button
                onClick={handleCleanupDemo}
                disabled={isGenerating || isCleaningUp}
                variant="outline"
                size="lg"
              >
                {isCleaningUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Demo
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Features</CardTitle>
          <CardDescription>
            Complete demonstration environment covering all platform capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Getting Started:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click "Generate Complete Demo" to create comprehensive demo data</li>
              <li>Navigate to any module (Dashboard, IoT Monitoring, etc.) to explore features</li>
              <li>All data is marked as demo content and can be safely reset</li>
              <li>Use "Reset Demo" to clean up and start fresh</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">What's Included:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Multiple farm operations with different crops and scales</li>
              <li>Complete IoT sensor network with realistic historical data</li>
              <li>Working WebSocket simulation for real-time monitoring</li>
              <li>Compliance certificates and audit records</li>
              <li>Export documentation with blockchain verification</li>
              <li>AI-generated analytics and insights</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}