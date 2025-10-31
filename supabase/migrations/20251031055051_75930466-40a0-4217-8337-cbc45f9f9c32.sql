-- Create cases table for portfolio projects
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  titulo text NOT NULL,
  arquiteto text,
  cidade text,
  resumo text,
  capa_url text,
  ficha_pdf_url text,
  categoria text,
  area_m2 numeric,
  prazo_dias integer,
  materiais_principais text[],
  acabamento text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Allow public to read cases
CREATE POLICY "Anyone can read cases"
  ON public.cases
  FOR SELECT
  USING (true);

-- Create case_media table for case photos, plans, elevations
CREATE TABLE public.case_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  tipo text CHECK (tipo IN ('foto', 'planta', 'elevacao')) NOT NULL,
  alt text,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_media ENABLE ROW LEVEL SECURITY;

-- Allow public to read case media
CREATE POLICY "Anyone can read case media"
  ON public.case_media
  FOR SELECT
  USING (true);

-- Create materials table
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  acabamento text,
  cor text,
  espessura text,
  fornecedor text,
  ficha_url text,
  imagem_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Allow public to read materials
CREATE POLICY "Anyone can read materials"
  ON public.materials
  FOR SELECT
  USING (true);

-- Create briefings table
CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text NOT NULL,
  obra text,
  ambientes text[],
  medidas text,
  materiais_desejados text[],
  prazo text,
  observacoes text,
  anexos_urls text[],
  whatsapp_link text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create briefings
CREATE POLICY "Anyone can create briefings"
  ON public.briefings
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_cases_slug ON public.cases(slug);
CREATE INDEX idx_case_media_case_id ON public.case_media(case_id);
CREATE INDEX idx_materials_acabamento ON public.materials(acabamento);
CREATE INDEX idx_materials_fornecedor ON public.materials(fornecedor);