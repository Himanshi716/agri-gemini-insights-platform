import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IoTDataPacket {
  sensor_id: string;
  device_id?: string;
  readings: Array<{
    data_type: string;
    value: number;
    unit: string;
    timestamp?: string;
    quality_score?: number;
    metadata?: any;
  }>;
  batch_id?: string;
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400, headers: corsHeaders });
  }

  console.log("WebSocket upgrade request received");

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let isConnected = false;
    let sensorSubscriptions = new Map<string, boolean>();

    socket.onopen = () => {
      console.log("WebSocket connection opened");
      isConnected = true;
      
      // Send connection confirmation
      socket.send(JSON.stringify({
        type: 'connection_established',
        timestamp: new Date().toISOString(),
        message: 'IoT WebSocket stream ready'
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data.type);

        switch (data.type) {
          case 'subscribe_sensor':
            await handleSensorSubscription(data.sensor_id, supabase, socket);
            break;

          case 'unsubscribe_sensor':
            handleSensorUnsubscription(data.sensor_id);
            break;

          case 'iot_data_batch':
            await handleIoTDataBatch(data.packet as IoTDataPacket, supabase, socket);
            break;

          case 'ping':
            socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;

          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          error: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      isConnected = false;
      sensorSubscriptions.clear();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      isConnected = false;
    };

    // Handle sensor subscription
    async function handleSensorSubscription(sensorId: string, supabase: any, socket: WebSocket) {
      try {
        // Verify sensor exists and user has access
        const { data: sensor, error } = await supabase
          .from('iot_sensors')
          .select('id, name, type, farm_id')
          .eq('id', sensorId)
          .single();

        if (error || !sensor) {
          socket.send(JSON.stringify({
            type: 'subscription_error',
            sensor_id: sensorId,
            message: 'Sensor not found or access denied'
          }));
          return;
        }

        sensorSubscriptions.set(sensorId, true);
        
        socket.send(JSON.stringify({
          type: 'subscription_confirmed',
          sensor_id: sensorId,
          sensor_name: sensor.name,
          sensor_type: sensor.type
        }));

        console.log(`Subscribed to sensor: ${sensorId}`);
      } catch (error) {
        console.error("Error handling sensor subscription:", error);
        socket.send(JSON.stringify({
          type: 'subscription_error',
          sensor_id: sensorId,
          message: error.message
        }));
      }
    }

    function handleSensorUnsubscription(sensorId: string) {
      sensorSubscriptions.delete(sensorId);
      socket.send(JSON.stringify({
        type: 'unsubscription_confirmed',
        sensor_id: sensorId
      }));
      console.log(`Unsubscribed from sensor: ${sensorId}`);
    }

    // Handle IoT data batch processing
    async function handleIoTDataBatch(packet: IoTDataPacket, supabase: any, socket: WebSocket) {
      try {
        const { sensor_id, device_id, readings, batch_id } = packet;
        
        // Verify sensor exists
        const { data: sensor, error: sensorError } = await supabase
          .from('iot_sensors')
          .select('id, name, type, farm_id')
          .eq('id', sensor_id)
          .single();

        if (sensorError || !sensor) {
          socket.send(JSON.stringify({
            type: 'batch_error',
            sensor_id: sensor_id,
            batch_id: batch_id,
            message: 'Sensor not found'
          }));
          return;
        }

        const processedReadings = [];
        const streamEntries = [];

        // Process each reading in the batch
        for (const reading of readings) {
          const timestamp = reading.timestamp || new Date().toISOString();
          
          // Insert into high-frequency stream table
          const streamEntry = {
            sensor_id: sensor_id,
            device_id: device_id,
            data_type: reading.data_type,
            value: reading.value,
            unit: reading.unit,
            quality_score: reading.quality_score || 100,
            timestamp: timestamp,
            metadata: reading.metadata || {},
            batch_id: batch_id
          };

          streamEntries.push(streamEntry);

          // Also insert into legacy sensor_readings for compatibility
          const { data: insertedReading, error: readingError } = await supabase
            .from('sensor_readings')
            .insert({
              sensor_id: sensor_id,
              value: reading.value,
              unit: reading.unit,
              timestamp: timestamp,
              metadata: reading.metadata || {}
            })
            .select()
            .single();

          if (!readingError && insertedReading) {
            processedReadings.push(insertedReading);
          }
        }

        // Bulk insert into stream table
        if (streamEntries.length > 0) {
          const { error: streamError } = await supabase
            .from('iot_data_stream')
            .insert(streamEntries);

          if (streamError) {
            console.error("Error inserting stream data:", streamError);
          }
        }

        // Update sensor last reading timestamp
        await supabase
          .from('iot_sensors')
          .update({ last_reading_at: new Date().toISOString() })
          .eq('id', sensor_id);

        // Send confirmation
        socket.send(JSON.stringify({
          type: 'batch_processed',
          sensor_id: sensor_id,
          batch_id: batch_id,
          processed_count: processedReadings.length,
          stream_entries: streamEntries.length,
          timestamp: new Date().toISOString()
        }));

        // Broadcast to subscribed clients
        if (sensorSubscriptions.has(sensor_id)) {
          for (const reading of processedReadings) {
            socket.send(JSON.stringify({
              type: 'realtime_reading',
              sensor_id: sensor_id,
              sensor_name: sensor.name,
              sensor_type: sensor.type,
              reading: reading,
              timestamp: reading.timestamp
            }));
          }
        }

        console.log(`Processed batch for sensor ${sensor_id}: ${processedReadings.length} readings`);
      } catch (error) {
        console.error("Error processing IoT data batch:", error);
        socket.send(JSON.stringify({
          type: 'batch_error',
          sensor_id: packet.sensor_id,
          batch_id: packet.batch_id,
          message: error.message
        }));
      }
    }

    return response;
  } catch (error) {
    console.error("Error setting up WebSocket:", error);
    return new Response(JSON.stringify({
      error: "Failed to establish WebSocket connection",
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});