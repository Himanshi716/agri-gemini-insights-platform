import { MetricsCard } from "@/components/dashboard/MetricsCard"
import { AlertsList } from "@/components/dashboard/AlertsList"
import { ExportStatus } from "@/components/dashboard/ExportStatus"
import { Leaf, Thermometer, Droplets, Shield, TrendingUp, Users } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Farm Dashboard</h1>
        <p className="text-muted-foreground">Overview of your agricultural operations and export readiness</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Active Farms"
          value={12}
          description="+2 from last month"
          icon={Leaf}
          trend="up"
        />
        
        <MetricsCard
          title="Avg Temperature"
          value="24°C"
          description="Optimal range"
          icon={Thermometer}
          trend="neutral"
          badge={{ text: "Optimal", variant: "secondary" }}
        />
        
        <MetricsCard
          title="Soil Moisture"
          value="68%"
          description="Good levels"
          icon={Droplets}
          trend="up"
          badge={{ text: "Good", variant: "secondary" }}
        />
        
        <MetricsCard
          title="Compliance Score"
          value="94%"
          description="Export ready"
          icon={Shield}
          trend="up"
          badge={{ text: "Excellent", variant: "default" }}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard
          title="Total Yield"
          value="2,847 kg"
          description="+15% this season"
          icon={TrendingUp}
          trend="up"
        />
        
        <MetricsCard
          title="Active Workers"
          value={28}
          description="On-site today"
          icon={Users}
          trend="neutral"
        />
        
        <MetricsCard
          title="Export Revenue"
          value="$45,200"
          description="+8% this quarter"
          icon={TrendingUp}
          trend="up"
          badge={{ text: "Strong", variant: "default" }}
        />
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsList />
        <ExportStatus />
      </div>
    </div>
  )
}