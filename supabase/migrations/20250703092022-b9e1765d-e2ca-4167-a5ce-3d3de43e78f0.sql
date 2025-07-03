-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('farmer', 'admin', 'inspector', 'export_manager');
CREATE TYPE public.farm_status AS ENUM ('active', 'inactive', 'under_inspection');
CREATE TYPE public.crop_status AS ENUM ('planted', 'growing', 'harvesting', 'harvested', 'processed');
CREATE TYPE public.sensor_type AS ENUM ('temperature', 'humidity', 'soil_moisture', 'ph', 'light', 'co2');
CREATE TYPE public.compliance_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE public.document_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'archived');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'farmer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  size_hectares DECIMAL(10, 2),
  status farm_status NOT NULL DEFAULT 'active',
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  area_hectares DECIMAL(10, 2),
  status crop_status NOT NULL DEFAULT 'planted',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create IoT sensors table
CREATE TABLE public.iot_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type sensor_type NOT NULL,
  location_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  device_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor readings table (time-series data)
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create compliance records table
CREATE TABLE public.compliance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  standard_name TEXT NOT NULL,
  certificate_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  status compliance_status NOT NULL DEFAULT 'pending',
  audit_notes TEXT,
  documents_url TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create export documents table
CREATE TABLE public.export_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  file_url TEXT,
  status document_status NOT NULL DEFAULT 'draft',
  blockchain_hash TEXT,
  qr_code_url TEXT,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_documents ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for farms
CREATE POLICY "Users can view their own farms" ON public.farms
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own farms" ON public.farms
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins and inspectors can view all farms" ON public.farms
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'inspector'));

-- Create RLS policies for crops
CREATE POLICY "Users can view crops from their farms" ON public.crops
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage crops from their farms" ON public.crops
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Create RLS policies for IoT sensors
CREATE POLICY "Users can view sensors from their farms" ON public.iot_sensors
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage sensors from their farms" ON public.iot_sensors
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Create RLS policies for sensor readings
CREATE POLICY "Users can view readings from their sensors" ON public.sensor_readings
  FOR SELECT USING (
    sensor_id IN (
      SELECT s.id FROM public.iot_sensors s
      JOIN public.farms f ON s.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

CREATE POLICY "Sensors can insert readings" ON public.sensor_readings
  FOR INSERT WITH CHECK (true); -- Allow IoT devices to insert

-- Create RLS policies for compliance records
CREATE POLICY "Users can view compliance for their farms" ON public.compliance_records
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage compliance for their farms" ON public.compliance_records
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Create RLS policies for export documents
CREATE POLICY "Users can view documents from their farms" ON public.export_documents
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage documents from their farms" ON public.export_documents
  FOR ALL USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_farms_user_id ON public.farms(user_id);
CREATE INDEX idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX idx_iot_sensors_farm_id ON public.iot_sensors(farm_id);
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(timestamp);
CREATE INDEX idx_compliance_records_farm_id ON public.compliance_records(farm_id);
CREATE INDEX idx_export_documents_farm_id ON public.export_documents(farm_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iot_sensors_updated_at
  BEFORE UPDATE ON public.iot_sensors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at
  BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_documents_updated_at
  BEFORE UPDATE ON public.export_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for sensor readings
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

-- Enable realtime for IoT sensors status
ALTER TABLE public.iot_sensors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.iot_sensors;