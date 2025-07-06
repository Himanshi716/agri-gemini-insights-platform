import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorReading {
  sensor_id: string;
  value: number;
  unit: string;
  metadata?: any;
  device_id?: string;
}

interface AlertThreshold {
  min?: number;
  max?: number;
  critical_min?: number;
  critical_max?: number;
}

const SENSOR_THRESHOLDS: Record<string, AlertThreshold> = {
  temperature: { min: 10, max: 35, critical_min: 5, critical_max: 40 },
  humidity: { min: 30, max: 80, critical_min: 20, critical_max: 90 },
  soil_moisture: { min: 20, max: 80, critical_min: 10, critical_max: 90 },
  ph: { min: 6.0, max: 7.5, critical_min: 5.0, critical_max: 8.5 },
  light: { min: 200, max: 2000, critical_min: 100, critical_max: 3000 },
  co2: { min: 300, max: 1000, critical_min: 200, critical_max: 1500 }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { readings } = await req.json() as { readings: SensorReading[] };

    if (!readings || !Array.isArray(readings)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid data format. Expected array of readings.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${readings.length} sensor readings`);

    const processedReadings = [];
    const alerts = [];

    for (const reading of readings) {
      // Validate sensor exists
      const { data: sensor, error: sensorError } = await supabase
        .from('iot_sensors')
        .select('id, name, type, farm_id')
        .eq('id', reading.sensor_id)
        .single();

      if (sensorError || !sensor) {
        console.warn(`Sensor not found: ${reading.sensor_id}`);
        continue;
      }

      // Insert sensor reading
      const { data: insertedReading, error: readingError } = await supabase
        .from('sensor_readings')
        .insert({
          sensor_id: reading.sensor_id,
          value: reading.value,
          unit: reading.unit,
          metadata: reading.metadata || {}
        })
        .select()
        .single();

      if (readingError) {
        console.error('Error inserting reading:', readingError);
        continue;
      }

      processedReadings.push(insertedReading);

      // Update sensor last reading timestamp
      await supabase
        .from('iot_sensors')
        .update({ last_reading_at: new Date().toISOString() })
        .eq('id', reading.sensor_id);

      // Check for alerts
      const threshold = SENSOR_THRESHOLDS[sensor.type];
      if (threshold) {
        let alertLevel = null;
        let alertMessage = '';

        if (reading.value <= (threshold.critical_min || -Infinity) || 
            reading.value >= (threshold.critical_max || Infinity)) {
          alertLevel = 'critical';
          alertMessage = `Critical ${sensor.type} level: ${reading.value}${reading.unit}`;
        } else if (reading.value <= (threshold.min || -Infinity) || 
                   reading.value >= (threshold.max || Infinity)) {
          alertLevel = 'warning';
          alertMessage = `${sensor.type} outside normal range: ${reading.value}${reading.unit}`;
        }

        if (alertLevel) {
          // Create alert document
          const { error: alertError } = await supabase
            .from('export_documents')
            .insert({
              farm_id: sensor.farm_id,
              document_type: 'sensor_alert',
              title: `${sensor.name} Alert`,
              content: {
                sensor_id: sensor.id,
                sensor_name: sensor.name,
                sensor_type: sensor.type,
                alert_level: alertLevel,
                message: alertMessage,
                reading_value: reading.value,
                reading_unit: reading.unit,
                threshold: threshold,
                timestamp: new Date().toISOString()
              },
              status: 'pending'
            });

          if (!alertError) {
            alerts.push({
              sensor: sensor.name,
              level: alertLevel,
              message: alertMessage
            });
          }
        }
      }
    }

    console.log(`Successfully processed ${processedReadings.length} readings, generated ${alerts.length} alerts`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        processed_readings: processedReadings.length,
        total_readings: readings.length,
        alerts_generated: alerts.length,
        alerts: alerts
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in iot-data-ingestion function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});