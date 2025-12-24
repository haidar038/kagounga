-- Migration: Add Product Weight and Dimensions
-- Description: Adds weight and dimension fields to products table for shipping calculations

-- =====================================================
-- ADD WEIGHT AND DIMENSION COLUMNS TO PRODUCTS
-- =====================================================
DO $$ 
BEGIN
    -- Weight in kilograms (default 1kg as confirmed by user)
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'weight_kg') THEN
        ALTER TABLE "public"."products" ADD COLUMN "weight_kg" NUMERIC NOT NULL DEFAULT 1.0;
        COMMENT ON COLUMN "public"."products"."weight_kg" IS 'Product weight in kilograms for shipping calculation';
    END IF;

    -- Optional dimensions for volumetric weight calculation
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'length_cm') THEN
        ALTER TABLE "public"."products" ADD COLUMN "length_cm" NUMERIC;
        COMMENT ON COLUMN "public"."products"."length_cm" IS 'Product length in centimeters (optional)';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'width_cm') THEN
        ALTER TABLE "public"."products" ADD COLUMN "width_cm" NUMERIC;
        COMMENT ON COLUMN "public"."products"."width_cm" IS 'Product width in centimeters (optional)';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'height_cm') THEN
        ALTER TABLE "public"."products" ADD COLUMN "height_cm" NUMERIC;
        COMMENT ON COLUMN "public"."products"."height_cm" IS 'Product height in centimeters (optional)';
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Products table now has:
-- - weight_kg (default 1.0 kg)
-- - length_cm, width_cm, height_cm (optional for volumetric calculations)
