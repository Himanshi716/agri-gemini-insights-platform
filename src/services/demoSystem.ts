// Comprehensive Demo System for Agricultural Platform
// Generates realistic demo data for all modules

import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Farm = Database['public']['Tables']['farms']['Row']
type Sensor = Database['public']['Tables']['iot_sensors']['Row']
type SensorReading = Database['public']['Tables']['sensor_readings']['Row']

export interface DemoProgress {
  stage: string
  progress: number
  message: string
}

export class DemoSystemManager {
  private progressCallback?: (progress: DemoProgress) => void

  constructor(progressCallback?: (progress: DemoProgress) => void) {
    this.progressCallback = progressCallback
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message })
    }
  }

  async generateCompleteDemoData(): Promise<boolean> {
    try {
      this.updateProgress('init', 0, 'Initializing demo system...')
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Phase 1: Create Demo Farms
      this.updateProgress('farms', 10, 'Creating demo farms...')
      const farms = await this.createDemoFarms(user.id)

      // Phase 2: Generate IoT Infrastructure
      this.updateProgress('iot', 30, 'Setting up IoT sensors...')
      const sensors = await this.createIoTInfrastructure(farms)

      // Phase 3: Generate Historical Data
      this.updateProgress('data', 50, 'Generating sensor data...')
      await this.generateSensorData(sensors)

      // Phase 4: Create Compliance Records
      this.updateProgress('compliance', 70, 'Setting up compliance data...')
      await this.createComplianceData(farms)

      // Phase 5: Generate Export Documents
      this.updateProgress('exports', 85, 'Creating export documents...')
      await this.createExportDocuments(farms)

      // Phase 6: Analytics and Reports
      this.updateProgress('analytics', 95, 'Generating analytics data...')
      await this.createAnalyticsData(user.id)

      this.updateProgress('complete', 100, 'Demo system ready!')
      return true
    } catch (error) {
      console.error('Demo generation error:', error)
      return false
    }
  }

  private async createDemoFarms(userId: string): Promise<Farm[]> {
    const demoFarms = [
      {
        name: 'Sunrise Organic Farm',
        description: 'Premium organic vegetables and herbs for local markets',
        location_address: 'California Central Valley',
        size_hectares: 25,
        user_id: userId,
        latitude: 36.7783,
        longitude: -119.4179,
        certifications: ['organic', 'non_gmo'],
        status: 'active' as const
      },
      {
        name: 'Heritage Grain Co.',
        description: 'Traditional grain varieties for specialty markets',
        location_address: 'Iowa Farmland',
        size_hectares: 150,
        user_id: userId,
        latitude: 42.0308,
        longitude: -93.6319,
        certifications: ['sustainable', 'heritage'],
        status: 'active' as const
      },
      {
        name: 'Coastal Berry Fields',
        description: 'Premium berries for export markets',
        location_address: 'Oregon Coast',
        size_hectares: 40,
        user_id: userId,
        latitude: 44.9778,
        longitude: -123.0351,
        certifications: ['global_gap', 'organic'],
        status: 'active' as const
      }
    ]

    const { data: existingFarms } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', userId)

    // Only create new farms if none exist
    if (!existingFarms || existingFarms.length === 0) {
      const { data: createdFarms, error } = await supabase
        .from('farms')
        .insert(demoFarms)
        .select()

      if (error) throw error
      return createdFarms || []
    }

    // Return existing farms
    const { data: farms, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return farms || []
  }

  private async createIoTInfrastructure(farms: Farm[]): Promise<Sensor[]> {
    const sensorTypes = [
      { type: 'temperature' as const, locations: ['Greenhouse A', 'Field 1', 'Storage Area'] },
      { type: 'humidity' as const, locations: ['Greenhouse A', 'Greenhouse B', 'Pack House'] },
      { type: 'soil_moisture' as const, locations: ['Field 1', 'Field 2', 'Field 3'] },
      { type: 'ph' as const, locations: ['Field 1', 'Field 2', 'Irrigation Zone'] },
      { type: 'light' as const, locations: ['Greenhouse A', 'Greenhouse B'] },
      { type: 'co2' as const, locations: ['Greenhouse A', 'Storage Facility'] }
    ]

    const allSensors = []

    for (const farm of farms) {
      for (const { type, locations } of sensorTypes) {
        for (let i = 0; i < Math.min(locations.length, 2); i++) {
          const location = locations[i]
          allSensors.push({
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor ${i + 1}`,
            type,
            location_description: location,
            farm_id: farm.id,
            is_active: true,
            latitude: farm.latitude! + (Math.random() - 0.5) * 0.01,
            longitude: farm.longitude! + (Math.random() - 0.5) * 0.01,
            device_id: `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          })
        }
      }
    }

    const { data: createdSensors, error } = await supabase
      .from('iot_sensors')
      .insert(allSensors)
      .select()

    if (error) throw error
    return createdSensors || []
  }

  private async generateSensorData(sensors: Sensor[]): Promise<void> {
    const batchSize = 20
    const hoursBack = 72 // 3 days of data

    for (const sensor of sensors) {
      const readings = []
      const now = new Date()

      for (let hour = 0; hour < hoursBack; hour++) {
        // Create 4 readings per hour (every 15 minutes)
        for (let quarter = 0; quarter < 4; quarter++) {
          const timestamp = new Date(now.getTime() - (hour * 60 + quarter * 15) * 60 * 1000)
          const { value, unit } = this.generateRealisticSensorValue(sensor.type, hour, quarter)

          readings.push({
            sensor_id: sensor.id,
            value,
            unit,
            timestamp: timestamp.toISOString(),
            metadata: { 
              demo: true, 
              quality_score: 95 + Math.floor(Math.random() * 5),
              batch: Math.floor(hour / 6)
            }
          })
        }
      }

      // Insert readings in batches
      for (let i = 0; i < readings.length; i += batchSize) {
        const batch = readings.slice(i, i + batchSize)
        await supabase.from('sensor_readings').insert(batch)
      }

      // Update sensor last reading time
      await supabase
        .from('iot_sensors')
        .update({ last_reading_at: new Date().toISOString() })
        .eq('id', sensor.id)
    }
  }

  private generateRealisticSensorValue(type: string, hour: number, quarter: number): { value: number; unit: string } {
    const timeOfDay = hour % 24
    const randomVariation = (Math.random() - 0.5) * 0.2 // ±10% variation

    switch (type) {
      case 'temperature': {
        // Temperature varies by time of day
        const baseTemp = 20 + Math.sin((timeOfDay - 6) * Math.PI / 12) * 10
        return { 
          value: parseFloat((baseTemp + randomVariation * 5).toFixed(1)),
          unit: '°C'
        }
      }

      case 'humidity': {
        // Humidity inversely related to temperature
        const baseHumidity = 70 - Math.sin((timeOfDay - 6) * Math.PI / 12) * 15
        return { 
          value: parseFloat((Math.max(30, Math.min(90, baseHumidity + randomVariation * 10))).toFixed(1)),
          unit: '%'
        }
      }

      case 'soil_moisture': {
        // Gradual decrease with some irrigation cycles
        const irrigationCycle = hour % 48 < 24 ? 5 : -2 // Every 2 days
        const baseMoisture = 60 + irrigationCycle + randomVariation * 5
        return { 
          value: parseFloat((Math.max(20, Math.min(80, baseMoisture))).toFixed(1)),
          unit: '%'
        }
      }

      case 'ph': {
        // Stable pH with small variations
        const basePh = 6.8 + randomVariation * 0.5
        return { 
          value: parseFloat((Math.max(6.0, Math.min(8.0, basePh))).toFixed(2)),
          unit: 'pH'
        }
      }

      case 'light': {
        // Light follows sun pattern
        const sunIntensity = Math.max(0, Math.sin((timeOfDay - 6) * Math.PI / 12)) * 100000
        return { 
          value: parseFloat((sunIntensity + randomVariation * 5000).toFixed(0)),
          unit: 'lux'
        }
      }

      case 'co2': {
        // CO2 varies with photosynthesis cycle
        const baseCo2 = 400 + (timeOfDay > 6 && timeOfDay < 18 ? -50 : 100)
        return { 
          value: parseFloat((baseCo2 + randomVariation * 50).toFixed(0)),
          unit: 'ppm'
        }
      }

      default:
        return { value: 0, unit: '' }
    }
  }

  private async createComplianceData(farms: Farm[]): Promise<void> {
    const standards = ['organic', 'global_gap', 'iso22000', 'haccp']
    const complianceRecords = []

    for (const farm of farms) {
      for (const standard of standards.slice(0, 2)) {
        complianceRecords.push({
          farm_id: farm.id,
          standard_name: standard.toUpperCase(),
          certificate_number: `CERT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: Math.random() > 0.3 ? 'active' as const : 'pending' as const,
          issued_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          audit_notes: `Comprehensive audit completed for ${standard} compliance. All requirements met.`
        })
      }
    }

    await supabase.from('compliance_records').insert(complianceRecords)
  }

  private async createExportDocuments(farms: Farm[]): Promise<void> {
    const documentTypes = ['phytosanitary', 'certificate_of_origin', 'quality_certificate']
    const exportDocs = []

    for (const farm of farms) {
      for (const docType of documentTypes) {
        exportDocs.push({
          farm_id: farm.id,
          document_type: docType,
          title: `${docType.replace('_', ' ').toUpperCase()} - ${farm.name}`,
          status: Math.random() > 0.5 ? 'completed' as const : 'draft' as const,
          content: {
            farm_name: farm.name,
            location: farm.location_address,
            document_type: docType,
            generated_date: new Date().toISOString(),
            validity: '12 months'
          },
          blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          qr_code_url: `https://verify.example.com/${Math.random().toString(36).substr(2, 12)}`
        })
      }
    }

    await supabase.from('export_documents').insert(exportDocs)
  }

  private async createAnalyticsData(userId: string): Promise<void> {
    const reportTypes = ['weekly_summary', 'monthly_analysis', 'compliance_report']
    const reports = []

    for (const reportType of reportTypes) {
      reports.push({
        user_id: userId,
        title: `${reportType.replace('_', ' ').toUpperCase()} Report`,
        description: `Automated ${reportType.replace('_', ' ')} generated by Proprietary AI`,
        report_type: reportType,
        status: 'completed',
        content: {
          report_type: reportType,
          generated_by: 'Proprietary AI System',
          metrics: {
            sensors_monitored: Math.floor(Math.random() * 20 + 10),
            data_points: Math.floor(Math.random() * 10000 + 5000),
            alerts_generated: Math.floor(Math.random() * 5),
            compliance_score: Math.floor(Math.random() * 20 + 80)
          }
        },
        generated_at: new Date().toISOString(),
        scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    await supabase.from('analytics_reports').insert(reports)
  }

  async cleanupDemoData(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Get farm IDs first
      const { data: farms } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)

      if (!farms) return true

      const farmIds = farms.map(f => f.id)

      // Clean up in reverse order of dependencies
      await supabase.from('analytics_reports').delete().eq('user_id', user.id)
      
      if (farmIds.length > 0) {
        // Get sensor IDs
        const { data: sensors } = await supabase
          .from('iot_sensors')
          .select('id')
          .in('farm_id', farmIds)

        if (sensors) {
          const sensorIds = sensors.map(s => s.id)
          if (sensorIds.length > 0) {
            await supabase.from('sensor_readings').delete().in('sensor_id', sensorIds)
          }
        }

        await supabase.from('export_documents').delete().in('farm_id', farmIds)
        await supabase.from('compliance_records').delete().in('farm_id', farmIds)
        await supabase.from('iot_sensors').delete().in('farm_id', farmIds)
        await supabase.from('farms').delete().in('id', farmIds)
      }

      return true
    } catch (error) {
      console.error('Cleanup error:', error)
      return false
    }
  }
}

export const demoSystem = new DemoSystemManager()