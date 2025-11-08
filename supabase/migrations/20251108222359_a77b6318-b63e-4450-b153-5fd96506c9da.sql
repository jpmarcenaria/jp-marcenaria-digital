-- Create storage bucket for foto-magia images
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-magia', 'foto-magia', true);

-- Create storage policies for foto-magia bucket
CREATE POLICY "Anyone can upload to foto-magia"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'foto-magia');

CREATE POLICY "Anyone can read foto-magia images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'foto-magia');

-- Create foto_magia_projects table
CREATE TABLE public.foto_magia_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ambiente_image_url TEXT NOT NULL,
  movel_image_url TEXT NOT NULL,
  result_image_url TEXT,
  tipo_ambiente TEXT,
  tipo_movel TEXT,
  instrucoes TEXT
);

-- Enable RLS
ALTER TABLE public.foto_magia_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create foto-magia projects"
ON public.foto_magia_projects
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can read foto-magia projects"
ON public.foto_magia_projects
FOR SELECT
USING (false);