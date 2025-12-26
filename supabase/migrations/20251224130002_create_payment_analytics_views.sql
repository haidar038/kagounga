-- =============================================
-- Payment Analytics Views and Functions
-- =============================================

-- Create a view for payment statistics
-- Using SECURITY INVOKER to run with querying user's permissions
CREATE OR REPLACE VIEW public.payment_statistics
WITH (security_invoker = true) AS
SELECT
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_transactions,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED')) as failed_transactions,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as success_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as failure_rate,
  SUM(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as total_revenue,
  AVG(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as average_transaction_value,
  MIN(created_at) as first_transaction_date,
  MAX(created_at) as last_transaction_date
FROM public.orders;

-- Create a view for revenue breakdown by payment method
-- Note: We need to add payment_method column to orders table first if it doesn't exist
DO $$ 
BEGIN
  IF NOT exists (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'payment_method') THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
  END IF;
END $$;

-- Using SECURITY INVOKER to run with querying user's permissions
CREATE OR REPLACE VIEW public.revenue_by_payment_method
WITH (security_invoker = true) AS
SELECT
  COALESCE(payment_method, 'Not Specified') as payment_method,
  COUNT(*) as transaction_count,
  COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_count,
  SUM(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as total_revenue,
  AVG(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as average_value,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as success_rate
FROM public.orders
GROUP BY payment_method
ORDER BY total_revenue DESC NULLS LAST;

-- Create a view for daily payment statistics
-- Using SECURITY INVOKER to run with querying user's permissions
CREATE OR REPLACE VIEW public.daily_payment_stats
WITH (security_invoker = true) AS
SELECT
  DATE(created_at) as transaction_date,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_transactions,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED')) as failed_transactions,
  SUM(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as daily_revenue,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as success_rate
FROM public.orders
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

-- Create a view for weekly payment statistics
-- Using SECURITY INVOKER to run with querying user's permissions
CREATE OR REPLACE VIEW public.weekly_payment_stats
WITH (security_invoker = true) AS
SELECT
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_transactions,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED')) as failed_transactions,
  SUM(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as weekly_revenue,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as success_rate
FROM public.orders
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Create a view for monthly payment statistics
-- Using SECURITY INVOKER to run with querying user's permissions
CREATE OR REPLACE VIEW public.monthly_payment_stats
WITH (security_invoker = true) AS
SELECT
  DATE_TRUNC('month', created_at) as month_start,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_transactions,
  COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED')) as failed_transactions,
  SUM(total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as monthly_revenue,
  ROUND(
    (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
    2
  ) as success_rate
FROM public.orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month_start DESC;

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get payment stats for a date range
CREATE OR REPLACE FUNCTION get_payment_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_transactions BIGINT,
  successful_transactions BIGINT,
  failed_transactions BIGINT,
  success_rate NUMERIC,
  failure_rate NUMERIC,
  total_revenue NUMERIC,
  average_transaction_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as successful_transactions,
    COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED')) as failed_transactions,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
      2
    ) as success_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('PENDING', 'FAILED', 'EXPIRED', 'CANCELLED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
      2
    ) as failure_rate,
    SUM(o.total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as total_revenue,
    AVG(o.total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as average_transaction_value
  FROM public.orders o
  WHERE 
    (start_date IS NULL OR o.created_at >= start_date)
    AND (end_date IS NULL OR o.created_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- Function to get top payment methods
CREATE OR REPLACE FUNCTION get_top_payment_methods(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  payment_method TEXT,
  transaction_count BIGINT,
  total_revenue NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(o.payment_method, 'Not Specified') as payment_method,
    COUNT(*) as transaction_count,
    SUM(o.total_amount) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED')) as total_revenue,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('PAID', 'SETTLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 
      2
    ) as success_rate
  FROM public.orders o
  GROUP BY o.payment_method
  ORDER BY total_revenue DESC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- RLS Policies for Analytics Views
-- =============================================

-- Enable RLS on views (they inherit from base table, but we'll be explicit)
-- Note: Views use the RLS of their underlying tables

-- Grant select on views to authenticated admins
GRANT SELECT ON public.payment_statistics TO authenticated;
GRANT SELECT ON public.revenue_by_payment_method TO authenticated;
GRANT SELECT ON public.daily_payment_stats TO authenticated;
GRANT SELECT ON public.weekly_payment_stats TO authenticated;
GRANT SELECT ON public.monthly_payment_stats TO authenticated;

-- Grant execute on functions to authenticated admins
GRANT EXECUTE ON FUNCTION get_payment_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_payment_methods TO authenticated;
