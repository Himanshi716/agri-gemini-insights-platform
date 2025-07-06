import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Realistic sensor value generators
const generateSensorValue = (type: string, previousValue?: number) => {
  const now = new Date();
  const hour = now.getHours();
  
  switch (type) {
    case 'temperature':
      // Temperature varies with time of day (15-30°C)
      const baseTemp = 22 + Math.sin((hour - 6) * Math.PI / 12) * 8;
      const variation = (Math.random() - 0.5) * 2;
      return Math.max(10, Math.min(35, baseTemp + variation));
      
    case 'humidity':
      // Humidity inversely related to temperature (40-80%)
      const baseHumidity = 70 - Math.sin((hour - 6) * Math.PI / 12) * 20;
      const humidityVariation = (Math.random() - 0.5) * 10;
      return Math.max(30, Math.min(90, baseHumidity + humidityVariation));
      
    case 'soil_moisture':
      // Soil moisture decreases during day, stable at night (30-70%)
      const baseMoisture = 50 + (hour > 6 && hour < 18 ? -5 : 5);
      const moistureVariation = (Math.random() - 0.5) * 8;
      return Math.max(20, Math.min(80, baseMoisture + moistureVariation));
      
    case 'ph':
      // pH relatively stable (6.0-7.5)
      const basePh = 6.8 + (Math.random() - 0.5) * 0.6;
      return Math.max(6.0, Math.min(7.5, basePh));
      
    case 'light':
      // Light varies dramatically with time of day (0-2000 lux)
      if (hour < 6 || hour > 19) return Math.random() * 50; // Night
      const sunAngle = Math.sin((hour - 6) * Math.PI / 13);
      return sunAngle * 1800 + Math.random() * 200;
      
    case 'co2':
      // CO2 varies with plant activity (300-800 ppm)
      const baseCo2 = 450 + Math.sin((hour - 12) * Math.PI / 12) * 150;
      const co2Variation = (Math.random() - 0.5) * 100;
      return Math.max(300, Math.min(800, baseCo2 + co2Variation));
      
    default:
      return Math.random() * 100;
  }
};

const getSensorUnit = (type: string) => {
  switch (type) {
    case 'temperature': return '°C';
    case 'humidity': return '%';
    case 'soil_moisture': return '%';
    case 'ph': return '';
    case 'light': return ' lux';
    case 'co2': return ' ppm';
    default: return '';
  }
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

    // Get all active sensors
    const { data: sensors, error: sensorError } = await supabase
      .from('iot_sensors')
      .select('*')
      .eq('is_active', true);

    if (sensorError) {
      throw new Error(`Failed to fetch sensors: ${sensorError.message}`);
    }

    if (!sensors || sensors.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active sensors found',
        data: { readings_generated: 0 }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating readings for ${sensors.length} sensors`);

    const readings = [];

    for (const sensor of sensors) {
      // Generate realistic sensor readings
      const value = Number(generateSensorValue(sensor.type).toFixed(2));
      const unit = getSensorUnit(sensor.type);

      const reading = {
        sensor_id: sensor.id,
        value: value,
        unit: unit,
        timestamp: new Date().toISOString(),
        metadata: {
          device_id: sensor.device_id,
          location: sensor.location_description,
          generated: true,
          simulation_time: new Date().toISOString()
        }
      };

      // Insert the reading
      const { error: readingError } = await supabase
        .from('sensor_readings')
        .insert(reading);

      if (readingError) {
        console.error(`Error inserting reading for sensor ${sensor.id}:`, readingError);
        continue;
      }

      // Update sensor last reading timestamp
      await supabase
        .from('iot_sensors')
        .update({ last_reading_at: new Date().toISOString() })
        .eq('id', sensor.id);

      readings.push({
        sensor_name: sensor.name,
        sensor_type: sensor.type,
        value: value,
        unit: unit
      });

      console.log(`Generated reading for ${sensor.name}: ${value}${unit}`);
    }

    // Call the data ingestion function to process alerts
    try {
      const { error: ingestionError } = await supabase.functions.invoke('iot-data-ingestion', {
        body: { 
          readings: readings.map(r => ({
            sensor_id: sensors.find(s => s.name === r.sensor_name)?.id,
            value: r.value,
            unit: r.unit
          }))
        }
      });

      if (ingestionError) {
        console.warn('Alert processing failed:', ingestionError);
      }
    } catch (alertError) {
      console.warn('Could not process alerts:', alertError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${readings.length} sensor readings`,
      data: {
        readings_generated: readings.length,
        sensors_processed: sensors.length,
        timestamp: new Date().toISOString(),
        readings: readings
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in iot-simulator function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});