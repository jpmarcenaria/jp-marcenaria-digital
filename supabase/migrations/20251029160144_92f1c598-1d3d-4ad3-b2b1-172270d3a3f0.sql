-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create finishes table (MDF acabamentos)
CREATE TABLE IF NOT EXISTS public.finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  collection TEXT,
  color_hex TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.finishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read finishes"
  ON public.finishes FOR SELECT
  USING (true);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  environment TEXT CHECK (environment IN ('cozinha','sala','quarto','gourmet','escritorio')),
  description TEXT,
  size_m2 NUMERIC,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead','producao','instalado','publicado')),
  mdf_finish_id UUID REFERENCES public.finishes(id),
  hero_image TEXT,
  gallery TEXT[]
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published projects"
  ON public.projects FOR SELECT
  USING (status = 'publicado');

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone_whatsapp TEXT NOT NULL,
  city TEXT,
  source TEXT,
  budget_range TEXT,
  message TEXT,
  desired_date DATE,
  media JSONB DEFAULT '[]'
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  author TEXT NOT NULL,
  city TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  photo_url TEXT,
  approved BOOLEAN DEFAULT false
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved testimonials"
  ON public.testimonials FOR SELECT
  USING (approved = true);

-- Create media_gallery table
CREATE TABLE IF NOT EXISTS public.media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT,
  url TEXT NOT NULL,
  tags TEXT[],
  width INTEGER,
  height INTEGER,
  dominant_hex TEXT
);

ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media gallery"
  ON public.media_gallery FOR SELECT
  USING (true);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body_md TEXT,
  cover_url TEXT,
  published BOOLEAN DEFAULT false
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- Insert seed data for finishes
INSERT INTO public.finishes (name, brand, collection, color_hex) VALUES
  ('Nogal Sevilha', 'Arauco', 'Impressão', '#8A5A3B'),
  ('Freijó Linea', 'Duratex', 'Essencial', '#A67C52'),
  ('Carvalho Aserrado', 'Eucatex', 'Premium', '#B8956A'),
  ('Nogueira Madrid', 'Masisa', 'Vesto', '#6B4423'),
  ('Teka Artico', 'Arauco', 'Naturale', '#956F47'),
  ('Amendola Naturale', 'Duratex', 'Trend', '#D4A574'),
  ('Rovere Puro', 'Masisa', 'Vesto', '#C19B76'),
  ('Cedro Aroma', 'Eucatex', 'Linha Eco', '#B87A5A')
ON CONFLICT DO NOTHING;

-- Insert seed data for projects
INSERT INTO public.projects (title, slug, environment, description, status, size_m2, hero_image) VALUES
  ('Cozinha Gourmet com Ripado LED', 'cozinha-gourmet-ripado-led', 'cozinha', 'Projeto completo de cozinha planejada com painel ripado iluminado e acabamento em nogal.', 'publicado', 18.5, 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'),
  ('Home Office Executivo', 'home-office-executivo', 'escritorio', 'Ambiente corporativo residencial com marcenaria sob medida e iluminação técnica.', 'publicado', 12.0, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'),
  ('Sala de TV Premium', 'sala-tv-premium', 'sala', 'Painel ripado para TV 75" com LED indireto 2700K e nichos planejados.', 'publicado', 22.0, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800')
ON CONFLICT DO NOTHING;

-- Insert seed data for testimonials
INSERT INTO public.testimonials (author, city, rating, text, approved) VALUES
  ('Maria Silva', 'São Paulo', 5, 'Excelente trabalho! A qualidade dos móveis superou minhas expectativas.', true),
  ('João Santos', 'Campinas', 5, 'Profissionais muito atenciosos e o resultado ficou perfeito.', true),
  ('Ana Costa', 'São Bernardo', 4, 'Muito bom! Recomendo o trabalho da JP Marcenaria.', true),
  ('Carlos Mendes', 'Santo André', 5, 'Painel ripado com LED ficou espetacular. Vale cada centavo!', true)
ON CONFLICT DO NOTHING;