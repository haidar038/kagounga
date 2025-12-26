-- =============================================
-- Product Reviews Schema
-- =============================================

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- For guest reviews
  guest_name TEXT,
  guest_email TEXT,
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_note TEXT,
  -- Engagement
  helpful_count INTEGER NOT NULL DEFAULT 0,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON public.product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

-- Create helpful votes table
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_identifier TEXT, -- For guest users (could be IP or session ID)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id),
  UNIQUE (review_id, guest_identifier)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON public.review_helpful_votes(review_id);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for product_reviews
-- =============================================

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON public.product_reviews
  FOR SELECT USING (status = 'approved');

-- Authenticated users can read their own reviews regardless of status
CREATE POLICY "Users can read their own reviews" ON public.product_reviews
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON public.product_reviews
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND guest_name IS NULL 
    AND guest_email IS NULL
  );

-- Guest users can create reviews (with guest info)
CREATE POLICY "Guest users can create reviews" ON public.product_reviews
  FOR INSERT 
  TO anon
  WITH CHECK (
    user_id IS NULL 
    AND guest_name IS NOT NULL 
    AND guest_email IS NOT NULL
  );

-- Users can update their own reviews (only if pending)
CREATE POLICY "Users can update their own pending reviews" ON public.product_reviews
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews (only if pending)
CREATE POLICY "Users can delete their own pending reviews" ON public.product_reviews
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- =============================================
-- RLS Policies for review_helpful_votes
-- =============================================

-- Anyone can read helpful votes
CREATE POLICY "Anyone can read helpful votes" ON public.review_helpful_votes
  FOR SELECT USING (true);

-- Authenticated users can vote helpful
CREATE POLICY "Authenticated users can vote helpful" ON public.review_helpful_votes
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Guest users can vote helpful
CREATE POLICY "Guest users can vote helpful" ON public.review_helpful_votes
  FOR INSERT 
  TO anon
  WITH CHECK (user_id IS NULL AND guest_identifier IS NOT NULL);

-- Users can remove their own votes
CREATE POLICY "Users can remove their helpful votes" ON public.review_helpful_votes
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- Triggers
-- =============================================

-- Update updated_at timestamp
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update helpful_count when votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR DELETE ON public.review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Update product rating when reviews change
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    ),
    reviews = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();
