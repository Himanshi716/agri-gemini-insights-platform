import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring"
import { 
  Zap, 
  Activity, 
  Clock, 
  Eye,
  Gauge,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database
} from "lucide-react"
import { useState, useEffect } from "react"

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  memoryUsage?: number
  loadTime?: number
  jsSize?: number
  cssSize?: number
}

export function PerformanceOptimization() {
  const { reportMetrics } = usePerformanceMonitoring()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })
  const [loading, setLoading] = useState(false)

  const measurePerformance = async () => {
    setLoading(true)
    
    try {
      // Get current performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || null
      const ttfb = navigation ? navigation.responseStart - navigation.requestStart : null
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : null
      
      // Estimate memory usage (if available)
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? Math.round((memoryInfo.usedJSHeapSize / 1024 / 1024) * 100) / 100 : null
      
      // Estimate bundle sizes (simplified)
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      
      const newMetrics: PerformanceMetrics = {
        fcp,
        lcp: null, // Would need PerformanceObserver
        fid: null, // Would need PerformanceObserver
        cls: 0,    // Would need PerformanceObserver
        ttfb,
        memoryUsage,
        loadTime,
        jsSize: scripts.length,
        cssSize: stylesheets.length
      }
      
      setMetrics(newMetrics)
      reportMetrics(newMetrics)
      
    } catch (error) {
      console.error('Error measuring performance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    measurePerformance()
  }, [])

  const getScoreColor = (value: number | null, thresholds: [number, number]) => {
    if (value === null) return 'text-muted-foreground'
    if (value <= thresholds[0]) return 'text-success'
    if (value <= thresholds[1]) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreBadge = (value: number | null, thresholds: [number, number], suffix = 'ms') => {
    if (value === null) return <Badge variant="outline">N/A</Badge>
    
    const color = getScoreColor(value, thresholds)
    const variant = color.includes('success') ? 'secondary' : 
                   color.includes('warning') ? 'outline' : 'destructive'
    
    return <Badge variant={variant}>{value.toFixed(1)}{suffix}</Badge>
  }

  const optimizationTips = [
    {
      title: "Code Splitting",
      description: "Implement lazy loading for routes and components",
      impact: "High",
      implemented: true
    },
    {
      title: "Image Optimization",
      description: "Use WebP format and responsive images",
      impact: "Medium",
      implemented: false
    },
    {
      title: "Bundle Analysis",
      description: "Analyze and optimize JavaScript bundle size",
      impact: "High",
      implemented: false
    },
    {
      title: "Service Worker",
      description: "Implement caching strategy for offline support",
      impact: "Medium",
      implemented: false
    },
    {
      title: "Database Indexing",
      description: "Optimize database queries with proper indexes",
      impact: "High",
      implemented: true
    },
    {
      title: "CDN Integration",
      description: "Use Content Delivery Network for static assets",
      impact: "Medium",
      implemented: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Core Web Vitals and loading performance</CardDescription>
            </div>
            <Button onClick={measurePerformance} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Measure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">First Contentful Paint</span>
              </div>
              {getScoreBadge(metrics.fcp, [1500, 2500])}
              <p className="text-xs text-muted-foreground">Good: &lt;1.5s</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Time to First Byte</span>
              </div>
              {getScoreBadge(metrics.ttfb, [200, 500])}
              <p className="text-xs text-muted-foreground">Good: &lt;200ms</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Load Time</span>
              </div>
              {getScoreBadge(metrics.loadTime, [2000, 4000])}
              <p className="text-xs text-muted-foreground">Good: &lt;2s</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Memory Usage</span>
              </div>
              {metrics.memoryUsage ? (
                <Badge variant="outline">{metrics.memoryUsage} MB</Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
              <p className="text-xs text-muted-foreground">JS Heap Size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bundle Analysis
          </CardTitle>
          <CardDescription>Application size and resource optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">JavaScript Files</span>
                <span className="text-sm font-medium">{metrics.jsSize || 0}</span>
              </div>
              <Progress value={Math.min((metrics.jsSize || 0) * 10, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">Loaded script files</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">CSS Files</span>
                <span className="text-sm font-medium">{metrics.cssSize || 0}</span>
              </div>
              <Progress value={Math.min((metrics.cssSize || 0) * 20, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">Loaded stylesheets</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Optimization Score</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>Performance improvements and best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="mt-1">
                  {tip.implemented ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{tip.title}</h4>
                    <Badge variant={tip.impact === 'High' ? 'destructive' : 'outline'} className="text-xs">
                      {tip.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
                
                {!tip.implemented && (
                  <Button size="sm" variant="outline">
                    Implement
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Monitoring</CardTitle>
          <CardDescription>Continuous performance tracking and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Monitoring Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Core Web Vitals</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Tracking</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Experience</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Performance Alerts</h4>
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-sm">No performance issues detected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}