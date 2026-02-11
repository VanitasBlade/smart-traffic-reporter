
-- Create reports table for accident reports
CREATE TABLE public.accident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prediction_label TEXT NOT NULL DEFAULT 'pending',
  confidence_score DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accident_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a report (public reporting)
CREATE POLICY "Anyone can create reports"
ON public.accident_reports
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view reports
CREATE POLICY "Authenticated users can view reports"
ON public.accident_reports
FOR SELECT
TO authenticated
USING (true);

-- Public can view their own recent report (for showing results)
CREATE POLICY "Public can view recent reports"
ON public.accident_reports
FOR SELECT
TO anon
USING (created_at > now() - interval '5 minutes');

-- Create storage bucket for accident images
INSERT INTO storage.buckets (id, name, public) VALUES ('accident-images', 'accident-images', true);

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload accident images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'accident-images');

-- Allow anyone to view accident images
CREATE POLICY "Anyone can view accident images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'accident-images');
