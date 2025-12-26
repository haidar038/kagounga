-- Quick Debug & Fix Script for Admin RLS
-- Run this in Supabase SQL Editor to diagnose and fix the issue

-- =====================================================
-- STEP 1: Check if you're in admin_users table
-- =====================================================
-- Replace 'your-email@example.com' with your actual email

SELECT 
  u.id as user_id,
  u.email,
  CASE 
    WHEN a.user_id IS NOT NULL THEN '✅ YES - You are admin'
    ELSE '❌ NO - You are NOT admin yet'
  END as admin_status
FROM auth.users u
LEFT JOIN public.admin_users a ON a.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- =====================================================
-- STEP 2: If above shows ❌ NO, run this to add yourself
-- =====================================================

-- Option A: Add by email (RECOMMENDED - change the email)
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users 
WHERE email = 'your-email@example.com'  -- ⚠️ CHANGE THIS TO YOUR EMAIL
ON CONFLICT (user_id) DO NOTHING;

-- Option B: Add by user_id directly (if you know your user_id)
-- INSERT INTO public.admin_users (user_id) 
-- VALUES ('your-user-id-here')
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 3: Verify you're now an admin
-- =====================================================

SELECT 
  u.id,
  u.email,
  a.created_at as admin_since
FROM auth.users u
JOIN public.admin_users a ON a.user_id = u.id
WHERE u.id = auth.uid();  -- Your current logged in user

-- =====================================================
-- STEP 4: Test RLS policy with actual query
-- =====================================================

-- This should return TRUE if you're admin
SELECT EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE user_id = auth.uid()
) as am_i_admin;

-- =====================================================
-- STEP 5: List all admins
-- =====================================================

SELECT 
  u.email,
  a.created_at as admin_since
FROM public.admin_users a
JOIN auth.users u ON u.id = a.user_id
ORDER BY a.created_at;
