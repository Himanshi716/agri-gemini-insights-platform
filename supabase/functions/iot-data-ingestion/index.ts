import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sensorData, deviceId, batchData } = await req.json()

    console.log('Processing IoT data for device:', deviceId)

    // Handle single sensor reading
    if (sensorData && deviceId) {
      const { data: sensor } = await supabase
        .from('iot_sensors')
        .select('id, type, farm_id')
        .eq('device_id', deviceId)
        .single()

      if (!sensor) {
        throw new Error(`Sensor not found for device: ${deviceId}`)
      }

      // Insert sensor reading
      const { error: insertError } = await supabase
        .from('sensor_readings')
        .insert({
          sensor_id: sensor.id,
          value: sensorData.value,
          unit: sensorData.unit,
          timestamp: sensorData.timestamp || new Date().toISOString(),
          metadata: sensorData.metadata || {}
        })

      if (insertError) {
        throw insertError
      }

      // Update sensor last reading time
      const { error: updateError } = await supabase
        .from('iot_sensors')
        .update({ last_reading_at: new Date().toISOString() })
        .eq('id', sensor.id)

      if (updateError) {
        console.error('Failed to update sensor timestamp:', updateError)
      }

      // Check for alert conditions
      await checkAlertConditions(sensor, sensorData)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sensor data recorded successfully',
          sensorId: sensor.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle batch data insertion
    if (batchData && Array.isArray(batchData)) {
      const readings = []
      const sensorUpdates = new Map()

      for (const data of batchData) {
        const { data: sensor } = await supabase
          .from('iot_sensors')
          .select('id, type, farm_id')
          .eq('device_id', data.deviceId)
          .single()

        if (sensor) {
          readings.push({
            sensor_id: sensor.id,
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp || new Date().toISOString(),
            metadata: data.metadata || {}
          })

          sensorUpdates.set(sensor.id, new Date().toISOString())

          // Check alerts for each reading
          await checkAlertConditions(sensor, data)
        }
      }

      // Batch insert readings
      if (readings.length > 0) {
        const { error: batchError } = await supabase
          .from('sensor_readings')
          .insert(readings)

        if (batchError) {
          throw batchError
        }

        // Update sensor timestamps
        for (const [sensorId, timestamp] of sensorUpdates) {
          await supabase
            .from('iot_sensors')
            .update({ last_reading_at: timestamp })
            .eq('id', sensorId)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Processed ${readings.length} sensor readings`,
          recordsProcessed: readings.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid request: missing sensorData or batchData')

  } catch (error) {
    console.error('IoT data ingestion error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Check for alert conditions based on sensor type and value
async function checkAlertConditions(sensor: any, sensorData: any) {
  const alertThresholds = {
    temperature: { min: 10, max: 35 },
    humidity: { min: 30, max: 80 },
    soil_moisture: { min: 20, max: 80 },
    ph: { min: 6.0, max: 8.0 },
    light: { min: 200, max: 2000 },
    co2: { min: 300, max: 1500 }
  }

  const thresholds = alertThresholds[sensor.type as keyof typeof alertThresholds]
  if (!thresholds) return

  const value = parseFloat(sensorData.value)
  let alertMessage = null

  if (value < thresholds.min) {
    alertMessage = `${sensor.type} level too low: ${value}${sensorData.unit} (min: ${thresholds.min}${sensorData.unit})`
  } else if (value > thresholds.max) {
    alertMessage = `${sensor.type} level too high: ${value}${sensorData.unit} (max: ${thresholds.max}${sensorData.unit})`
  }

  if (alertMessage) {
    // Create alert document
    await supabase
      .from('export_documents')
      .insert({
        farm_id: sensor.farm_id,
        document_type: 'sensor_alert',
        title: `Sensor Alert - ${sensor.type} - ${new Date().toLocaleDateString()}`,
        content: {
          alert_message: alertMessage,
          sensor_id: sensor.id,
          sensor_type: sensor.type,
          current_value: value,
          unit: sensorData.unit,
          thresholds,
          timestamp: new Date().toISOString()
        },
        status: 'pending'
      })

    console.log('Alert generated:', alertMessage)
  }
}