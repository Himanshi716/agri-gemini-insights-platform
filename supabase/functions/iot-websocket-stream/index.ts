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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log("Non-WebSocket request received, expected WebSocket");
    return new Response(JSON.stringify({
      error: "WebSocket Required", 
      message: "This endpoint only accepts WebSocket connections",
      endpoint: "/iot-websocket-stream"
    }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log("WebSocket upgrade request received at:", new Date().toISOString());

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      socket.close(1011, "Server configuration error");
      return response;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let isConnected = false;
    let sensorSubscriptions = new Map<string, boolean>();
    let heartbeatInterval: number | null = null;

    socket.onopen = () => {
      console.log("WebSocket connection opened successfully");
      isConnected = true;
      
      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          }));
        }
      }, 30000);
      
      // Send connection confirmation
      try {
        socket.send(JSON.stringify({
          type: 'connection_established',
          timestamp: new Date().toISOString(),
          message: 'IoT WebSocket stream ready',
          server_status: 'healthy'
        }));
      } catch (error) {
        console.error("Error sending connection confirmation:", error);
      }
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data.type, "at", new Date().toISOString());

        switch (data.type) {
          case 'subscribe_sensor':
            if (data.sensor_id) {
              await handleSensorSubscription(data.sensor_id, supabase, socket);
            } else {
              sendError(socket, 'Missing sensor_id for subscription');
            }
            break;

          case 'unsubscribe_sensor':
            if (data.sensor_id) {
              handleSensorUnsubscription(data.sensor_id, socket);
            } else {
              sendError(socket, 'Missing sensor_id for unsubscription');
            }
            break;

          case 'iot_data_batch':
            if (data.packet) {
              await handleIoTDataBatch(data.packet as IoTDataPacket, supabase, socket);
            } else {
              sendError(socket, 'Missing packet data for batch processing');
            }
            break;

          case 'ping':
            try {
              socket.send(JSON.stringify({ 
                type: 'pong', 
                timestamp: new Date().toISOString(),
                connection_status: 'healthy'
              }));
            } catch (error) {
              console.error("Error sending pong:", error);
            }
            break;

          default:
            console.warn("Unknown message type received:", data.type);
            sendError(socket, `Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        sendError(socket, 'Failed to process message', error.message);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      isConnected = false;
      sensorSubscriptions.clear();
      
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error occurred:", error);
      isConnected = false;
    };

    // Utility function to send errors safely
    function sendError(socket: WebSocket, message: string, details?: string) {
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: message,
            details: details,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error("Error sending error message:", error);
      }
    }

    // Handle sensor subscription
    async function handleSensorSubscription(sensorId: string, supabase: any, socket: WebSocket) {
      try {
        console.log(`Processing subscription request for sensor: ${sensorId}`);
        
        // Verify sensor exists and user has access
        const { data: sensor, error } = await supabase
          .from('iot_sensors')
          .select('id, name, type, farm_id')
          .eq('id', sensorId)
          .single();

        if (error) {
          console.error("Database error checking sensor:", error);
          socket.send(JSON.stringify({
            type: 'subscription_error',
            sensor_id: sensorId,
            message: 'Database error checking sensor access',
            error: error.message
          }));
          return;
        }

        if (!sensor) {
          console.log(`Sensor not found: ${sensorId}`);
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
          sensor_type: sensor.type,
          timestamp: new Date().toISOString()
        }));

        console.log(`Successfully subscribed to sensor: ${sensorId} (${sensor.name})`);
      } catch (error) {
        console.error("Error handling sensor subscription:", error);
        socket.send(JSON.stringify({
          type: 'subscription_error',
          sensor_id: sensorId,
          message: 'Internal server error during subscription',
          error: error.message
        }));
      }
    }

    function handleSensorUnsubscription(sensorId: string, socket: WebSocket) {
      try {
        sensorSubscriptions.delete(sensorId);
        socket.send(JSON.stringify({
          type: 'unsubscription_confirmed',
          sensor_id: sensorId,
          timestamp: new Date().toISOString()
        }));
        console.log(`Successfully unsubscribed from sensor: ${sensorId}`);
      } catch (error) {
        console.error("Error handling unsubscription:", error);
        sendError(socket, 'Error processing unsubscription', error.message);
      }
    }

    // Handle IoT data batch processing
    async function handleIoTDataBatch(packet: IoTDataPacket, supabase: any, socket: WebSocket) {
      try {
        const { sensor_id, device_id, readings, batch_id } = packet;
        console.log(`Processing data batch for sensor ${sensor_id}: ${readings.length} readings`);
        
        // Verify sensor exists
        const { data: sensor, error: sensorError } = await supabase
          .from('iot_sensors')
          .select('id, name, type, farm_id')
          .eq('id', sensor_id)
          .single();

        if (sensorError) {
          console.error("Database error checking sensor for batch:", sensorError);
          socket.send(JSON.stringify({
            type: 'batch_error',
            sensor_id: sensor_id,
            batch_id: batch_id,
            message: 'Database error verifying sensor',
            error: sensorError.message
          }));
          return;
        }

        if (!sensor) {
          console.log(`Sensor not found for batch: ${sensor_id}`);
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
          try {
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
            } else if (readingError) {
              console.error("Error inserting sensor reading:", readingError);
            }
          } catch (readingInsertError) {
            console.error("Exception inserting sensor reading:", readingInsertError);
          }
        }

        // Bulk insert into stream table
        if (streamEntries.length > 0) {
          const { error: streamError } = await supabase
            .from('iot_data_stream')
            .insert(streamEntries);

          if (streamError) {
            console.error("Error inserting stream data:", streamError);
          } else {
            console.log(`Successfully inserted ${streamEntries.length} stream entries`);
          }
        }

        // Update sensor last reading timestamp
        try {
          await supabase
            .from('iot_sensors')
            .update({ last_reading_at: new Date().toISOString() })
            .eq('id', sensor_id);
        } catch (updateError) {
          console.error("Error updating sensor timestamp:", updateError);
        }

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
            try {
              socket.send(JSON.stringify({
                type: 'realtime_reading',
                sensor_id: sensor_id,
                sensor_name: sensor.name,
                sensor_type: sensor.type,
                reading: reading,
                timestamp: reading.timestamp
              }));
            } catch (broadcastError) {
              console.error("Error broadcasting reading:", broadcastError);
            }
          }
        }

        console.log(`Successfully processed batch for sensor ${sensor_id}: ${processedReadings.length} readings, ${streamEntries.length} stream entries`);
      } catch (error) {
        console.error("Error processing IoT data batch:", error);
        socket.send(JSON.stringify({
          type: 'batch_error',
          sensor_id: packet.sensor_id,
          batch_id: packet.batch_id,
          message: 'Internal server error processing batch',
          error: error.message
        }));
      }
    }

    return response;
  } catch (error) {
    console.error("Error setting up WebSocket:", error);
    return new Response(JSON.stringify({
      error: "Failed to establish WebSocket connection",
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});