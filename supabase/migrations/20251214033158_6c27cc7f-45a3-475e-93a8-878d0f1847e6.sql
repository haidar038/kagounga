-- Add admin role type and user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for content management
CREATE POLICY "Admins can manage news" ON public.news_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage signature points" ON public.signature_points
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage mission content" ON public.mission_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage CTA" ON public.cta_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles policy (admins can manage roles)
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Seed sample news posts
INSERT INTO public.news_posts (slug, title, excerpt, body, featured_image, is_published, published_at) VALUES
  ('popeda-festival-2024', 'Kagōunga Hadir di Festival Kuliner Maluku Utara 2024', 'Kami dengan bangga mengumumkan partisipasi kami dalam Festival Kuliner Maluku Utara 2024.', 'Kagōunga akan hadir di Festival Kuliner Maluku Utara 2024 yang akan diselenggarakan di Jayapura pada tanggal 15-17 Agustus 2024. Kami akan membawa berbagai varian popeda instan terbaru dan mengadakan demo memasak setiap harinya. Jangan lewatkan kesempatan untuk mencicipi popeda autentik dan bertemu langsung dengan tim kami!', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', true, now() - interval '2 days'),
  ('new-product-launch', 'Peluncuran Produk Baru: Popeda Premium Series', 'Memperkenalkan lini produk premium dengan kualitas sagu terbaik.', 'Dengan bangga kami memperkenalkan Popeda Premium Series, lini produk terbaru kami yang dibuat dari sagu pilihan berkualitas tertinggi dari Maluku. Produk ini menawarkan tekstur yang lebih lembut dan rasa yang lebih kaya. Tersedia dalam kemasan 500g dan 1kg, cocok untuk restoran dan keluarga besar.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', true, now() - interval '5 days'),
  ('sustainability-initiative', 'Komitmen Kami untuk Keberlanjutan', 'Langkah-langkah yang kami ambil untuk mendukung petani sagu lokal.', 'Kagōunga berkomitmen untuk mendukung keberlanjutan lingkungan dan kesejahteraan petani sagu lokal. Kami bekerja sama langsung dengan petani di Maluku dan Maluku Utara untuk memastikan praktik pertanian yang berkelanjutan. Program ini tidak hanya menjaga kualitas sagu kami tetapi juga membantu meningkatkan taraf hidup masyarakat lokal.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', true, now() - interval '10 days');