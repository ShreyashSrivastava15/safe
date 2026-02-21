-- ADMIN POLICY FOR S.A.F.E.
-- This script allows the designated admin to view ALL user logs for regulation purposes.

-- 1. Enable RLS (Should already be enabled)
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create the Admin View Policy
-- This uses the email claim from the JWT token to verify admin status
CREATE POLICY "Admins can view all logs" 
    ON public.analysis_logs
    FOR SELECT 
    USING (
        auth.jwt() ->> 'email' = 'shreyashsr2004@gmail.com'
    );

-- 3. (Optional) Create Admin Delete Policy for regulation
CREATE POLICY "Admins can delete any logs" 
    ON public.analysis_logs
    FOR DELETE 
    USING (
        auth.jwt() ->> 'email' = 'shreyashsr2004@gmail.com'
    );

-- NOTE: The current 'Allow authenticated user to read own logs' policy still exists.
-- RLS policies are ORed, so the admin sees everything, while regular users see only their own.
