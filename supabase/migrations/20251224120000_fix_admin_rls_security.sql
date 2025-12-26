-- Migration: Fix Admin RLS Security - Use Admin Users Table
-- Description: Replace insecure user_metadata checks with secure admin_users table
-- This fixes both the security vulnerability and the update errors

-- =====================================================
-- 1. CREATE ADMIN USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin list (self-referencing, admins can see other admins)
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- 2. DROP OLD INSECURE POLICIES
-- =====================================================

-- Drop the insecure policies that reference user_metadata
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;

-- =====================================================
-- 3. CREATE SECURE ADMIN POLICIES FOR PRODUCTS
-- =====================================================

-- Policy: Admins can view ALL products (including inactive)
CREATE POLICY "Admins can view all products" 
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can insert new products
CREATE POLICY "Admins can insert products" 
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can update any product
CREATE POLICY "Admins can update products" 
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can delete any product
CREATE POLICY "Admins can delete products" 
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- 4. CREATE SECURE ADMIN POLICIES FOR CATEGORIES
-- =====================================================

-- Policy: Admins can manage categories (all operations)
CREATE POLICY "Admins can manage categories" 
ON public.product_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- 5. SEED INITIAL ADMIN USER
-- =====================================================
-- NOTE: Replace the email below with your actual admin email
-- Or manually insert your user_id after running this migration

-- Example: Insert admin user by email (uncomment and update email)
-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Changes:
-- 1. Created admin_users table for secure admin tracking
-- 2. Replaced all insecure user_metadata checks with admin_users table lookups
-- 3. This fixes the RLS security vulnerability (PGRST116 error)
-- 4. This fixes the update errors caused by failed RLS checks
--
-- IMPORTANT: After running this migration, you MUST add your user ID to admin_users table:
-- INSERT INTO public.admin_users (user_id) VALUES ('your-user-id-here');
