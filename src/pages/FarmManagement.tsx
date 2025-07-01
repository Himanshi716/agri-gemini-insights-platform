import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Calendar, Leaf } from "lucide-react"

export default function FarmManagement() {
  const farms = [
    {
      id: 1,
      name: "Green Valley Farm",
      location: "California, USA",
      size: "150 hectares",
      crops: ["Tomatoes", "Lettuce", "Carrots"],
      status: "Active",
      lastUpdated: "2 days ago"
    },
    {
      id: 2,
      name: "Sunny Acres",
      location: "Florida, USA", 
      size: "200 hectares",
      crops: ["Oranges", "Avocados"],
      status: "Active",
      lastUpdated: "1 day ago"
    },
    {
      id: 3,
      name: "Organic Fields",
      location: "Oregon, USA",
      size: "75 hectares", 
      crops: ["Blueberries", "Strawberries"],
      status: "Maintenance",
      lastUpdated: "5 days ago"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farm Management</h1>
          <p className="text-muted-foreground">Manage your farms and crop operations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Farm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{farm.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {farm.location}
                  </CardDescription>
                </div>
                <Badge variant={farm.status === "Active" ? "default" : "secondary"}>
                  {farm.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Leaf className="h-4 w-4 mr-2" />
                <span>{farm.size}</span>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Crops:</p>
                <div className="flex flex-wrap gap-1">
                  {farm.crops.map((crop) => (
                    <Badge key={crop} variant="outline" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {farm.lastUpdated}
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}