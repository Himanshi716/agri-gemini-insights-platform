-- Security Enhancement: Enable comprehensive audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type_param TEXT,
    event_data_param JSONB DEFAULT '{}',
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        user_id,
        event_type,
        event_data,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        event_type_param,
        event_data_param,
        ip_address_param,
        user_agent_param
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP address or user ID
    action TEXT NOT NULL, -- login, api_call, etc.
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique 
ON public.rate_limits (identifier, action, window_start);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    identifier_param TEXT,
    action_param TEXT,
    limit_param INTEGER DEFAULT 10,
    window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start time
    window_start_time := date_trunc('hour', now()) + 
        (EXTRACT(minute FROM now())::INTEGER / window_minutes) * 
        (window_minutes || ' minutes')::INTERVAL;
    
    -- Try to insert or update rate limit record
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (identifier_param, action_param, 1, window_start_time)
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET 
        count = rate_limits.count + 1,
        updated_at = now()
    RETURNING count INTO current_count;
    
    -- Check if limit exceeded
    IF current_count > limit_param THEN
        -- Log security event
        PERFORM log_security_event(
            'rate_limit_exceeded',
            jsonb_build_object(
                'identifier', identifier_param,
                'action', action_param,
                'count', current_count,
                'limit', limit_param
            )
        );
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Clean up old rate limit records (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.rate_limits 
    WHERE created_at < now() - INTERVAL '7 days';
END;
$$;

-- Create trigger to automatically update timestamps
CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();