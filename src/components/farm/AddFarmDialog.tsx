import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, MapPin } from "lucide-react"

interface AddFarmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddFarmDialog({ open, onOpenChange, onSuccess }: AddFarmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location_address: "",
    size_hectares: "",
    latitude: "",
    longitude: "",
    certifications: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Farm name is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const farmData = {
        name: formData.name,
        description: formData.description || null,
        location_address: formData.location_address || null,
        size_hectares: formData.size_hectares ? parseFloat(formData.size_hectares) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        certifications: formData.certifications ? 
          formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert) : 
          null,
        user_id: user.id,
        status: 'active' as const
      }

      const { error } = await supabase
        .from('farms')
        .insert(farmData)

      if (error) throw error

      toast({
        title: "Farm Added",
        description: `${formData.name} has been successfully created`,
      })

      setFormData({
        name: "",
        description: "",
        location_address: "",
        size_hectares: "",
        latitude: "",
        longitude: "",
        certifications: ""
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding farm:', error)
      toast({
        title: "Error",
        description: "Failed to create farm. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          toast({
            title: "Location Updated",
            description: "GPS coordinates have been added",
          })
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive"
          })
        }
      )
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Farm</DialogTitle>
          <DialogDescription>
            Create a new farm to manage crops, sensors, and agricultural operations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Farm Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Green Valley Farm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your farm and operations"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Address</Label>
            <Textarea
              id="location_address"
              value={formData.location_address}
              onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
              placeholder="Full address of the farm"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size_hectares">Size (Hectares)</Label>
            <Input
              id="size_hectares"
              type="number"
              step="0.1"
              value={formData.size_hectares}
              onChange={(e) => setFormData(prev => ({ ...prev, size_hectares: e.target.value }))}
              placeholder="e.g., 150.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 37.7749"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., -122.4194"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Get Current Location
          </Button>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
              placeholder="e.g., Organic, Fair Trade, GAP (comma-separated)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Farm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}