-- =============================================
-- Product Variants Schema
-- =============================================

-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  
  -- Variant attributes as JSONB for flexibility
  -- Example: {"size": "200g", "flavor": "original"}
  attributes JSONB NOT NULL DEFAULT '{}',
  
  -- Pricing
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  
  -- Inventory
  stock INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_attributes ON public.product_variants USING GIN(attributes);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for product_variants
-- =============================================

-- Anyone can read active variants of active products
CREATE POLICY "Anyone can read active variants" ON public.product_variants
  FOR SELECT 
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

-- Admins can manage all variants (handled by admin policies)

-- =============================================
-- Update order_items table to support variants
-- =============================================

-- Add variant columns to order_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'variant_name'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN variant_name TEXT;
  END IF;
END $$;

-- =============================================
-- Triggers
-- =============================================

-- Update updated_at timestamp
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get product with its variants
CREATE OR REPLACE FUNCTION get_product_with_variants(p_product_id UUID)
RETURNS TABLE (
  product_data JSONB,
  variants_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    row_to_json(p.*)::JSONB as product_data,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'sku', v.sku,
          'name', v.name,
          'attributes', v.attributes,
          'price', v.price,
          'original_price', v.original_price,
          'stock', v.stock,
          'is_active', v.is_active,
          'display_order', v.display_order
        ) ORDER BY v.display_order, v.name
      ) FILTER (WHERE v.id IS NOT NULL),
      '[]'::JSONB
    ) as variants_data
  FROM public.products p
  LEFT JOIN public.product_variants v ON v.product_id = p.id AND v.is_active = true
  WHERE p.id = p_product_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if product has variants
CREATE OR REPLACE FUNCTION product_has_variants(p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.product_variants
    WHERE product_id = p_product_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Add has_variants flag to products table
-- =============================================

-- Add computed column to indicate if product has variants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'has_variants'
  ) THEN
    ALTER TABLE public.products ADD COLUMN has_variants BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create trigger to automatically update has_variants flag
CREATE OR REPLACE FUNCTION update_product_has_variants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.products
    SET has_variants = (
      SELECT COUNT(*) > 0
      FROM public.product_variants
      WHERE product_id = NEW.product_id AND is_active = true
    )
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET has_variants = (
      SELECT COUNT(*) > 0
      FROM public.product_variants
      WHERE product_id = OLD.product_id AND is_active = true
    )
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_has_variants_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_product_has_variants();
