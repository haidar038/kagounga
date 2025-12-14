-- =============================================
-- Kagōunga CMS Database Schema
-- =============================================

-- News Posts Table
CREATE TABLE public.news_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Signature Product Points (4 items)
CREATE TABLE public.signature_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL DEFAULT 'star',
  heading TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mission Content (single row table)
CREATE TABLE public.mission_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  heading TEXT NOT NULL DEFAULT 'Our Mission',
  paragraph TEXT NOT NULL,
  image_url TEXT,
  cta_text TEXT DEFAULT 'About Us',
  cta_url TEXT DEFAULT '/about',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery Images
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CTA Content (single row table)
CREATE TABLE public.cta_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL DEFAULT 'Get Popeda Now',
  description TEXT,
  button_text TEXT DEFAULT 'Buy Now',
  button_url TEXT DEFAULT '/products',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;

-- Public read policies for all content tables
CREATE POLICY "Anyone can read published news" ON public.news_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can read signature points" ON public.signature_points
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read mission content" ON public.mission_content
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read gallery images" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read CTA content" ON public.cta_content
  FOR SELECT USING (true);

-- Seed initial data for signature points
INSERT INTO public.signature_points (icon_name, heading, description, display_order) VALUES
  ('wheat', 'Authentic Sago Quality', 'Made from premium sago sourced from Maluku.', 1),
  ('timer', 'Ready in Minutes', 'Simple, fast preparation for modern life.', 2),
  ('heart-pulse', 'Low Cholesterol & High Fiber', 'Healthy and traditional.', 3),
  ('utensils-crossed', 'Pair Perfectly', 'Designed to pair with Kuah Soru and grilled fish.', 4);

-- Seed initial mission content
INSERT INTO public.mission_content (heading, paragraph, image_url, cta_text, cta_url) VALUES
  ('Our Mission', 'Kagōunga is dedicated to preserving and sharing the rich culinary heritage of Maluku Utara. We bring authentic popeda to modern tables, making traditional flavors accessible to everyone while supporting local sago farmers and sustainable practices.', 'https://kagounga.id/wp-content/uploads/2024/07/about-us-2.webp', 'About Us', '/about');

-- Seed initial CTA content
INSERT INTO public.cta_content (headline, description, button_text, button_url) VALUES
  ('Dapatkan Popeda Segera', 'Promo khusus untuk pembelian pertama. Nikmati kelezatan popeda autentik Maluku Utara hari ini.', 'Beli Sekarang', '/products');

-- Seed initial gallery images
INSERT INTO public.gallery_images (image_url, alt_text, caption, display_order) VALUES
  ('https://kagounga.id/wp-content/uploads/2024/07/homepage.webp', 'Popeda traditional serving', 'Traditional popeda preparation', 1),
  ('https://kagounga.id/wp-content/uploads/2024/07/about-us-2.webp', 'Kagounga team', 'Our dedicated team', 2),
  ('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', 'Food preparation', 'Fresh ingredients', 3),
  ('https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600', 'Cooking process', 'Artisan cooking', 4),
  ('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600', 'Served dish', 'Ready to serve', 5),
  ('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', 'Dining experience', 'Family dining', 6);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signature_points_updated_at
  BEFORE UPDATE ON public.signature_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_content_updated_at
  BEFORE UPDATE ON public.mission_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cta_content_updated_at
  BEFORE UPDATE ON public.cta_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();