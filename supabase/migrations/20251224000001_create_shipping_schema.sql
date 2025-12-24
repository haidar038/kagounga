-- Migration: Create Shipping Schema for Lion Parcel and Multi-Courier Integration
-- Description: Adds tables and columns to support shipping cost calculation, courier management, and tracking

-- =====================================================
-- 1. CREATE SHIPPING COURIERS TABLE
-- =====================================================
-- Master data for available shipping couriers
CREATE TABLE IF NOT EXISTS "public"."shipping_couriers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL UNIQUE, -- e.g., 'lion_parcel', 'jne', 'tiki', 'sicepat'
    "name" TEXT NOT NULL, -- Display name e.g., 'Lion Parcel', 'JNE'
    "logo_url" TEXT, -- URL to courier logo
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "supports_local" BOOLEAN NOT NULL DEFAULT false, -- Supports local delivery in Ternate
    "supports_intercity" BOOLEAN NOT NULL DEFAULT true, -- Supports inter-city delivery
    "priority" INTEGER NOT NULL DEFAULT 0, -- Display order (higher = shown first)
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id")
);

-- =====================================================
-- 2. CREATE SHIPPING SERVICES TABLE
-- =====================================================
-- Service types available per courier (e.g., Regular, Express, Same Day)
CREATE TABLE IF NOT EXISTS "public"."shipping_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courier_id" UUID NOT NULL REFERENCES "public"."shipping_couriers"("id") ON DELETE CASCADE,
    "service_code" TEXT NOT NULL, -- e.g., 'REG', 'YES', 'OKE'
    "service_name" TEXT NOT NULL, -- e.g., 'Regular Service', 'Yakin Esok Sampai'
    "description" TEXT,
    "min_estimated_days" INTEGER, -- Minimum delivery days
    "max_estimated_days" INTEGER, -- Maximum delivery days
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("courier_id", "service_code")
);

-- =====================================================
-- 3. CREATE SHIPPING RATES CACHE TABLE
-- =====================================================
-- Cache for shipping rate calculations to reduce API calls
CREATE TABLE IF NOT EXISTS "public"."shipping_rates_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "origin_city" TEXT NOT NULL,
    "destination_city" TEXT NOT NULL,
    "destination_area_id" TEXT, -- Biteship area ID
    "courier_code" TEXT NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "weight_kg" NUMERIC NOT NULL,
    "rate_amount" NUMERIC NOT NULL,
    "min_estimated_days" INTEGER,
    "max_estimated_days" INTEGER,
    "cached_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Create index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_shipping_rates_cache_lookup 
ON "public"."shipping_rates_cache" (
    "origin_city", 
    "destination_city", 
    "courier_code", 
    "weight_kg", 
    "expires_at"
);

-- =====================================================
-- 4. MODIFY ORDERS TABLE - ADD SHIPPING COLUMNS
-- =====================================================
-- Add shipping-related columns to existing orders table
DO $$ 
BEGIN
    -- Courier information
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'courier_code') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "courier_code" TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'courier_name') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "courier_name" TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'service_code') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "service_code" TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'service_name') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "service_name" TEXT;
    END IF;

    -- Delivery estimation
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'estimated_delivery_days') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "estimated_delivery_days" TEXT; -- e.g., "2-3"
    END IF;

    -- Tracking information
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'tracking_number') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "tracking_number" TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'biteship_order_id') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "biteship_order_id" TEXT; -- Biteship's order ID for tracking
    END IF;

    -- Delivery type flag
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'is_local_delivery') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "is_local_delivery" BOOLEAN DEFAULT false;
    END IF;

    -- Package information
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'total_weight_kg') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "total_weight_kg" NUMERIC DEFAULT 1.0;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'shipping_notes') THEN
        ALTER TABLE "public"."orders" ADD COLUMN "shipping_notes" TEXT;
    END IF;
END $$;

-- =====================================================
-- 5. ENABLE RLS FOR NEW TABLES
-- =====================================================
ALTER TABLE "public"."shipping_couriers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shipping_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shipping_rates_cache" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Shipping Couriers: Public read access
DROP POLICY IF EXISTS "Anyone can view active couriers" ON "public"."shipping_couriers";
CREATE POLICY "Anyone can view active couriers"
ON "public"."shipping_couriers"
FOR SELECT
TO public
USING (is_active = true);

-- Shipping Services: Public read access
DROP POLICY IF EXISTS "Anyone can view active services" ON "public"."shipping_services";
CREATE POLICY "Anyone can view active services"
ON "public"."shipping_services"
FOR SELECT
TO public
USING (is_active = true);

-- Shipping Rates Cache: Public read access (for rate calculation)
DROP POLICY IF EXISTS "Anyone can view cached rates" ON "public"."shipping_rates_cache";
CREATE POLICY "Anyone can view cached rates"
ON "public"."shipping_rates_cache"
FOR SELECT
TO public
USING (expires_at > now());

-- Insert policies for cache (allow authenticated and service role)
DROP POLICY IF EXISTS "Service can insert cache" ON "public"."shipping_rates_cache";
CREATE POLICY "Service can insert cache"
ON "public"."shipping_rates_cache"
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- =====================================================
-- 7. SEED INITIAL COURIER DATA
-- =====================================================
-- Insert popular Indonesian couriers with recommended priority
INSERT INTO "public"."shipping_couriers" ("code", "name", "supports_local", "supports_intercity", "priority")
VALUES 
    ('lion_parcel', 'Lion Parcel', false, true, 100),
    ('jne', 'JNE', false, true, 90),
    ('jnt', 'J&T Express', false, true, 80),
    ('sicepat', 'SiCepat', false, true, 70),
    ('anteraja', 'AnterAja', false, true, 60),
    ('local_delivery', 'Pengiriman Lokal Ternate', true, false, 110) -- Highest priority for local
ON CONFLICT ("code") DO NOTHING;

-- =====================================================
-- 8. CREATE FUNCTION TO AUTO-UPDATE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_shipping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shipping_couriers
DROP TRIGGER IF EXISTS trigger_update_shipping_couriers_timestamp ON "public"."shipping_couriers";
CREATE TRIGGER trigger_update_shipping_couriers_timestamp
BEFORE UPDATE ON "public"."shipping_couriers"
FOR EACH ROW
EXECUTE FUNCTION update_shipping_updated_at();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
-- 1. shipping_couriers (master courier data)
-- 2. shipping_services (service types per courier)
-- 3. shipping_rates_cache (cache for API responses)
-- 
-- Orders table modified with shipping columns:
-- - courier_code, courier_name, service_code, service_name
-- - estimated_delivery_days, tracking_number, biteship_order_id
-- - is_local_delivery, total_weight_kg, shipping_notes
