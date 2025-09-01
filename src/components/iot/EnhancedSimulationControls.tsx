import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Play, 
  Pause, 
  Square, 
  Signal, 
  Activity, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react'

interface SimulationControlsProps {
  sensorId: string
  sensorName: string
  isConnected: boolean
  onSubscribe: (sensorId: string) => void
  onSimulate: (sensorId: string, duration: number) => void
  onConnect: () => Promise<void>
}

export function EnhancedSimulationControls({ 
  sensorId, 
  sensorName, 
  isConnected, 
  onSubscribe, 
  onSimulate, 
  onConnect 
}: SimulationControlsProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [duration, setDuration] = useState<number>(30000) // 30 seconds default
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect()
      toast({
        title: "🔌 Connected",
        description: "WebSocket connection established",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not establish WebSocket connection",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSubscribe = () => {
    onSubscribe(sensorId)
    toast({
      title: "📡 Subscribed",
      description: `Now listening to ${sensorName} data`,
      variant: "default"
    })
  }

  const handleSimulate = () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsSimulating(false)
          toast({
            title: "✨ Simulation Complete",
            description: `Generated ${duration / 1000}s of sensor data`,
            variant: "default"
          })
          return 100
        }
        return prev + 2 // Update every 100ms for smooth progress
      })
    }, duration / 50) // 50 updates over the duration

    onSimulate(sensorId, duration)
  }

  const durationOptions = [
    { value: 10000, label: "10 seconds", icon: "⚡" },
    { value: 30000, label: "30 seconds", icon: "🏃" },
    { value: 60000, label: "1 minute", icon: "⏱️" },
    { value: 300000, label: "5 minutes", icon: "⏰" }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Simulation Controls
          </CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? <Signal className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </div>
        <CardDescription>
          Manage real-time data streaming and simulation for {sensorName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status & Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3" />
                      Connect
                    </>
                  )}
                </Button>
              )}
              {isConnected && (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={handleSubscribe}
                  className="flex items-center gap-1"
                >
                  <Signal className="h-3 w-3" />
                  Subscribe
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data Simulation</span>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSimulating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating data...</span>
                <span>{Math.round(simulationProgress)}%</span>
              </div>
              <Progress value={simulationProgress} className="h-2" />
            </div>
          )}

          <Button
            onClick={handleSimulate}
            disabled={!isConnected || isSimulating}
            className="w-full flex items-center gap-2"
            variant={isSimulating ? "secondary" : "default"}
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulating ({Math.round(simulationProgress)}%)
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Simulation
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Test Connection
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Activity className="h-3 w-3 mr-1" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}