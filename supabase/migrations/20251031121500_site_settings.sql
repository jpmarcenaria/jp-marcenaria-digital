-- Site settings table for public contact information
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY,
  contact_phone TEXT NOT NULL CHECK (contact_phone ~ '^\(\d{2}\) \d{5}-\d{4}$'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to read site settings
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow only a single well-known row to be inserted/updated by anon (controlled key)
CREATE POLICY "Anon can upsert the single settings row"
  ON public.site_settings FOR INSERT
  TO anon
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Anon can update the single settings row"
  ON public.site_settings FOR UPDATE
  TO anon
  USING (id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (id = '00000000-0000-0000-0000-000000000001');

-- Seed the settings row with the desired contact_phone
INSERT INTO public.site_settings (id, contact_phone)
VALUES ('00000000-0000-0000-0000-000000000001', '(13) 97414-6380')
ON CONFLICT (id) DO UPDATE SET contact_phone = EXCLUDED.contact_phone, updated_at = NOW();

