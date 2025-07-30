-- Create analytics_reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  content JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own reports" 
ON public.analytics_reports 
FOR ALL 
USING (user_id = auth.uid());

-- Create real_time_data table for live sensor monitoring
CREATE TABLE IF NOT EXISTS public.real_time_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL,
  data_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.real_time_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view real-time data from their sensors" 
ON public.real_time_data 
FOR SELECT 
USING (sensor_id IN (
  SELECT s.id 
  FROM iot_sensors s 
  JOIN farms f ON s.farm_id = f.id 
  WHERE f.user_id = auth.uid()
));

-- Create audit_logs table for compliance tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- Create compliance_requirements table
CREATE TABLE IF NOT EXISTS public.compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_name TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  evidence_required TEXT[],
  last_assessed TIMESTAMP WITH TIME ZONE,
  next_assessment TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All users can view compliance requirements" 
ON public.compliance_requirements 
FOR SELECT 
USING (true);

-- Enable realtime for real-time data
ALTER TABLE public.real_time_data REPLICA IDENTITY FULL;
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;

-- Insert sample compliance requirements
INSERT INTO public.compliance_requirements (standard_name, category, requirement_text, priority, compliance_score, evidence_required) VALUES 
('GlobalGAP', 'Food Safety', 'Water quality testing must be conducted monthly', 'high', 95, ARRAY['water_test_results', 'lab_certificates']),
('GlobalGAP', 'Environmental', 'Pesticide usage records must be maintained', 'critical', 88, ARRAY['pesticide_logs', 'application_records']),
('Organic Certification', 'Inputs', 'Only certified organic inputs allowed', 'critical', 100, ARRAY['input_certificates', 'purchase_records']),
('Fair Trade', 'Labor Standards', 'Fair wages must be documented and paid', 'high', 92, ARRAY['payroll_records', 'wage_certifications']),
('ISO 22000', 'Quality Control', 'HACCP plan implementation required', 'critical', 90, ARRAY['haccp_plan', 'implementation_records']);

-- Create function to calculate overall compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(farm_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_score NUMERIC;
BEGIN
    SELECT AVG(compliance_score) INTO avg_score
    FROM compliance_requirements;
    
    RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;