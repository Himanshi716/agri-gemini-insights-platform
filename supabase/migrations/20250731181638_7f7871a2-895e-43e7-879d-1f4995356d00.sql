-- Create compliance_certificates table for better certificate management
CREATE TABLE public.compliance_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_number TEXT,
  issuing_authority TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('active', 'pending', 'expired', 'revoked')) DEFAULT 'pending',
  certificate_file_url TEXT,
  compliance_score INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage certificates from their farms" 
ON public.compliance_certificates 
FOR ALL 
USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- Create update trigger
CREATE TRIGGER update_compliance_certificates_updated_at
BEFORE UPDATE ON public.compliance_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create document generation function edge function reference table
CREATE TABLE public.document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default templates
INSERT INTO public.document_templates (template_name, template_type, template_config) VALUES
('Certificate of Origin', 'export_certificate', '{"fields": ["product_name", "origin_country", "destination_country", "export_date", "quantity"], "format": "pdf"}'),
('Phytosanitary Certificate', 'health_certificate', '{"fields": ["plant_species", "scientific_name", "quantity", "origin_country", "destination_country", "inspection_date"], "format": "pdf"}'),
('Quality Certificate', 'quality_assurance', '{"fields": ["product_name", "quality_grade", "testing_date", "laboratory_name", "test_results"], "format": "pdf"}'),
('Export License', 'license', '{"fields": ["license_number", "product_category", "destination_country", "export_quantity", "value"], "format": "pdf"}');

-- Enable RLS for templates (public read, admin write)
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by all authenticated users" 
ON public.document_templates 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create IoT device management table
CREATE TABLE public.iot_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('bluetooth', 'wifi', 'lora', 'cellular')) NOT NULL,
  connection_status TEXT CHECK (connection_status IN ('connected', 'disconnected', 'pairing', 'error')) DEFAULT 'disconnected',
  device_address TEXT, -- MAC address for Bluetooth, IP for WiFi, etc.
  last_sync TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER,
  firmware_version TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage IoT devices from their farms" 
ON public.iot_devices 
FOR ALL 
USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- Create offline sensor data queue
CREATE TABLE public.sensor_data_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID,
  sensor_id UUID,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT CHECK (sync_status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sensor_data_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sensor queue data from their devices" 
ON public.sensor_data_queue 
FOR ALL 
USING (device_id IN (SELECT id FROM iot_devices WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())));

-- Create trigger for iot_devices
CREATE TRIGGER update_iot_devices_updated_at
BEFORE UPDATE ON public.iot_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();