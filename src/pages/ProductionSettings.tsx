import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileCapabilities } from "@/components/mobile/MobileCapabilities"
import { PerformanceOptimization } from "@/components/optimization/PerformanceOptimization"
import { ComplianceManager } from "@/components/compliance/ComplianceManager"
import { 
  Smartphone, 
  Zap, 
  Shield,
  Settings
} from "lucide-react"

export default function ProductionSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Production Settings</h1>
        <p className="text-muted-foreground">
          Mobile capabilities, performance optimization, and production readiness
        </p>
      </div>

      <Tabs defaultValue="mobile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile App
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Deployment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-4">
          <MobileCapabilities />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceOptimization />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceManager />
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Deployment Configuration</h3>
            <p className="text-muted-foreground">
              Production deployment settings and environment configuration
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}