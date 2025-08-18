import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Sparkles,
  Database,
  Zap,
  Brain,
  FileText,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { DemoController } from "@/components/demo/DemoController"
import { Link } from "react-router-dom"

export default function DemoShowcase() {
  const modules = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: BarChart3,
      description: "Real-time farm overview with key metrics, weather integration, and market intelligence",
      features: ["Live sensor data", "Weather alerts", "Market prices", "Performance KPIs"],
      badge: "Central Hub"
    },
    {
      name: "Farm Management", 
      path: "/farm-management",
      icon: Database,
      description: "Comprehensive farm and crop management with detailed tracking and planning",
      features: ["Multiple farms", "Crop lifecycle", "Field mapping", "Resource planning"],
      badge: "Core Module"
    },
    {
      name: "IoT Monitoring",
      path: "/iot",
      icon: Zap,
      description: "Advanced sensor networks with real-time data streaming and analytics",
      features: ["18+ sensors", "WebSocket streams", "Historical data", "Automated alerts"],
      badge: "Real-time"
    },
    {
      name: "Compliance Center",
      path: "/compliance",
      icon: Shield,
      description: "AI-powered compliance analysis and certification management",
      features: ["Proprietary AI analysis", "Multiple standards", "Audit trails", "Automated reports"],
      badge: "AI Powered"
    },
    {
      name: "Export Documents",
      path: "/export-documents", 
      icon: FileText,
      description: "Blockchain-verified export documentation with QR code traceability",
      features: ["Blockchain verification", "QR traceability", "Multiple formats", "Automated generation"],
      badge: "Blockchain"
    },
    {
      name: "AI Assistant",
      path: "/ai-assistant",
      icon: Brain,
      description: "Intelligent farming assistant with crop analysis and expert consultation",
      features: ["Crop image analysis", "Expert consultation", "Predictive insights", "24/7 availability"],
      badge: "AI Assistant"
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      description: "Advanced analytics with predictive modeling and performance insights",
      features: ["Predictive analytics", "Custom reports", "Trend analysis", "Export capabilities"],
      badge: "Advanced"
    }
  ]

  const platformHighlights = [
    {
      title: "Proprietary AI Technology",
      description: "Advanced machine learning algorithms specifically designed for agricultural applications",
      icon: Brain
    },
    {
      title: "Blockchain Verification",
      description: "Immutable record-keeping and traceability for export documentation",
      icon: Shield
    },
    {
      title: "Real-time IoT Integration", 
      description: "WebSocket-based sensor networks with sub-second data processing",
      icon: Zap
    },
    {
      title: "Mobile-First Design",
      description: "Progressive web app optimized for field operations and mobile devices",
      icon: Smartphone
    },
    {
      title: "Global Market Integration",
      description: "Real-time commodity prices and export opportunity identification",
      icon: Globe
    },
    {
      title: "Compliance Automation",
      description: "Automated compliance monitoring for major international standards",
      icon: CheckCircle
    }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Agricultural Intelligence Platform
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Next-generation farm management with AI-powered insights, real-time IoT monitoring, 
          and blockchain-verified export documentation
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Live Demo Environment
          </Badge>
          <Badge variant="outline">
            Proprietary AI Powered
          </Badge>
        </div>
      </div>

      {/* Demo Controller */}
      <DemoController />

      <Separator />

      {/* Platform Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Platform Highlights
          </CardTitle>
          <CardDescription>
            Cutting-edge technology stack designed for modern agricultural operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-br from-background to-muted/20">
                <highlight.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Module Showcase</CardTitle>
          <CardDescription>
            Explore all platform modules with comprehensive demo data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <module.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {module.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {module.description}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <Link to={module.path}>
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Explore {module.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
          <CardDescription>
            Enterprise-grade technology stack for scalable agricultural operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Proprietary AI</h4>
              <p className="text-xs text-muted-foreground mt-1">Advanced ML models for agriculture</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Real-time Processing</h4>
              <p className="text-xs text-muted-foreground mt-1">WebSocket streams & live analytics</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Blockchain Security</h4>
              <p className="text-xs text-muted-foreground mt-1">Immutable data & verification</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold">Global Integration</h4>
              <p className="text-xs text-muted-foreground mt-1">Market data & export systems</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}