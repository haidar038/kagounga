-- =============================================
-- Admin Activity Logs Schema
-- =============================================

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Admin who performed the action
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create', 'update', 'delete', 'approve', 'reject', 
    'publish', 'unpublish', 'restore', 'bulk_action'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'product', 'order', 'review', 'news', 'gallery', 
    'signature', 'content', 'user', 'category'
  )),
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  -- Changes tracking
  changes JSONB, -- Store before/after values
  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for filtering and searching
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON public.admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_entity_type ON public.admin_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_entity_id ON public.admin_activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_changes ON public.admin_activity_logs USING GIN(changes);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for admin_activity_logs
-- =============================================

-- Only admins can read activity logs
CREATE POLICY "Admins can read activity logs" ON public.admin_activity_logs
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- System (service role) can insert logs
-- Note: Inserts will typically be done via service role or triggers
-- We'll allow authenticated users to insert IF they are admins
CREATE POLICY "Admins can create activity logs" ON public.admin_activity_logs
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =============================================
-- Helper Function to Log Activities
-- =============================================

-- This function can be called from the application or triggers
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_admin_email TEXT,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_id,
    admin_email,
    action_type,
    entity_type,
    entity_id,
    entity_name,
    changes,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_admin_email,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_changes,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
