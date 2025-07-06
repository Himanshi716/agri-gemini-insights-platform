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
import { Loader2, Calendar } from "lucide-react"

interface AddCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCropDialog({ open, onOpenChange, onSuccess }: AddCropDialogProps) {
  const [loading, setLoading] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    farm_id: "",
    area_hectares: "",
    planting_date: "",
    expected_harvest_date: "",
    notes: ""
  })
  const { toast } = useToast()

  // Common crop types for quick selection
  const commonCrops = [
    "Tomatoes", "Lettuce", "Peppers", "Cucumbers", "Carrots", "Onions",
    "Wheat", "Corn", "Rice", "Soybeans", "Potatoes", "Spinach",
    "Broccoli", "Cauliflower", "Cabbage", "Beans", "Peas", "Squash"
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
    
    if (!formData.name || !formData.farm_id) {
      toast({
        title: "Missing Information",
        description: "Crop name and farm selection are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const cropData = {
        name: formData.name,
        variety: formData.variety || null,
        farm_id: formData.farm_id,
        area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
        planting_date: formData.planting_date || null,
        expected_harvest_date: formData.expected_harvest_date || null,
        notes: formData.notes || null,
        status: 'planted' as Database['public']['Enums']['crop_status']
      }

      const { error } = await supabase
        .from('crops')
        .insert(cropData)

      if (error) throw error

      toast({
        title: "Crop Added",
        description: `${formData.name} has been successfully added`,
      })

      setFormData({
        name: "",
        variety: "",
        farm_id: "",
        area_hectares: "",
        planting_date: "",
        expected_harvest_date: "",
        notes: ""
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding crop:', error)
      toast({
        title: "Error",
        description: "Failed to add crop. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Crop</DialogTitle>
          <DialogDescription>
            Add a new crop to track planting, growth, and harvest schedules
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name *</Label>
              <Select value={formData.name} onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type crop" />
                </SelectTrigger>
                <SelectContent>
                  {commonCrops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                placeholder="e.g., Cherry, Beefsteak"
              />
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
            <Label htmlFor="area_hectares">Area (Hectares)</Label>
            <Input
              id="area_hectares"
              type="number"
              step="0.1"
              value={formData.area_hectares}
              onChange={(e) => setFormData(prev => ({ ...prev, area_hectares: e.target.value }))}
              placeholder="e.g., 2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planting_date">Planting Date</Label>
              <Input
                id="planting_date"
                type="date"
                value={formData.planting_date}
                onChange={(e) => setFormData(prev => ({ ...prev, planting_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_harvest_date">Expected Harvest</Label>
              <Input
                id="expected_harvest_date"
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_harvest_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about planting conditions, soil preparation, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Crop
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}