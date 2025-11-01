-- Migração para tabelas de Logging e Métricas
-- JP Marcenaria Digital

-- Tabela para logs da aplicação
CREATE TABLE IF NOT EXISTS application_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    context JSONB DEFAULT '{}',
    stack TEXT,
    user_agent TEXT,
    url TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    environment VARCHAR(20) DEFAULT 'production',
    client_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para métricas customizadas
CREATE TABLE IF NOT EXISTS metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para incidents/alertas
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    source VARCHAR(50) NOT NULL,
    environment VARCHAR(20) DEFAULT 'production',
    affected_services TEXT[] DEFAULT '{}',
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para health checks
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'degraded')),
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(20),
    page_url TEXT,
    user_agent TEXT,
    device_type VARCHAR(20),
    connection_type VARCHAR(20),
    session_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON application_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_application_logs_environment ON application_logs(environment);
CREATE INDEX IF NOT EXISTS idx_application_logs_session_id ON application_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_user_id ON application_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON application_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_environment ON incidents(environment);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON health_checks(status);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp ON application_logs(level, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_environment_level ON application_logs(environment, level);
CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_type_timestamp ON performance_metrics(metric_type, timestamp DESC);

-- RLS (Row Level Security) policies
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para application_logs
CREATE POLICY "Allow public insert on application_logs" ON application_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on application_logs" ON application_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para metrics
CREATE POLICY "Allow public insert on metrics" ON metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on metrics" ON metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para incidents
CREATE POLICY "Allow authenticated all on incidents" ON incidents
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para health_checks
CREATE POLICY "Allow public insert on health_checks" ON health_checks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on health_checks" ON health_checks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para performance_metrics
CREATE POLICY "Allow public insert on performance_metrics" ON performance_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on performance_metrics" ON performance_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at em incidents
CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views para relatórios e dashboards
CREATE OR REPLACE VIEW log_summary AS
SELECT 
    DATE(created_at) as date,
    level,
    environment,
    COUNT(*) as log_count
FROM application_logs 
GROUP BY DATE(created_at), level, environment
ORDER BY date DESC, log_count DESC;

CREATE OR REPLACE VIEW error_trends AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    level,
    COUNT(*) as error_count,
    COUNT(DISTINCT session_id) as affected_sessions
FROM application_logs 
WHERE level IN ('error', 'critical')
GROUP BY DATE_TRUNC('hour', created_at), level
ORDER BY hour DESC;

CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    DATE(timestamp) as date,
    metric_type,
    metric_name,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
    COUNT(*) as sample_count
FROM performance_metrics 
GROUP BY DATE(timestamp), metric_type, metric_name
ORDER BY date DESC, metric_type, metric_name;

CREATE OR REPLACE VIEW incident_summary AS
SELECT 
    DATE(created_at) as date,
    severity,
    status,
    COUNT(*) as incident_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/3600) as avg_resolution_hours
FROM incidents 
GROUP BY DATE(created_at), severity, status
ORDER BY date DESC, severity;

CREATE OR REPLACE VIEW service_health_status AS
SELECT 
    service_name,
    endpoint,
    status,
    AVG(response_time_ms) as avg_response_time,
    COUNT(*) as check_count,
    MAX(checked_at) as last_check,
    (COUNT(*) FILTER (WHERE status = 'healthy')::FLOAT / COUNT(*) * 100) as uptime_percentage
FROM health_checks 
WHERE checked_at > NOW() - INTERVAL '24 hours'
GROUP BY service_name, endpoint, status
ORDER BY service_name, endpoint;

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Deletar logs debug/info mais antigos que 30 dias
    DELETE FROM application_logs 
    WHERE level IN ('debug', 'info') 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Deletar logs warn/error/critical mais antigos que 90 dias
    DELETE FROM application_logs 
    WHERE level IN ('warn', 'error', 'critical') 
    AND created_at < NOW() - INTERVAL '90 days';
    
    -- Deletar métricas mais antigas que 60 dias
    DELETE FROM metrics 
    WHERE created_at < NOW() - INTERVAL '60 days';
    
    -- Deletar health checks mais antigos que 7 dias
    DELETE FROM health_checks 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Deletar performance metrics mais antigas que 30 dias
    DELETE FROM performance_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Limpeza de logs antigos concluída';
END;
$$ LANGUAGE plpgsql;

-- Função para calcular métricas agregadas
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $$
BEGIN
    -- Inserir métricas diárias agregadas
    INSERT INTO metrics (metric_name, metric_value, labels, timestamp)
    SELECT 
        'daily_page_views',
        COUNT(*),
        jsonb_build_object('date', DATE(timestamp)),
        DATE_TRUNC('day', NOW())
    FROM analytics_events 
    WHERE event_name = 'page_view' 
    AND DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day'
    ON CONFLICT DO NOTHING;
    
    -- Inserir métricas de erro diárias
    INSERT INTO metrics (metric_name, metric_value, labels, timestamp)
    SELECT 
        'daily_errors',
        COUNT(*),
        jsonb_build_object('date', DATE(created_at), 'level', level),
        DATE_TRUNC('day', NOW())
    FROM application_logs 
    WHERE level IN ('error', 'critical')
    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY level
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Métricas diárias calculadas';
END;
$$ LANGUAGE plpgsql;