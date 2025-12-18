-- Phase 1: Admin Order Management
-- Add shipping tracking, order notes, and history tables

-- 1. Add shipping tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;

-- 2. Create order notes table for admin comments
CREATE TABLE IF NOT EXISTS public.order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create order history table for audit trail
CREATE TABLE IF NOT EXISTS public.order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at);

-- 5. Enable RLS on new tables
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for order_notes
-- Admin can view all notes
CREATE POLICY "Admin can view all order notes"
ON public.order_notes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Admin can insert notes
CREATE POLICY "Admin can insert order notes"
ON public.order_notes
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- 7. RLS Policies for order_history
-- Admin can view all history
CREATE POLICY "Admin can view all order history"
ON public.order_history
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Admin can insert history (automatic via trigger)
CREATE POLICY "Admin can insert order history"
ON public.order_history
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- 8. Create function to log order changes
CREATE OR REPLACE FUNCTION public.log_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_history (order_id, changed_by, field_changed, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);
    END IF;
    
    -- Log tracking number changes
    IF OLD.tracking_number IS DISTINCT FROM NEW.tracking_number THEN
        INSERT INTO public.order_history (order_id, changed_by, field_changed, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'tracking_number', OLD.tracking_number, NEW.tracking_number);
    END IF;
    
    -- Log courier changes
    IF OLD.courier IS DISTINCT FROM NEW.courier THEN
        INSERT INTO public.order_history (order_id, changed_by, field_changed, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'courier', OLD.courier, NEW.courier);
    END IF;
    
    RETURN NEW;
END;
$$;

-- 9. Create trigger for automatic history logging
DROP TRIGGER IF EXISTS log_order_changes ON public.orders;
CREATE TRIGGER log_order_changes
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_change();

-- 10. Grant permissions
GRANT SELECT, INSERT ON public.order_notes TO authenticated;
GRANT SELECT ON public.order_history TO authenticated;

COMMENT ON TABLE public.order_notes IS 'Admin notes for orders - internal use only';
COMMENT ON TABLE public.order_history IS 'Audit trail of all order changes';
COMMENT ON FUNCTION public.log_order_change IS 'Automatically logs order field changes to history table';
