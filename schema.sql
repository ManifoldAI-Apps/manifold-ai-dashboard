-- ============================================================================
-- MANIFOLD AI - Complete Database Schema
-- ============================================================================
-- This schema supports all dashboard features including:
-- - User Management & Team
-- - CRM (Clients)
-- - Project Management
-- - Goals & OKRs
-- - Task Management (Kanban)
-- - Financial Tracking
-- - SaaS Subscriptions
-- - Meetings
-- - Audit Logs
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password encryption

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member', 'viewer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'on_leave');

CREATE TYPE client_status AS ENUM (
    'lead_frio',        -- Cold Lead
    'qualificacao',     -- Qualification
    'proposta',         -- Proposal
    'ativo',            -- Active
    'churn'             -- Churned
);

CREATE TYPE project_status AS ENUM (
    'planejamento',     -- Planning
    'em_andamento',     -- In Progress
    'pausado',          -- Paused
    'concluido',        -- Completed
    'cancelado'         -- Cancelled
);

CREATE TYPE project_priority AS ENUM ('baixa', 'media', 'alta');

CREATE TYPE task_status AS ENUM (
    'backlog',
    'todo',             -- To Do
    'wip',              -- Work in Progress
    'review',           -- In Review
    'done'              -- Done
);

CREATE TYPE task_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_status AS ENUM ('paid', 'pending', 'scheduled', 'cancelled');

CREATE TYPE goal_health AS ENUM ('on-track', 'at-risk', 'off-track');
CREATE TYPE goal_category AS ENUM ('financeiro', 'operacional', 'marketing', 'produto', 'pessoas');
CREATE TYPE metric_type AS ENUM ('currency', 'percentage', 'number');

CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted');
CREATE TYPE audit_target_type AS ENUM ('project', 'client', 'goal', 'task', 'team', 'subscription', 'meeting', 'transaction');

CREATE TYPE subscription_frequency AS ENUM ('monthly', 'quarterly', 'annual', 'lifetime');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'member',
    status user_status DEFAULT 'active',
    
    -- Team Information
    department TEXT,                    -- Tech, Vendas, CS, Admin, Marketing
    position TEXT,                      -- PM, Dev Lead, Designer, etc.
    skills TEXT[],                      -- Array of skills
    hourly_rate DECIMAL(10, 2),        -- For cost tracking
    start_date DATE,
    projects_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clients (CRM)
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Company Information
    name TEXT NOT NULL,
    razao_social TEXT,                  -- Legal name
    cnpj TEXT,                          -- Brazilian tax ID
    sector TEXT,                        -- Industry sector
    website TEXT,
    linkedin_url TEXT,
    
    -- Decision Maker
    decisor_name TEXT,
    decisor_cargo TEXT,                 -- Position
    decisor_email TEXT,
    decisor_phone TEXT,
    
    -- Business Intelligence
    dor_principal TEXT,                 -- Main pain point
    origem TEXT,                        -- Lead source
    status client_status DEFAULT 'lead_frio',
    mrr DECIMAL(10, 2) DEFAULT 0.00,   -- Monthly Recurring Revenue
    
    -- Ownership
    owner_id UUID REFERENCES profiles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Projects
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Relationships
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Status & Priority
    status project_status DEFAULT 'planejamento',
    priority project_priority DEFAULT 'media',
    
    -- Timeline
    start_date DATE,
    deadline DATE,
    
    -- Progress
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Budget
    budget DECIMAL(12, 2),
    
    -- Team Assignment
    team_lead_id UUID REFERENCES profiles(id),
    team_member_ids UUID[],             -- Array of team member IDs
    
    -- Links
    project_link TEXT,                  -- Repository, Drive, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Goals / OKRs
CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Classification
    category goal_category NOT NULL,
    cycle TEXT NOT NULL,                -- Q1 2025, Q2 2025, Annual 2025, etc.
    
    -- Metrics
    metric_type metric_type NOT NULL,
    initial_value DECIMAL(15, 2) NOT NULL,
    target_value DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Health & Ownership
    health goal_health DEFAULT 'on-track',
    owner_id UUID REFERENCES profiles(id),
    department TEXT,
    update_frequency TEXT,              -- Semanal, Mensal, Trimestral
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tasks (Kanban)
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES profiles(id),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Status & Priority
    status task_status DEFAULT 'backlog',
    priority task_priority DEFAULT 'normal',
    
    -- Timeline
    due_date DATE,
    estimate_hours DECIMAL(5, 2),       -- Time estimate
    
    -- Tags & Subtasks
    tags TEXT[],
    subtasks JSONB DEFAULT '[]'::jsonb, -- [{title: string, completed: boolean}]
    subtasks_completed INTEGER DEFAULT 0,
    subtasks_total INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Financial Transactions
CREATE TABLE financial_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    
    -- Classification
    category TEXT,                      -- Vendas, Pessoal, Infraestrutura, Impostos, etc.
    
    -- Date
    transaction_date DATE DEFAULT CURRENT_DATE,
    
    -- Relationships
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SaaS Subscriptions
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name TEXT NOT NULL,
    
    -- Cost
    cost DECIMAL(10, 2) NOT NULL,
    frequency subscription_frequency NOT NULL,
    renewal_date DATE,
    
    -- Credentials (ENCRYPTED)
    login_email TEXT,
    login_password TEXT,                -- Store encrypted with pgcrypto
    login_url TEXT,
    
    -- Notifications
    reminder_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Meetings
CREATE TABLE meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Schedule
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,                      -- Physical or virtual (Zoom link, etc.)
    
    -- Participants
    organizer_id UUID REFERENCES profiles(id),
    participant_ids UUID[],             -- Array of profile IDs
    
    -- Relationships
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Meeting Notes
    agenda TEXT,
    notes TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Actor
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_avatar TEXT,
    
    -- Action
    action audit_action NOT NULL,
    target_type audit_target_type NOT NULL,
    target_id UUID NOT NULL,
    target_name TEXT NOT NULL,
    
    -- Details (JSON snapshot of changes)
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Clients
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_owner ON clients(owner_id);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Projects
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_team_lead ON projects(team_lead_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);

-- Goals
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_cycle ON goals(cycle);
CREATE INDEX idx_goals_owner ON goals(owner_id);
CREATE INDEX idx_goals_health ON goals(health);

-- Tasks
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Financial Transactions
CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_client ON financial_transactions(client_id);
CREATE INDEX idx_transactions_project ON financial_transactions(project_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_renewal ON subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_frequency ON subscriptions(frequency);

-- Meetings
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meetings_client ON meetings(client_id);
CREATE INDEX idx_meetings_project ON meetings(project_id);

-- Audit Logs
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_target_type ON audit_logs(target_type);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Uncomment and customize based on your security requirements

-- Enable RLS on all tables
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example: Admin can see everything
-- CREATE POLICY "Admins can view all profiles" ON profiles
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE id = auth.uid() AND role = 'admin'
--         )
--     );

-- Example: Users can view their own profile
-- CREATE POLICY "Users can view own profile" ON profiles
--     FOR SELECT
--     USING (auth.uid() = id);

-- Example: Audit logs are read-only for admins
-- CREATE POLICY "Admins can view audit logs" ON audit_logs
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE id = auth.uid() AND role = 'admin'
--         )
--     );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Active Projects with Client Info
CREATE OR REPLACE VIEW active_projects_with_clients AS
SELECT 
    p.*,
    c.name as client_name,
    c.status as client_status,
    prof.full_name as team_lead_name
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN profiles prof ON p.team_lead_id = prof.id
WHERE p.status IN ('planejamento', 'em_andamento');

-- View: Monthly Financial Summary
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_cashflow
FROM financial_transactions
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- View: Team Workload
CREATE OR REPLACE VIEW team_workload AS
SELECT 
    p.id,
    p.full_name,
    p.department,
    COUNT(DISTINCT t.id) as active_tasks,
    COUNT(DISTINCT proj.id) as active_projects
FROM profiles p
LEFT JOIN tasks t ON t.assigned_to = p.id AND t.status IN ('todo', 'wip', 'review')
LEFT JOIN projects proj ON p.id = ANY(proj.team_member_ids) AND proj.status = 'em_andamento'
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.department;

-- ============================================================================
-- SAMPLE DATA (Optional - for development)
-- ============================================================================

-- Uncomment to insert sample data for testing
-- INSERT INTO profiles (id, email, full_name, role, department, position) VALUES
--     (uuid_generate_v4(), 'admin@manifold.ai', 'Admin User', 'admin', 'Tech', 'CTO');
