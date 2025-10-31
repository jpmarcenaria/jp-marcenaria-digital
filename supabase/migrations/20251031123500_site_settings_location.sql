-- Add city/state to site_settings and seed location
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Guarujá',
  ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'SP',
  ADD CONSTRAINT state_is_brazil_uf CHECK (state ~ '^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$');

-- Ensure the single row has the desired location
INSERT INTO public.site_settings (id, contact_phone, city, state)
VALUES ('00000000-0000-0000-0000-000000000001', '(13) 97414-6380', 'Guarujá', 'SP')
ON CONFLICT (id) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state, updated_at = NOW();

