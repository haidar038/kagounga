-- Fix guest order tracking RLS issue
-- This migration removes the problematic RLS policy and ensures edge functions work correctly

-- Step 1: Drop the problematic RLS policy that blocks anonymous users
DROP POLICY IF EXISTS "Guest can view order with valid access token" ON public.orders;

-- Step 2: The existing authenticated user policy should remain
-- (Users can view their own orders when logged in is already defined)

-- Step 3: Ensure the get_order_for_tracking function has proper permissions
-- This function is called by edge functions using Service Role (bypasses RLS)
-- Grant to public role to ensure edge functions can call it
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(TEXT) TO service_role;

-- Step 4: Verify the function is SECURITY DEFINER (already set, but confirming)
-- This ensures the function runs with owner privileges, bypassing RLS
-- The function already has this, no changes needed

COMMENT ON FUNCTION public.get_order_for_tracking IS 
'Securely fetch order details using tracking access token. Runs as SECURITY DEFINER to bypass RLS.';

-- Step 5: Important note about edge function security
-- Edge functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS automatically
-- They can freely query and update the orders table
-- The security is enforced by:
-- 1. Email + Order ID verification before generating access token
-- 2. Time-limited access tokens (1 hour expiry)
-- 3. Cryptographically secure token generation
