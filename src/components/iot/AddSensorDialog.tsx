import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
import { Loader2, MapPin } from "lucide-react"

interface AddSensorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddSensorDialog({ open, onOpenChange, onSuccess }: AddSensorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    farm_id: "",
    device_id: "",
    location_description: "",
    latitude: "",
    longitude: ""
  })
  const { toast } = useToast()

  const sensorTypes = [
    { value: "temperature", label: "Temperature Sensor" },
    { value: "humidity", label: "Humidity Sensor" },
    { value: "soil_moisture", label: "Soil Moisture Sensor" },
    { value: "ph", label: "pH Sensor" },
    { value: "light", label: "Light Sensor" },
    { value: "co2", label: "CO2 Sensor" }
  ]

  // Fetch user's farms when dialog opens
  useEffect(() => {
    if (open) {
      fetchFarms()
    }
  }, [open])

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, name, location_address')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setFarms(data || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
      toast({
        title: "Error",
        description: "Failed to load farms",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.farm_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const sensorData = {
        name: formData.name,
        type: formData.type as Database['public']['Enums']['sensor_type'],
        farm_id: formData.farm_id,
        device_id: formData.device_id || null,
        location_description: formData.location_description || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_active: true
      }

      const { error } = await supabase
        .from('iot_sensors')
        .insert(sensorData)

      if (error) throw error

      toast({
        title: "Sensor Added",
        description: `${formData.name} has been successfully added`,
      })

      setFormData({
        name: "",
        type: "",
        farm_id: "",
        device_id: "",
        location_description: "",
        latitude: "",
        longitude: ""
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding sensor:', error)
      toast({
        title: "Error",
        description: "Failed to add sensor. Please try again.",
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
          <DialogTitle>Add New IoT Sensor</DialogTitle>
          <DialogDescription>
            Configure a new sensor to monitor environmental conditions on your farm
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sensor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Greenhouse Temperature"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Sensor Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {sensorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="farm">Farm Location *</Label>
            <Select value={formData.farm_id} onValueChange={(value) => setFormData(prev => ({ ...prev, farm_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name} - {farm.location_address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_id">Device ID</Label>
            <Input
              id="device_id"
              value={formData.device_id}
              onChange={(e) => setFormData(prev => ({ ...prev, device_id: e.target.value }))}
              placeholder="Hardware device identifier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_description">Location Description</Label>
            <Textarea
              id="location_description"
              value={formData.location_description}
              onChange={(e) => setFormData(prev => ({ ...prev, location_description: e.target.value }))}
              placeholder="e.g., North greenhouse, Section A"
              rows={2}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Sensor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}