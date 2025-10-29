-- Criar tipos enum
CREATE TYPE app_role AS ENUM ('admin', 'user');
CREATE TYPE project_status AS ENUM ('lead', 'producao', 'instalado', 'publicado');
CREATE TYPE appointment_status AS ENUM ('novo', 'confirmado', 'feito', 'cancelado');
CREATE TYPE environment_type AS ENUM ('cozinha', 'sala', 'quarto', 'gourmet', 'escritorio');

-- Perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role DEFAULT 'admin',
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acabamentos MDF
CREATE TABLE finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  collection TEXT,
  color_hex TEXT,
  image_url TEXT
);

-- Presets de iluminação
CREATE TABLE lighting_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cct_kelvin INT,
  description TEXT
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone_whatsapp TEXT NOT NULL,
  city TEXT,
  source TEXT,
  budget_range TEXT,
  message TEXT,
  desired_date DATE,
  media JSONB DEFAULT '[]'::jsonb
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  status appointment_status DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  environment environment_type,
  description TEXT,
  size_m2 NUMERIC,
  status project_status DEFAULT 'lead',
  mdf_finish_id UUID REFERENCES finishes(id),
  hero_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Materiais
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  supplier TEXT,
  color_hex TEXT,
  price_per_m2 NUMERIC
);

-- Depoimentos
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  city TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  photo_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galeria de mídia
CREATE TABLE media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  width INT,
  height INT,
  dominant_hex TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts do blog
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body_md TEXT,
  cover_url TEXT,
  published BOOLEAN DEFAULT FALSE
);

-- Pacotes de preço
CREATE TABLE pricing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  starting_price NUMERIC,
  features TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- RLS Policies para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies para finishes (leitura pública)
CREATE POLICY "Anyone can view finishes"
  ON finishes FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage finishes"
  ON finishes FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para lighting_presets (leitura pública)
CREATE POLICY "Anyone can view lighting presets"
  ON lighting_presets FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage lighting presets"
  ON lighting_presets FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para leads (público INSERT, admin SELECT)
CREATE POLICY "Anyone can create leads"
  ON leads FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON leads FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update leads"
  ON leads FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies para appointments (apenas admin)
CREATE POLICY "Admins can manage appointments"
  ON appointments FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para projects (leitura pública para publicados)
CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  TO authenticated, anon
  USING (status = 'publicado');

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para materials
CREATE POLICY "Anyone can view materials"
  ON materials FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage materials"
  ON materials FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para testimonials (leitura pública apenas aprovados)
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  TO authenticated, anon
  USING (approved = true);

CREATE POLICY "Admins can view all testimonials"
  ON testimonials FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para media_gallery
CREATE POLICY "Anyone can view media gallery"
  ON media_gallery FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage media gallery"
  ON media_gallery FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para blog_posts (leitura pública para publicados)
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Admins can view all posts"
  ON blog_posts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage posts"
  ON blog_posts FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies para pricing_packages
CREATE POLICY "Anyone can view pricing packages"
  ON pricing_packages FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage pricing packages"
  ON pricing_packages FOR ALL
  USING (is_admin(auth.uid()));

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seeds: Acabamentos MDF
INSERT INTO finishes (name, brand, collection, color_hex, image_url) VALUES
  ('Freijó Naturale', 'Arauco', 'Naturale', '#C4956F', 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=400'),
  ('Carvalho Aserrado', 'Duratex', 'Linha Madeira', '#8B6F47', 'https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=400'),
  ('Nogal Sevilha', 'Masisa', 'Premium', '#5C4033', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400'),
  ('Castanho Terra', 'Eucatex', 'Essenza', '#6B4423', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
  ('Noce Cannes', 'Arauco', 'Naturale', '#8A5A3B', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400'),
  ('Branco Lacca', 'Arauco', 'Essencial', '#F5F1E6', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'),
  ('Preto Texturizado', 'Duratex', 'Linha Moderna', '#1F2937', 'https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=400'),
  ('Rovere Rústico', 'Masisa', 'Natural', '#A67C52', 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=400');

-- Seeds: Presets de iluminação
INSERT INTO lighting_presets (name, cct_kelvin, description) VALUES
  ('LED Branco Quente', 2700, 'Luz âmbar aconchegante ideal para salas e quartos'),
  ('LED Branco Neutro', 3000, 'Equilíbrio perfeito entre conforto e claridade'),
  ('LED Branco Frio', 4000, 'Iluminação clara para áreas de trabalho'),
  ('Fita LED RGB', NULL, 'Iluminação colorida programável via app'),
  ('Fita LED Warm White', 2800, 'Tom dourado suave para destacar ripados'),
  ('Fita LED Tunable White', NULL, 'Temperatura ajustável de 2700K a 6500K');

-- Seeds: Pacotes de preço
INSERT INTO pricing_packages (name, description, starting_price, features) VALUES
  ('Cozinha Compacta', 'Solução completa para apartamentos', 18000, ARRAY['Armários aéreos e balcão', 'MDF Premium com acabamento', 'Puxadores de qualidade', 'Projeto 3D incluído']),
  ('Cozinha Premium', 'Planejada de alto padrão', 35000, ARRAY['Ilha central com cooktop', 'Adega climatizada embutida', 'Iluminação LED integrada', 'Ferragens Blum ou similares']),
  ('Home Office', 'Escritório funcional e elegante', 12000, ARRAY['Mesa suspensa ou com gavetas', 'Estante modular', 'Painel para TV/monitor', 'Cabeamento organizado']),
  ('Sala de Estar Ripada', 'Painel ripado com LED quente', 8500, ARRAY['Painel ripado 3 metros', 'LED 2700K embutido', 'Prateleiras flutuantes', 'Acabamento premium']),
  ('Quarto de Casal', 'Guarda-roupa e cabeceira planejados', 22000, ARRAY['Guarda-roupa 6 portas', 'Cabeceira estofada embutida', 'Criado-mudo suspenso', 'Iluminação indireta']),
  ('Área Gourmet', 'Churrasqueira e bancada', 28000, ARRAY['Bancada em granito ou quartzo', 'Armários resistentes a umidade', 'Churrasqueira de alvenaria', 'Projeto completo']);

-- Seeds: Posts do blog
INSERT INTO blog_posts (title, slug, excerpt, body_md, cover_url, published) VALUES
  ('Como escolher o acabamento MDF perfeito', 'escolher-acabamento-mdf', 'Entenda as diferenças entre laminado, laqueado e UV', '# Escolhendo seu MDF\n\nO acabamento faz toda a diferença...', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', true),
  ('Tendências 2025: Ripado com LED', 'tendencias-2025-ripado-led', 'O painel ripado continua em alta e ganha iluminação quente', '# Ripado em 2025\n\nO MDF ripado revolucionou...', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', true),
  ('Manutenção de móveis planejados', 'manutencao-moveis-planejados', 'Dicas práticas para conservar seus móveis por anos', '# Cuidados essenciais\n\nMóveis planejados duram décadas...', 'https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=800', true);

-- Seeds: Galeria de mídia (ripados com LED)
INSERT INTO media_gallery (title, url, tags, width, height, dominant_hex) VALUES
  ('Painel Ripado Sala LED Quente', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', ARRAY['ripado', 'led', 'sala'], 1200, 800, '#8A5A3B'),
  ('Cozinha Freijó com Ilha', 'https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=1200', ARRAY['cozinha', 'freijo', 'moderna'], 1200, 800, '#C4956F'),
  ('Home Office Ripado Preto', 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=1200', ARRAY['escritorio', 'ripado', 'preto'], 1200, 800, '#1F2937'),
  ('Quarto Casal Cabeceira LED', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', ARRAY['quarto', 'led', 'cabeceira'], 1200, 800, '#6B4423'),
  ('Área Gourmet Ripado Vertical', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200', ARRAY['gourmet', 'ripado', 'vertical'], 1200, 800, '#8A5A3B'),
  ('Sala TV Painel Noce', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', ARRAY['sala', 'noce', 'tv'], 1200, 800, '#5C4033'),
  ('Cozinha Branca Lacca', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', ARRAY['cozinha', 'branca', 'lacca'], 1200, 800, '#F5F1E6'),
  ('Escritório Carvalho Aserrado', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', ARRAY['escritorio', 'carvalho'], 1200, 800, '#8B6F47'),
  ('Ripado LED Dourado Sala', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', ARRAY['ripado', 'led', 'dourado'], 1200, 800, '#C6A15B'),
  ('Closet Planejado Premium', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', ARRAY['closet', 'premium'], 1200, 800, '#8A5A3B'),
  ('Cozinha Gourmet Completa', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', ARRAY['cozinha', 'gourmet', 'completa'], 1200, 800, '#6B4423'),
  ('Painel Ripado LED RGB', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', ARRAY['ripado', 'led', 'rgb'], 1200, 800, '#C6A15B');

-- Seeds: Depoimentos aprovados
INSERT INTO testimonials (author, city, rating, text, approved) VALUES
  ('Maria Silva', 'São Paulo', 5, 'Trabalho impecável! O painel ripado com LED transformou nossa sala. A equipe é muito profissional e cumpriu todos os prazos.', true),
  ('João Oliveira', 'Campinas', 5, 'Móveis de altíssima qualidade. O acabamento MDF é perfeito e a iluminação ficou exatamente como queríamos. Super recomendo!', true),
  ('Ana Costa', 'São José dos Campos', 5, 'Projeto 3D muito realista, entrega no prazo e pós-venda excelente. Nosso home office ficou incrível com o ripado preto.', true),
  ('Carlos Mendes', 'Santos', 5, 'Cozinha planejada dos sonhos! Ferragens de primeira linha e acabamento premium. Valeu cada centavo investido.', true);

-- Seeds: Projetos publicados
INSERT INTO projects (title, slug, environment, description, size_m2, status, hero_image, gallery) VALUES
  ('Sala Premium Ripado LED', 'sala-premium-ripado-led', 'sala', 'Painel ripado 3m com LED 2700K e prateleiras flutuantes em Noce Cannes', 25, 'publicado', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800']),
  ('Cozinha Gourmet Freijó', 'cozinha-gourmet-freijo', 'cozinha', 'Cozinha planejada com ilha central, armários em Freijó Naturale e iluminação LED embutida', 18, 'publicado', 'https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=1200', ARRAY['https://images.unsplash.com/photo-1565183928294-7d9b5d0ce8a3?w=800', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800']),
  ('Home Office Ripado Preto', 'home-office-ripado-preto', 'escritorio', 'Escritório corporativo com painel ripado preto texturizado e LED RGB programável', 12, 'publicado', 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=1200', ARRAY['https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=800']);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('gallery', 'gallery', true),
  ('proposals', 'proposals', false);

-- Storage policies para gallery (público)
CREATE POLICY "Public can view gallery"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload to gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update gallery"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete from gallery"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND is_admin(auth.uid()));

-- Storage policies para proposals (apenas admin)
CREATE POLICY "Admins can manage proposals"
  ON storage.objects FOR ALL
  USING (bucket_id = 'proposals' AND is_admin(auth.uid()));