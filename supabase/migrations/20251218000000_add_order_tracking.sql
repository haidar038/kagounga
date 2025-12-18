-- Add order tracking functionality for guest checkout
-- This allows guests to track their orders via email verification

-- Add tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tracking_access_token TEXT,
ADD COLUMN IF NOT EXISTS tracking_access_expires_at TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON public.orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_access ON public.orders(tracking_access_token);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Drop existing guest tracking policy if exists
DROP POLICY IF EXISTS "Guest can view order with valid access token" ON public.orders;

-- RLS Policy: Allow guests to view their order with valid access token
CREATE POLICY "Guest can view order with valid access token"
ON public.orders
FOR SELECT
TO anon
USING (
  tracking_access_token IS NOT NULL 
  AND tracking_access_expires_at > NOW()
  AND tracking_access_token = current_setting('request.jwt.claims', true)::json->>'tracking_token'
);

-- Note: The above policy uses JWT claims. We'll also create a simpler direct lookup
-- function that the Edge Function can use with Service Role to bypass RLS.

-- Create a secure function to verify and fetch order for tracking
CREATE OR REPLACE FUNCTION public.get_order_for_tracking(
  p_access_token TEXT
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  total_amount NUMERIC,
  shipping_cost NUMERIC,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  city TEXT,
  postal_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.status,
    o.total_amount,
    o.shipping_cost,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.shipping_address,
    o.city,
    o.postal_code,
    o.created_at,
    o.updated_at
  FROM public.orders o
  WHERE o.tracking_access_token = p_access_token
    AND o.tracking_access_expires_at > NOW();
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_order_for_tracking IS 
'Securely fetch order details using tracking access token. Token expires after set duration.';
