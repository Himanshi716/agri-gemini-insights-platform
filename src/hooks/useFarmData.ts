import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type Farm = Database['public']['Tables']['farms']['Row']
type Crop = Database['public']['Tables']['crops']['Row']

export function useFarmData() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch user's farms
  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFarms(data || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
      toast({
        title: "Error",
        description: "Failed to fetch farms",
        variant: "destructive"
      })
    }
  }

  // Fetch crops for user's farms
  const fetchCrops = async () => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select(`
          *,
          farms(name, location_address)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCrops(data || [])
    } catch (error) {
      console.error('Error fetching crops:', error)
      toast({
        title: "Error",
        description: "Failed to fetch crops",
        variant: "destructive"
      })
    }
  }

  // Delete farm
  const deleteFarm = async (farmId: string) => {
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId)

      if (error) throw error

      toast({
        title: "Farm Deleted",
        description: "Farm and all associated data have been removed",
      })

      await fetchFarms()
      await fetchCrops()
    } catch (error) {
      console.error('Error deleting farm:', error)
      toast({
        title: "Error",
        description: "Failed to delete farm",
        variant: "destructive"
      })
    }
  }

  // Update crop status
  const updateCropStatus = async (cropId: string, status: Database['public']['Enums']['crop_status']) => {
    try {
      const { error } = await supabase
        .from('crops')
        .update({ status })
        .eq('id', cropId)

      if (error) throw error

      toast({
        title: "Crop Updated",
        description: `Crop status changed to ${status}`,
      })

      await fetchCrops()
    } catch (error) {
      console.error('Error updating crop:', error)
      toast({
        title: "Error",
        description: "Failed to update crop status",
        variant: "destructive"
      })
    }
  }

  // Create demo farm data
  const createDemoData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create demo farms
      const demoFarms = [
        {
          name: 'Green Valley Farm',
          description: 'Organic vegetable production with sustainable farming practices',
          location_address: '123 Farm Road, Green Valley, CA 95945',
          size_hectares: 25.5,
          latitude: 39.2904,
          longitude: -121.0611,
          certifications: ['Organic', 'Sustainable'],
          user_id: user.id,
          status: 'active' as const
        },
        {
          name: 'Sunset Agricultural',
          description: 'Mixed crop farming specializing in grains and legumes',
          location_address: '456 Country Lane, Sunset Valley, OR 97123',
          size_hectares: 45.2,
          latitude: 45.5152,
          longitude: -122.6784,
          certifications: ['GAP', 'Fair Trade'],
          user_id: user.id,
          status: 'active' as const
        }
      ]

      const { data: createdFarms, error: farmError } = await supabase
        .from('farms')
        .insert(demoFarms)
        .select()

      if (farmError) throw farmError

      // Create demo crops
      if (createdFarms && createdFarms.length > 0) {
        const demoCrops = [
          {
            name: 'Tomatoes',
            variety: 'Cherry',
            farm_id: createdFarms[0].id,
            area_hectares: 2.5,
            planting_date: '2024-03-15',
            expected_harvest_date: '2024-07-15',
            status: 'growing' as const,
            notes: 'High-yield cherry tomato variety, excellent for market sales'
          },
          {
            name: 'Lettuce',
            variety: 'Romaine',
            farm_id: createdFarms[0].id,
            area_hectares: 1.2,
            planting_date: '2024-04-01',
            expected_harvest_date: '2024-06-01',
            status: 'planted' as const,
            notes: 'Cool season crop, succession planting planned'
          },
          {
            name: 'Wheat',
            variety: 'Hard Red Winter',
            farm_id: createdFarms[1].id,
            area_hectares: 15.0,
            planting_date: '2023-10-15',
            expected_harvest_date: '2024-08-01',
            status: 'growing' as const,
            notes: 'Winter wheat variety, excellent for bread production'
          },
          {
            name: 'Soybeans',
            variety: 'Non-GMO',
            farm_id: createdFarms[1].id,
            area_hectares: 12.5,
            planting_date: '2024-05-01',
            expected_harvest_date: '2024-10-15',
            status: 'planted' as const,
            notes: 'Premium non-GMO variety for organic market'
          }
        ]

        const { error: cropError } = await supabase
          .from('crops')
          .insert(demoCrops)

        if (cropError) throw cropError
      }

      toast({
        title: "Demo Data Created",
        description: "Sample farms and crops have been added to your account",
      })

      await fetchFarms()
      await fetchCrops()
    } catch (error) {
      console.error('Error creating demo data:', error)
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive"
      })
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchFarms(), fetchCrops()])
      setLoading(false)
    }

    fetchData()

    // Subscribe to farm changes
    const farmsChannel = supabase
      .channel('farms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farms'
        },
        () => {
          fetchFarms()
        }
      )
      .subscribe()

    // Subscribe to crop changes
    const cropsChannel = supabase
      .channel('crops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crops'
        },
        () => {
          fetchCrops()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(farmsChannel)
      supabase.removeChannel(cropsChannel)
    }
  }, [toast])

  return {
    farms,
    crops,
    loading,
    refetch: () => {
      fetchFarms()
      fetchCrops()
    },
    deleteFarm,
    updateCropStatus,
    createDemoData
  }
}