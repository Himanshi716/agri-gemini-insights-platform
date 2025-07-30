import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNativeCapabilities } from "@/hooks/useNativeCapabilities"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { 
  Camera, 
  MapPin, 
  Smartphone, 
  Wifi, 
  WifiOff,
  CheckCircle,
  XCircle,
  Download,
  Share2
} from "lucide-react"

export function MobileCapabilities() {
  const { 
    capabilities, 
    deviceInfo, 
    networkStatus, 
    takePhoto, 
    getCurrentLocation, 
    isNativeApp 
  } = useNativeCapabilities()
  
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [lastPhoto, setLastPhoto] = useState<string | null>(null)
  const [lastLocation, setLastLocation] = useState<any>(null)

  const handleTakePhoto = async () => {
    if (!capabilities.camera) {
      toast({
        title: "Camera not available",
        description: "Camera functionality is only available in the mobile app",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const photoData = await takePhoto()
      if (photoData) {
        setLastPhoto(photoData)
        toast({
          title: "Photo captured!",
          description: "Photo taken successfully and ready for crop analysis"
        })
      }
    } catch (error) {
      toast({
        title: "Camera error",
        description: "Failed to take photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = async () => {
    if (!capabilities.geolocation) {
      toast({
        title: "Location not available",
        description: "Location services are not available",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const location = await getCurrentLocation()
      if (location) {
        setLastLocation(location)
        toast({
          title: "Location obtained!",
          description: `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        })
      }
    } catch (error) {
      toast({
        title: "Location error",
        description: "Failed to get location. Please check permissions.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCapabilityIcon = (available: boolean) => {
    return available ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Platform Status
          </CardTitle>
          <CardDescription>
            Mobile app capabilities and device information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Platform Type:</span>
            <Badge variant={isNativeApp() ? "secondary" : "outline"}>
              {isNativeApp() ? "Native Mobile App" : "Web Browser"}
            </Badge>
          </div>
          
          {deviceInfo && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Device:</span>
                <span className="text-sm font-medium">{deviceInfo.platform}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">OS Version:</span>
                <span className="text-sm font-medium">{deviceInfo.operatingSystem} {deviceInfo.version}</span>
              </div>
              
              {deviceInfo.model && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Model:</span>
                  <span className="text-sm font-medium">{deviceInfo.model}</span>
                </div>
              )}
            </>
          )}

          {networkStatus && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Network:</span>
              <div className="flex items-center gap-2">
                {networkStatus.connected ? (
                  <Wifi className="h-4 w-4 text-success" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium">
                  {networkStatus.connected ? networkStatus.connectionType : 'Offline'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Capabilities</CardTitle>
          <CardDescription>Available native features for enhanced farming functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="text-sm">Camera</span>
              </div>
              {getCapabilityIcon(capabilities.camera)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">GPS</span>
              </div>
              {getCapabilityIcon(capabilities.geolocation)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Device Info</span>
              </div>
              {getCapabilityIcon(capabilities.device)}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Network</span>
              </div>
              {getCapabilityIcon(capabilities.network)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera & Crop Analysis
          </CardTitle>
          <CardDescription>Take photos for AI-powered crop analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTakePhoto} 
            disabled={!capabilities.camera || loading}
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            {loading ? "Taking Photo..." : "Take Photo"}
          </Button>
          
          {lastPhoto && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Last captured photo:</p>
              <div className="relative">
                <img 
                  src={lastPhoto} 
                  alt="Captured crop" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {!capabilities.camera && (
            <div className="text-center py-4 text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Camera feature is available in the mobile app</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS & Field Mapping
          </CardTitle>
          <CardDescription>Get precise location for field and sensor mapping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGetLocation} 
            disabled={!capabilities.geolocation || loading}
            className="w-full"
            variant="outline"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {loading ? "Getting Location..." : "Get Current Location"}
          </Button>
          
          {lastLocation && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current coordinates:</p>
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Latitude:</span>
                  <span className="text-sm font-mono">{lastLocation.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Longitude:</span>
                  <span className="text-sm font-mono">{lastLocation.longitude.toFixed(6)}</span>
                </div>
                {lastLocation.accuracy && (
                  <div className="flex justify-between">
                    <span className="text-sm">Accuracy:</span>
                    <span className="text-sm font-mono">{lastLocation.accuracy.toFixed(1)}m</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile App Instructions */}
      {!isNativeApp() && (
        <Card className="border-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-info" />
              Mobile App Available
            </CardTitle>
            <CardDescription>
              Get the full experience with native mobile capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To access camera, GPS, and other native features, you can build and install the mobile app:
            </p>
            
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Export this project to GitHub using the "Export to GitHub" button</li>
              <li>Clone the repository to your development machine</li>
              <li>Run <code className="bg-muted px-1 rounded">npm install</code></li>
              <li>Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios</code> or <code className="bg-muted px-1 rounded">npx cap add android</code></li>
              <li>Build the project: <code className="bg-muted px-1 rounded">npm run build</code></li>
              <li>Sync to native: <code className="bg-muted px-1 rounded">npx cap sync</code></li>
              <li>Run on device: <code className="bg-muted px-1 rounded">npx cap run ios</code> or <code className="bg-muted px-1 rounded">npx cap run android</code></li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}