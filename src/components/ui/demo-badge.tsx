import { Badge } from "@/components/ui/badge"
import { Database, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DemoBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "secondary" | "outline"
}

export function DemoBadge({ className, size = "sm", variant = "secondary" }: DemoBadgeProps) {
  return (
    <Badge 
      variant={variant}
      className={cn(
        "flex items-center gap-1 font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1", 
        size === "lg" && "text-base px-4 py-2",
        "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200",
        className
      )}
    >
      <Sparkles className={cn(
        size === "sm" && "h-3 w-3",
        size === "md" && "h-4 w-4",
        size === "lg" && "h-5 w-5"
      )} />
      Demo Data
    </Badge>
  )
}

interface DemoIndicatorProps {
  className?: string
  message?: string
}

export function DemoIndicator({ className, message = "This data is for demonstration purposes" }: DemoIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg",
      className
    )}>
      <Database className="h-4 w-4 text-blue-600" />
      <span className="text-sm text-blue-800 font-medium">{message}</span>
      <DemoBadge />
    </div>
  )
}