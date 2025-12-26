-- Migration: Admin Product Management Policies
-- Description: Add RLS policies for admin users to manage products (CRUD operations)

-- =====================================================
-- 1. ADD ADMIN RLS POLICIES FOR PRODUCTS TABLE
-- =====================================================

-- Drop existing admin policies if they exist (idempotent)
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Policy: Admins can view ALL products (including inactive)
CREATE POLICY "Admins can view all products" 
ON public.products
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: Admins can insert new products
CREATE POLICY "Admins can insert products" 
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: Admins can update any product
CREATE POLICY "Admins can update products" 
ON public.products
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: Admins can delete any product
CREATE POLICY "Admins can delete products" 
ON public.products
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- 2. ADD ADMIN RLS POLICIES FOR PRODUCT_CATEGORIES TABLE
-- =====================================================

-- Drop existing admin policies if they exist (idempotent)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;

-- Policy: Admins can manage categories (all operations)
CREATE POLICY "Admins can manage categories" 
ON public.product_categories
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Policies added:
-- 1. Admins can view all products (including inactive)
-- 2. Admins can insert products
-- 3. Admins can update products
-- 4. Admins can delete products
-- 5. Admins can manage categories
