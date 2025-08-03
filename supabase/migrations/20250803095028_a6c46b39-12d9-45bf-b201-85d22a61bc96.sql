-- Enable real-time for IoT tables
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER TABLE public.real_time_data REPLICA IDENTITY FULL;
ALTER TABLE public.iot_sensors REPLICA IDENTITY FULL;

-- Create a more efficient real-time data stream table
CREATE TABLE public.iot_data_stream (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL,
  device_id UUID REFERENCES public.iot_devices(id),
  data_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  quality_score INTEGER DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  batch_id UUID, -- For bulk processing
  stream_sequence BIGSERIAL -- For ordering within streams
);

-- Create indexes for performance
CREATE INDEX idx_iot_data_stream_sensor_time ON public.iot_data_stream(sensor_id, timestamp DESC);
CREATE INDEX idx_iot_data_stream_device_time ON public.iot_data_stream(device_id, timestamp DESC);
CREATE INDEX idx_iot_data_stream_type_time ON public.iot_data_stream(data_type, timestamp DESC);
CREATE INDEX idx_iot_data_stream_batch ON public.iot_data_stream(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_iot_data_stream_sequence ON public.iot_data_stream(stream_sequence);

-- Enable RLS
ALTER TABLE public.iot_data_stream ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view data from their sensors" 
ON public.iot_data_stream 
FOR SELECT 
USING (
  sensor_id IN (
    SELECT s.id 
    FROM iot_sensors s 
    JOIN farms f ON s.farm_id = f.id 
    WHERE f.user_id = auth.uid()
  )
);

CREATE POLICY "Service can insert data stream" 
ON public.iot_data_stream 
FOR INSERT 
WITH CHECK (true);

-- Create data aggregation table for analytics
CREATE TABLE public.iot_data_aggregates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL,
  data_type TEXT NOT NULL,
  aggregation_type TEXT NOT NULL, -- 'hourly', 'daily', 'weekly'
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  count_readings INTEGER NOT NULL DEFAULT 0,
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,
  sum_value NUMERIC,
  first_reading TIMESTAMP WITH TIME ZONE,
  last_reading TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sensor_id, data_type, aggregation_type, time_bucket)
);

-- Create indexes for aggregates
CREATE INDEX idx_iot_aggregates_sensor_type_bucket ON public.iot_data_aggregates(sensor_id, data_type, time_bucket DESC);
CREATE INDEX idx_iot_aggregates_type_bucket ON public.iot_data_aggregates(aggregation_type, time_bucket DESC);

-- Enable RLS for aggregates
ALTER TABLE public.iot_data_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view aggregates from their sensors" 
ON public.iot_data_aggregates 
FOR SELECT 
USING (
  sensor_id IN (
    SELECT s.id 
    FROM iot_sensors s 
    JOIN farms f ON s.farm_id = f.id 
    WHERE f.user_id = auth.uid()
  )
);

-- Function to aggregate data
CREATE OR REPLACE FUNCTION public.aggregate_iot_data(
  aggregation_period TEXT DEFAULT 'hourly'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  interval_str TEXT;
  time_format TEXT;
  processed_count INTEGER := 0;
BEGIN
  -- Set interval and format based on aggregation period
  CASE aggregation_period
    WHEN 'hourly' THEN
      interval_str := '1 hour';
      time_format := 'YYYY-MM-DD HH24:00:00';
    WHEN 'daily' THEN
      interval_str := '1 day';
      time_format := 'YYYY-MM-DD 00:00:00';
    WHEN 'weekly' THEN
      interval_str := '7 days';
      time_format := 'IYYY-IW Monday';
    ELSE
      RAISE EXCEPTION 'Invalid aggregation period. Use hourly, daily, or weekly.';
  END CASE;

  -- Aggregate data from iot_data_stream
  INSERT INTO iot_data_aggregates (
    sensor_id,
    data_type,
    aggregation_type,
    time_bucket,
    count_readings,
    min_value,
    max_value,
    avg_value,
    sum_value,
    first_reading,
    last_reading
  )
  SELECT 
    sensor_id,
    data_type,
    aggregation_period,
    date_trunc(
      CASE 
        WHEN aggregation_period = 'hourly' THEN 'hour'
        WHEN aggregation_period = 'daily' THEN 'day'
        WHEN aggregation_period = 'weekly' THEN 'week'
      END,
      timestamp
    ) as time_bucket,
    COUNT(*) as count_readings,
    MIN(value) as min_value,
    MAX(value) as max_value,
    AVG(value) as avg_value,
    SUM(value) as sum_value,
    MIN(timestamp) as first_reading,
    MAX(timestamp) as last_reading
  FROM iot_data_stream
  WHERE timestamp >= now() - (interval_str)::interval
  GROUP BY sensor_id, data_type, time_bucket
  ON CONFLICT (sensor_id, data_type, aggregation_type, time_bucket)
  DO UPDATE SET
    count_readings = EXCLUDED.count_readings,
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    avg_value = EXCLUDED.avg_value,
    sum_value = EXCLUDED.sum_value,
    first_reading = EXCLUDED.first_reading,
    last_reading = EXCLUDED.last_reading;

  GET DIAGNOSTICS processed_count = ROW_COUNT;
  
  -- Log the aggregation
  PERFORM log_security_event(
    'data_aggregation_completed',
    jsonb_build_object(
      'aggregation_period', aggregation_period,
      'processed_count', processed_count
    )
  );
  
  RETURN processed_count;
END;
$$;