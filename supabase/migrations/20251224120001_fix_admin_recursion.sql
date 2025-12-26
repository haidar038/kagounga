-- Migration: Fix Infinite Recursion in Admin RLS
-- Description: Remove circular dependency in admin_users RLS policy

-- =====================================================
-- DROP THE RECURSIVE POLICY
-- =====================================================

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- =====================================================
-- SIMPLE SOLUTION: Allow authenticated users to check admin status
-- =====================================================
-- This is safe because:
-- 1. Users can only SELECT (read), not modify
-- 2. Knowing who is admin is not necessarily sensitive
-- 3. The table only contains user_id references, no sensitive data

CREATE POLICY "Anyone authenticated can check admin status"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- ALTERNATIVE: If you want to restrict viewing admin list
-- =====================================================
-- Uncomment this if you want only the user themselves to see if they're admin:
-- This prevents infinite recursion because it uses auth.uid() directly

-- DROP POLICY IF EXISTS "Anyone authenticated can check admin status" ON public.admin_users;
-- 
-- CREATE POLICY "Users can check their own admin status"
-- ON public.admin_users
-- FOR SELECT
-- TO authenticated
-- USING (user_id = auth.uid());

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Fixed: Infinite recursion in admin_users RLS policy
-- Now: Authenticated users can query admin_users without recursion
