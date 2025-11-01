-- Migração para tabelas de Analytics e Tracking
-- JP Marcenaria Digital

-- Tabela para eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    page_url TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    client_ip INET,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para conversões
CREATE TABLE IF NOT EXISTS conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    conversion_type VARCHAR(50) NOT NULL,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    first_page TEXT NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL,
    page_views INTEGER DEFAULT 1,
    total_time INTEGER DEFAULT 0, -- em segundos
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para solicitações de orçamento
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    budget_range VARCHAR(20),
    timeline VARCHAR(20),
    location VARCHAR(100),
    attachments TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'medium',
    estimated_value DECIMAL(10,2),
    assigned_to UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para contatos do formulário
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'new',
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_conversions_event_name ON conversions(event_name);
CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversions_timestamp ON conversions(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_quote_requests_quote_id ON quote_requests(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_priority ON quote_requests(priority);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events (apenas inserção pública, leitura para autenticados)
CREATE POLICY "Allow public insert on analytics_events" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on analytics_events" ON analytics_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para conversions (apenas inserção pública, leitura para autenticados)
CREATE POLICY "Allow public insert on conversions" ON conversions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on conversions" ON conversions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para user_sessions (apenas inserção pública, leitura para autenticados)
CREATE POLICY "Allow public insert on user_sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on user_sessions" ON user_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated read on user_sessions" ON user_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para quote_requests (inserção pública, leitura/atualização para autenticados)
CREATE POLICY "Allow public insert on quote_requests" ON quote_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on quote_requests" ON quote_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on quote_requests" ON quote_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para contacts (inserção pública, leitura/atualização para autenticados)
CREATE POLICY "Allow public insert on contacts" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on contacts" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_quote_requests_updated_at 
    BEFORE UPDATE ON quote_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views para relatórios
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events 
GROUP BY DATE(timestamp), event_name
ORDER BY date DESC, event_count DESC;

CREATE OR REPLACE VIEW conversion_funnel AS
SELECT 
    DATE(timestamp) as date,
    conversion_type,
    COUNT(*) as conversions,
    AVG(CASE 
        WHEN properties->>'estimated_value' IS NOT NULL 
        THEN (properties->>'estimated_value')::DECIMAL 
        ELSE NULL 
    END) as avg_value
FROM conversions 
GROUP BY DATE(timestamp), conversion_type
ORDER BY date DESC, conversions DESC;

CREATE OR REPLACE VIEW quote_requests_summary AS
SELECT 
    DATE(created_at) as date,
    project_type,
    status,
    priority,
    COUNT(*) as request_count,
    AVG(estimated_value) as avg_estimated_value,
    SUM(estimated_value) as total_estimated_value
FROM quote_requests 
GROUP BY DATE(created_at), project_type, status, priority
ORDER BY date DESC, request_count DESC;