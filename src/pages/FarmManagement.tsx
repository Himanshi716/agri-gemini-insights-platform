import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Plus, MapPin, Sprout, Calendar, Settings, Activity, Trash2 } from "lucide-react"
import { useFarmData } from "@/hooks/useFarmData"
import { AddFarmDialog } from "@/components/farm/AddFarmDialog"
import { AddCropDialog } from "@/components/farm/AddCropDialog"
import { useToast } from "@/hooks/use-toast"

export default function FarmManagement() {
  const { farms, crops, loading, refetch, deleteFarm, updateCropStatus, createDemoData } = useFarmData()
  const [showAddFarmDialog, setShowAddFarmDialog] = useState(false)
  const [showAddCropDialog, setShowAddCropDialog] = useState(false)
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
      case 'maintenance':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Maintenance</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCropStatusBadge = (status: string) => {
    switch (status) {
      case 'planted':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Planted</Badge>
      case 'growing':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Growing</Badge>
      case 'harvesting':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Harvesting</Badge>
      case 'harvested':
        return <Badge variant="secondary" className="bg-primary text-primary-foreground">Harvested</Badge>
      case 'processed':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Processed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDeleteFarm = async (farmId: string, farmName: string) => {
    if (window.confirm(`Are you sure you want to delete "${farmName}"? This will also remove all associated crops and sensors.`)) {
      await deleteFarm(farmId)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading farm data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farm Management</h1>
          <p className="text-muted-foreground">Manage your farms, fields, and crop planning</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddFarmDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Farm
          </Button>
          {farms.length === 0 && (
            <Button 
              variant="outline" 
              onClick={createDemoData}
            >
              <Activity className="h-4 w-4 mr-2" />
              Create Demo Data
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="farms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="farms">Farms</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="space-y-4">
          {farms.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No Farms Found</h3>
                  <p className="text-muted-foreground">
                    Get started by adding your first farm to manage crops and agricultural operations.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowAddFarmDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Farm
                    </Button>
                    <Button variant="outline" onClick={createDemoData}>
                      <Activity className="h-4 w-4 mr-2" />
                      Create Demo Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <Card key={farm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      {getStatusBadge(farm.status)}
                    </div>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {farm.location_address || 'No address set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {farm.size_hectares && (
                      <div className="text-sm">
                        <strong>Size:</strong> {farm.size_hectares} hectares
                      </div>
                    )}
                    {farm.certifications && farm.certifications.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Certifications:</div>
                        <div className="flex flex-wrap gap-1">
                          {farm.certifications.map((cert: string) => (
                            <Badge key={cert} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteFarm(farm.id, farm.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          {crops.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Crop Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Track crop growth, varieties, and harvest schedules
                  </p>
                  <Button onClick={() => setShowAddCropDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Crop
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Active Crops ({crops.length})</h3>
                <Button onClick={() => setShowAddCropDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map((crop) => (
                  <Card key={crop.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {crop.name}
                          {crop.variety && <span className="text-sm text-muted-foreground ml-2">({crop.variety})</span>}
                        </CardTitle>
                        {getCropStatusBadge(crop.status)}
                      </div>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {(crop as any).farms?.name || 'Unknown Farm'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {crop.area_hectares && (
                        <div className="text-sm">
                          <strong>Area:</strong> {crop.area_hectares} hectares
                        </div>
                      )}
                      
                      {crop.planting_date && (
                        <div className="text-sm">
                          <strong>Planted:</strong> {new Date(crop.planting_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {crop.expected_harvest_date && (
                        <div className="text-sm">
                          <strong>Expected Harvest:</strong> {new Date(crop.expected_harvest_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Status:</div>
                        <Select 
                          value={crop.status} 
                          onValueChange={(value) => updateCropStatus(crop.id, value as any)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planted">Planted</SelectItem>
                            <SelectItem value="growing">Growing</SelectItem>
                            <SelectItem value="harvesting">Harvesting</SelectItem>
                            <SelectItem value="harvested">Harvested</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Field Mapping</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive field mapping and management
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddFarmDialog
        open={showAddFarmDialog}
        onOpenChange={setShowAddFarmDialog}
        onSuccess={refetch}
      />

      <AddCropDialog
        open={showAddCropDialog}
        onOpenChange={setShowAddCropDialog}
        onSuccess={refetch}
      />
    </div>
  )
}