-- Migração para Sistema Task Master
-- JP Marcenaria Digital - Gerenciamento de Projetos e Tarefas

-- Enum types
CREATE TYPE project_status AS ENUM ('draft', 'quoted', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_type AS ENUM ('custom_furniture', 'kitchen', 'closet', 'office', 'renovation', 'repair', 'other');
CREATE TYPE resource_type AS ENUM ('material', 'tool', 'equipment', 'labor');

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    cpf_cnpj VARCHAR(20),
    notes TEXT,
    preferred_contact VARCHAR(20) DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'whatsapp', 'email')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    quote_request_id UUID REFERENCES quote_requests(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_type project_type NOT NULL,
    status project_status DEFAULT 'draft',
    priority task_priority DEFAULT 'medium',
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    quoted_price DECIMAL(12,2),
    final_price DECIMAL(12,2),
    profit_margin DECIMAL(5,2),
    start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    delivery_date DATE,
    location TEXT,
    requirements TEXT,
    materials_list JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2) DEFAULT 0,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    dependencies JSONB DEFAULT '[]', -- Array de task IDs que devem ser completadas primeiro
    tags JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de recursos (materiais, ferramentas, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type resource_type NOT NULL,
    unit VARCHAR(20), -- m², kg, unidade, hora, etc.
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(200),
    supplier_contact TEXT,
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    min_stock_level DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de recursos utilizados em projetos
CREATE TABLE IF NOT EXISTS project_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id),
    quantity_planned DECIMAL(10,2) NOT NULL,
    quantity_used DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity_used * unit_cost) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de time tracking
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (end_time - start_time))/60
            ELSE NULL 
        END
    ) STORED,
    hourly_rate DECIMAL(8,2),
    cost DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN end_time IS NOT NULL AND hourly_rate IS NOT NULL THEN 
                (EXTRACT(EPOCH FROM (end_time - start_time))/3600) * hourly_rate
            ELSE NULL 
        END
    ) STORED,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de comentários/atualizações
CREATE TABLE IF NOT EXISTS project_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    update_type VARCHAR(50) NOT NULL, -- 'comment', 'status_change', 'file_upload', 'milestone', etc.
    title VARCHAR(200),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de templates de projeto
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_type project_type NOT NULL,
    estimated_hours DECIMAL(8,2),
    estimated_cost DECIMAL(12,2),
    template_data JSONB NOT NULL, -- Estrutura de tarefas, recursos, etc.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_completion_date ON projects(estimated_completion_date);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_stock ON resources(stock_quantity);

CREATE INDEX IF NOT EXISTS idx_project_resources_project_id ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_task_id ON project_resources(task_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_resource_id ON project_resources(resource_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_task_id ON project_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_user_id ON project_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_type ON project_updates(update_type);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_projects_status_assigned ON projects(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, DATE(start_time));

-- RLS (Row Level Security) policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para authenticated users
CREATE POLICY "Allow authenticated all on clients" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on tasks" ON tasks
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on resources" ON resources
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on project_resources" ON project_resources
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on time_entries" ON time_entries
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on project_updates" ON project_updates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all on project_templates" ON project_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_resources_updated_at 
    BEFORE UPDATE ON project_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at 
    BEFORE UPDATE ON project_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar progresso do projeto baseado nas tarefas
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects 
    SET 
        progress_percentage = (
            SELECT COALESCE(AVG(progress_percentage), 0)
            FROM tasks 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        actual_hours = (
            SELECT COALESCE(SUM(actual_hours), 0)
            FROM tasks 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso do projeto quando tarefas mudam
CREATE TRIGGER update_project_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- Função para verificar dependências de tarefas
CREATE OR REPLACE FUNCTION check_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    dependency_id UUID;
    dependency_status task_status;
BEGIN
    -- Verificar se todas as dependências estão completas quando marcar como in_progress
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        FOR dependency_id IN 
            SELECT jsonb_array_elements_text(NEW.dependencies)::UUID
        LOOP
            SELECT status INTO dependency_status 
            FROM tasks 
            WHERE id = dependency_id;
            
            IF dependency_status != 'completed' THEN
                RAISE EXCEPTION 'Cannot start task: dependency % is not completed', dependency_id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar dependências
CREATE TRIGGER check_task_dependencies_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION check_task_dependencies();

-- Função para atualizar custos do projeto
CREATE OR REPLACE FUNCTION update_project_costs()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects 
    SET 
        actual_cost = (
            SELECT COALESCE(SUM(total_cost), 0)
            FROM project_resources 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ) + (
            SELECT COALESCE(SUM(cost), 0)
            FROM time_entries 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
            AND end_time IS NOT NULL
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar custos
CREATE TRIGGER update_project_costs_from_resources
    AFTER INSERT OR UPDATE OR DELETE ON project_resources
    FOR EACH ROW EXECUTE FUNCTION update_project_costs();

CREATE TRIGGER update_project_costs_from_time
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_project_costs();

-- Views para relatórios
CREATE OR REPLACE VIEW project_dashboard AS
SELECT 
    p.id,
    p.name,
    p.project_type,
    p.status,
    p.priority,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    p.progress_percentage,
    p.estimated_cost,
    p.actual_cost,
    p.quoted_price,
    p.final_price,
    p.start_date,
    p.estimated_completion_date,
    p.actual_completion_date,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'in_progress') as active_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND due_date < CURRENT_DATE AND status != 'completed') as overdue_tasks,
    u.email as assigned_to_email,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN auth.users u ON p.assigned_to = u.id;

CREATE OR REPLACE VIEW task_dashboard AS
SELECT 
    t.id,
    t.name,
    t.description,
    t.status,
    t.priority,
    t.progress_percentage,
    t.estimated_hours,
    t.actual_hours,
    t.start_date,
    t.due_date,
    t.completed_date,
    p.name as project_name,
    p.status as project_status,
    c.name as client_name,
    u.email as assigned_to_email,
    CASE 
        WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN true
        ELSE false
    END as is_overdue,
    CASE 
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status != 'completed' THEN true
        ELSE false
    END as is_due_soon,
    t.created_at,
    t.updated_at
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN auth.users u ON t.assigned_to = u.id;

CREATE OR REPLACE VIEW resource_usage_summary AS
SELECT 
    r.id,
    r.name,
    r.type,
    r.unit,
    r.cost_per_unit,
    r.stock_quantity,
    r.min_stock_level,
    COALESCE(SUM(pr.quantity_used), 0) as total_used,
    COALESCE(SUM(pr.total_cost), 0) as total_cost,
    COUNT(DISTINCT pr.project_id) as projects_used_in,
    CASE 
        WHEN r.stock_quantity <= r.min_stock_level THEN true
        ELSE false
    END as needs_restock
FROM resources r
LEFT JOIN project_resources pr ON r.id = pr.resource_id
WHERE r.is_active = true
GROUP BY r.id, r.name, r.type, r.unit, r.cost_per_unit, r.stock_quantity, r.min_stock_level;

CREATE OR REPLACE VIEW time_tracking_summary AS
SELECT 
    te.user_id,
    u.email as user_email,
    p.id as project_id,
    p.name as project_name,
    c.name as client_name,
    DATE(te.start_time) as work_date,
    SUM(te.duration_minutes) as total_minutes,
    ROUND(SUM(te.duration_minutes)::DECIMAL / 60, 2) as total_hours,
    SUM(te.cost) as total_cost,
    COUNT(*) as entry_count
FROM time_entries te
LEFT JOIN auth.users u ON te.user_id = u.id
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN clients c ON p.client_id = c.id
WHERE te.end_time IS NOT NULL
GROUP BY te.user_id, u.email, p.id, p.name, c.name, DATE(te.start_time);

-- Inserir dados iniciais
INSERT INTO project_templates (name, description, project_type, estimated_hours, estimated_cost, template_data) VALUES
('Cozinha Planejada Básica', 'Template para cozinha planejada com armários superiores e inferiores', 'kitchen', 80, 15000, 
 '{"tasks": [
    {"name": "Medição e projeto", "estimated_hours": 4, "order": 1},
    {"name": "Corte das peças", "estimated_hours": 16, "order": 2},
    {"name": "Montagem dos armários", "estimated_hours": 24, "order": 3},
    {"name": "Instalação das dobradiças", "estimated_hours": 8, "order": 4},
    {"name": "Instalação no local", "estimated_hours": 16, "order": 5},
    {"name": "Acabamentos finais", "estimated_hours": 8, "order": 6},
    {"name": "Limpeza e entrega", "estimated_hours": 4, "order": 7}
  ],
  "materials": [
    {"name": "MDF 15mm", "quantity": 20, "unit": "m²"},
    {"name": "Dobradiças", "quantity": 30, "unit": "unidade"},
    {"name": "Puxadores", "quantity": 15, "unit": "unidade"},
    {"name": "Corrediças", "quantity": 10, "unit": "par"}
  ]}'),
  
('Guarda-roupa Casal', 'Template para guarda-roupa de casal com 6 portas', 'closet', 60, 8000,
 '{"tasks": [
    {"name": "Medição e projeto", "estimated_hours": 3, "order": 1},
    {"name": "Corte das peças", "estimated_hours": 12, "order": 2},
    {"name": "Montagem da estrutura", "estimated_hours": 16, "order": 3},
    {"name": "Instalação das portas", "estimated_hours": 8, "order": 4},
    {"name": "Instalação dos acessórios", "estimated_hours": 6, "order": 5},
    {"name": "Montagem no local", "estimated_hours": 12, "order": 6},
    {"name": "Acabamentos e entrega", "estimated_hours": 3, "order": 7}
  ],
  "materials": [
    {"name": "MDF 15mm", "quantity": 15, "unit": "m²"},
    {"name": "MDF 6mm (fundo)", "quantity": 8, "unit": "m²"},
    {"name": "Dobradiças", "quantity": 12, "unit": "unidade"},
    {"name": "Puxadores", "quantity": 6, "unit": "unidade"},
    {"name": "Cabideiro", "quantity": 2, "unit": "unidade"}
  ]}');

-- Inserir recursos básicos
INSERT INTO resources (name, description, type, unit, cost_per_unit, supplier, min_stock_level) VALUES
('MDF 15mm', 'Chapa de MDF 15mm - 2,75x1,83m', 'material', 'm²', 45.00, 'Madeireira Central', 50),
('MDF 6mm', 'Chapa de MDF 6mm - 2,75x1,83m', 'material', 'm²', 28.00, 'Madeireira Central', 30),
('Dobradiça 35mm', 'Dobradiça para porta de armário', 'material', 'unidade', 8.50, 'Ferragens Silva', 100),
('Puxador Inox', 'Puxador em aço inox 128mm', 'material', 'unidade', 12.00, 'Ferragens Silva', 50),
('Corrediça Telescópica', 'Corrediça telescópica 45cm', 'material', 'par', 25.00, 'Ferragens Silva', 20),
('Furadeira', 'Furadeira de impacto profissional', 'tool', 'unidade', 0, 'Próprio', 1),
('Serra Circular', 'Serra circular de bancada', 'tool', 'unidade', 0, 'Próprio', 1),
('Tupia', 'Tupia para acabamentos', 'tool', 'unidade', 0, 'Próprio', 1),
('Mão de obra especializada', 'Hora de trabalho de marceneiro', 'labor', 'hora', 35.00, 'Interno', 0);

RAISE NOTICE 'Sistema Task Master criado com sucesso!';