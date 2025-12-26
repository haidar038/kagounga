-- =============================================
-- Add Admin RLS Policies for Refund Requests
-- =============================================

-- Drop existing policies first (if any conflicts)
DROP POLICY IF EXISTS "Admin can view all refunds" ON public.refund_requests;
DROP POLICY IF EXISTS "Admin can update all refunds" ON public.refund_requests;

-- Admin can view ALL refund requests
CREATE POLICY "Admin can view all refunds" ON public.refund_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Admin can update ALL refund requests (approve, reject, process)
CREATE POLICY "Admin can update all refunds" ON public.refund_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.refund_requests TO authenticated;

-- Comments
COMMENT ON POLICY "Admin can view all refunds" ON public.refund_requests IS 'Allows admin users to view all refund requests';
COMMENT ON POLICY "Admin can update all refunds" ON public.refund_requests IS 'Allows admin users to update any refund request status';
