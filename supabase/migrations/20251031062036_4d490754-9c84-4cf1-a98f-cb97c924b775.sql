-- Garantir tabela cases com campos completos
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  arquiteto TEXT,
  cidade TEXT,
  resumo TEXT,
  capa_url TEXT,
  ficha_pdf_url TEXT,
  materiais_principais TEXT[],
  acabamento TEXT,
  area_m2 NUMERIC,
  prazo_dias INTEGER,
  categoria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garantir tabela case_media
CREATE TABLE IF NOT EXISTS public.case_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'planta', 'elevacao')),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_case_media_case_id ON public.case_media(case_id);
CREATE INDEX IF NOT EXISTS idx_case_media_tipo ON public.case_media(tipo);
CREATE INDEX IF NOT EXISTS idx_cases_slug ON public.cases(slug);

-- RLS: leitura pública
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cases" ON public.cases;
CREATE POLICY "Anyone can read cases" 
  ON public.cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read case media" ON public.case_media;
CREATE POLICY "Anyone can read case media" 
  ON public.case_media FOR SELECT USING (true);