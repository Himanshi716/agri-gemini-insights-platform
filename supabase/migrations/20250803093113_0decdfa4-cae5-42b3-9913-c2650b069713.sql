-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type_param TEXT,
    event_data_param JSONB DEFAULT '{}',
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    identifier_param TEXT,
    action_param TEXT,
    limit_param INTEGER DEFAULT 10,
    window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limits 
    WHERE created_at < now() - INTERVAL '7 days';
END;
$$;