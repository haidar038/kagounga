-- =============================================
-- Products and Categories Schema
-- =============================================

-- Create product_categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT NOT NULL,
  images TEXT[],
  category_id TEXT NOT NULL REFERENCES public.product_categories(id) ON DELETE RESTRICT,
  stock INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  nutrition_calories INTEGER,
  nutrition_carbs NUMERIC,
  nutrition_protein NUMERIC,
  nutrition_fat NUMERIC,
  serving_size TEXT,
  prep_time TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Anyone can read categories" ON public.product_categories
  FOR SELECT USING (true);

-- RLS Policies for products
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Seed Data - Categories
-- =============================================

INSERT INTO public.product_categories (id, name, icon, display_order) VALUES
  ('all', 'All Products', '🍽️', 0),
  ('original', 'Original', '⭐', 1),
  ('variant', 'Variant', '🌈', 2),
  ('instant', 'Instant', '⚡', 3),
  ('bundle', 'Bundle', '📦', 4),
  ('condiment', 'Condiment', '🌶️', 5)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Seed Data - Products
-- =============================================

INSERT INTO public.products (
  slug, name, description, long_description, price, original_price,
  image, images, category_id, stock, rating, reviews, tags,
  nutrition_calories, nutrition_carbs, nutrition_protein, nutrition_fat,
  serving_size, prep_time
) VALUES
  (
    'popeda-original',
    'Popeda Original',
    'Authentic North Maluku Popeda with perfect chewy texture. Made from high-quality selected sago.',
    'Popeda Original is a traditional North Maluku dish that has been part of the culture for centuries. Made from pure sago flour processed traditionally, our popeda has a perfect chewy texture and authentic taste. Best served with Yellow Fish Soup or Colo-colo sambal.',
    25000,
    32000,
    '/products/popeda-original.jpg',
    ARRAY['/products/popeda-original.jpg', '/products/popeda-original-2.jpg'],
    'original',
    50,
    4.8,
    124,
    ARRAY['bestseller', 'original'],
    180,
    42,
    2,
    0.5,
    '200g',
    '5 minutes'
  ),
  (
    'popeda-sagu-mix',
    'Popeda Sago Mix',
    'Unique combination of North Maluku sago with selected ingredients for a different taste experience.',
    'Popeda Sago Mix brings a new innovation in enjoying popeda. With a blend of premium sago and selected ingredients, this variant offers a softer texture and richer taste.',
    28000,
    NULL,
    '/products/popeda-mix.jpg',
    ARRAY['/products/popeda-mix.jpg'],
    'variant',
    35,
    4.6,
    89,
    ARRAY['new'],
    195,
    45,
    3,
    0.8,
    '200g',
    '5 minutes'
  ),
  (
    'popeda-instan-cup',
    'Instant Popeda Cup',
    'Practical popeda in a cup. Just add hot water, ready in 3 minutes!',
    'Instant Popeda Cup is a practical solution to enjoy popeda anytime and anywhere. With portable cup packaging, you only need to add hot water and popeda is ready to eat in 3 minutes.',
    15000,
    NULL,
    '/products/popeda-cup.jpg',
    ARRAY['/products/popeda-cup.jpg'],
    'instant',
    100,
    4.5,
    256,
    ARRAY['practical', 'bestseller'],
    150,
    35,
    1.5,
    0.3,
    '150g',
    '3 minutes'
  ),
  (
    'paket-keluarga',
    'Family Bundle',
    'Value bundle for the family. Contains 5 portions of original popeda with complete seasonings.',
    'Family Bundle is the best choice to enjoy popeda with your beloved family. Contains 5 portions of original popeda complete with Yellow Fish Soup seasoning and Colo-colo sambal.',
    99000,
    125000,
    '/products/paket-keluarga.jpg',
    ARRAY['/products/paket-keluarga.jpg'],
    'bundle',
    20,
    4.9,
    67,
    ARRAY['value', 'bundle'],
    900,
    210,
    10,
    2.5,
    '1kg',
    '10 minutes'
  ),
  (
    'sambal-colo-colo',
    'Sambal Colo-Colo',
    'North Maluku''s signature sambal with a fresh taste. Perfect complement for your popeda.',
    'Sambal Colo-Colo is a traditional North Maluku sambal made from cayenne pepper, shallots, tomatoes, and lime. The distinct fresh and spicy taste makes your popeda even more delicious.',
    18000,
    NULL,
    '/products/sambal-colo.jpg',
    ARRAY['/products/sambal-colo.jpg'],
    'condiment',
    75,
    4.7,
    198,
    ARRAY['condiment'],
    NULL,
    NULL,
    NULL,
    NULL,
    '100ml',
    NULL
  ),
  (
    'ikan-kuah-kuning',
    'Yellow Fish Soup',
    'Tuna cooked in North Maluku''s signature yellow soup. A classic pair for popeda.',
    'Yellow Fish Soup is a tuna dish cooked in North Maluku''s signature yellow soup with turmeric, galangal, and selected spices. This dish is an inseparable classic partner for popeda.',
    35000,
    NULL,
    '/products/ikan-kuah.jpg',
    ARRAY['/products/ikan-kuah.jpg'],
    'condiment',
    8,
    4.8,
    145,
    ARRAY['condiment', 'low-stock'],
    NULL,
    NULL,
    NULL,
    NULL,
    '250g',
    'Ready to eat'
  )
ON CONFLICT (slug) DO NOTHING;
