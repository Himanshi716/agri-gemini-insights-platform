-- Update auth configuration to enable email confirmations
-- This will be applied via Supabase dashboard settings

-- Create a function to handle email confirmation logic
CREATE OR REPLACE FUNCTION public.is_email_confirmed(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT email_confirmed_at IS NOT NULL 
     FROM auth.users 
     WHERE id = user_id), 
    false
  );
$$;