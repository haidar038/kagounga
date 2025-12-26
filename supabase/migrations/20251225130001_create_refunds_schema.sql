-- =============================================
-- Refund Requests Schema
-- =============================================

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Request details
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'FRAUDULENT', 
    'DUPLICATE', 
    'REQUESTED_BY_CUSTOMER', 
    'CANCELLATION', 
    'OTHERS'
  )),
  reason_note TEXT,
  amount NUMERIC NOT NULL,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN (
      'pending',      -- Customer submitted, waiting admin review
      'approved',     -- Admin approved, ready to process
      'rejected',     -- Admin rejected
      'processing',   -- Refund API called, waiting response
      'completed',    -- Refund successful
      'failed'        -- Refund failed
    )),
  
  -- Admin review
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Xendit integration
  xendit_refund_id TEXT UNIQUE,
  payment_request_id TEXT, -- Original Xendit payment ID from order
  refund_method TEXT, -- Same as original payment method
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON public.refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_by ON public.refund_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON public.refund_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for refund_requests
-- =============================================

-- Users can view their own refund requests
CREATE POLICY "Users can view own refunds" ON public.refund_requests
  FOR SELECT 
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Users can create refund requests for their orders
CREATE POLICY "Users can request refunds" ON public.refund_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
      AND status IN ('PAID', 'SETTLED', 'DELIVERED')
    )
  );

-- Users can update their pending refund requests (to cancel or edit)
CREATE POLICY "Users can update pending refunds" ON public.refund_requests
  FOR UPDATE 
  TO authenticated
  USING (requested_by = auth.uid() AND status = 'pending')
  WITH CHECK (requested_by = auth.uid() AND status = 'pending');

-- Admins can view all refund requests (via admin policies)
-- Admins can update refund status (via admin policies)

-- =============================================
-- Triggers
-- =============================================

-- Update updated_at timestamp
CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_refund_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_refund_completed_at_trigger
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION set_refund_completed_at();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get refund with order details
CREATE OR REPLACE FUNCTION get_refund_with_order(p_refund_id UUID)
RETURNS TABLE (
  refund_data JSONB,
  order_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    row_to_json(r.*)::JSONB as refund_data,
    row_to_json(o.*)::JSONB as order_data
  FROM public.refund_requests r
  JOIN public.orders o ON r.order_id = o.id
  WHERE r.id = p_refund_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if order is eligible for refund
CREATE OR REPLACE FUNCTION is_order_refundable(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  order_status TEXT;
  existing_refund BOOLEAN;
BEGIN
  -- Check order status
  SELECT status INTO order_status
  FROM public.orders
  WHERE id = p_order_id;
  
  -- Check if already has a refund request
  SELECT EXISTS (
    SELECT 1 FROM public.refund_requests
    WHERE order_id = p_order_id
    AND status NOT IN ('rejected', 'failed')
  ) INTO existing_refund;
  
  -- Order must be PAID, SETTLED, or DELIVERED and not have existing refund
  RETURN order_status IN ('PAID', 'SETTLED', 'DELIVERED') 
    AND NOT existing_refund;
END;
$$ LANGUAGE plpgsql;
