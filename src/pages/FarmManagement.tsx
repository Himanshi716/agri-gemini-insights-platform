import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MapPin, Sprout, Calendar, Settings } from "lucide-react"

const mockFarms = [
  {
    id: 'farm-001',
    name: 'Green Valley Farm',
    location: 'California, USA',
    size: '150 hectares',
    crops: ['Tomatoes', 'Lettuce', 'Peppers'],
    status: 'active',
    lastActivity: '2 hours ago'
  },
  {
    id: 'farm-002',
    name: 'Sunset Agricultural',
    location: 'Oregon, USA',
    size: '220 hectares',
    crops: ['Wheat', 'Corn', 'Soybeans'],
    status: 'active',
    lastActivity: '5 hours ago'
  }
]

export default function FarmManagement() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
      case 'maintenance':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Maintenance</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farm Management</h1>
          <p className="text-muted-foreground">Manage your farms, fields, and crop planning</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add New Farm
        </Button>
      </div>

      <Tabs defaultValue="farms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="farms">Farms</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockFarms.map((farm) => (
              <Card key={farm.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{farm.name}</CardTitle>
                    {getStatusBadge(farm.status)}
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farm.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Size:</strong> {farm.size}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Crops:</div>
                    <div className="flex flex-wrap gap-1">
                      {farm.crops.map((crop) => (
                        <Badge key={crop} variant="outline" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Crop Management</h3>
                <p className="text-muted-foreground mb-4">
                  Track crop growth, varieties, and harvest schedules
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}