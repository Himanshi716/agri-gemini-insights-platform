
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Leaf, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Wifi, 
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { Link } from "react-router-dom"

const features = [
  {
    icon: Leaf,
    title: "Farm Management",
    description: "Comprehensive farm and crop management with field mapping capabilities"
  },
  {
    icon: Wifi,
    title: "IoT Monitoring",
    description: "Real-time sensor data collection and environmental monitoring"
  },
  {
    icon: Shield,
    title: "Compliance Center",
    description: "Automated compliance tracking and certification management"
  },
  {
    icon: FileText,
    title: "Export Documentation",
    description: "Streamlined export document generation and processing"
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Advanced AI-powered agricultural insights and assistance"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Predictive analytics and comprehensive reporting"
  }
]

const benefits = [
  "Increase export efficiency by 40%",
  "Reduce compliance costs by 60%",
  "Real-time farm monitoring",
  "AI-powered crop optimization",
  "Automated documentation",
  "Global certification support"
]

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AgriExport Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Phase 1 Complete</Badge>
            <Link to="/auth">
              <Button>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge className="mb-4">Enterprise Agricultural Platform</Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">
            Revolutionize Your
            <span className="text-primary block">Agricultural Exports</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive platform powered by Advanced AI for farm management, 
            compliance tracking, and export optimization with real-time IoT monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Platform Features</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete agricultural technology stack built for modern export operations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">Why Choose AgriExport?</h3>
              <p className="text-muted-foreground">
                Proven results from our enterprise-grade agricultural platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl font-bold text-foreground">Ready to Transform Your Farm?</h3>
          <p className="text-muted-foreground text-lg">
            Join thousands of farmers already using our platform to optimize their export operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">AgriExport Platform</span>
          </div>
          <p className="text-muted-foreground">
            Enterprise Agricultural Technology • Phase 1 Implementation Complete
          </p>
        </div>
      </footer>
    </div>
  )
}
