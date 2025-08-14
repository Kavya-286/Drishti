-- Drishti Startup Validation Platform
-- Database Schema Migration Script
-- 
-- This script creates the complete database schema for the platform
-- Run this script to set up the database structure

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user authentication and profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('entrepreneur', 'investor')),
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    auth_provider VARCHAR(20) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'linkedin')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entrepreneur profiles - Extended profile data for entrepreneurs
CREATE TABLE entrepreneur_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    experience_level VARCHAR(20) CHECK (experience_level IN ('first-time', '1-2-years', '3-5-years', '5-10-years', '10-plus', 'serial')),
    industry_interests TEXT,
    company_name VARCHAR(255),
    title VARCHAR(100),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    share_details BOOLEAN DEFAULT TRUE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    bio TEXT,
    skills TEXT[], -- PostgreSQL array for multiple skills
    availability VARCHAR(50) CHECK (availability IN ('business-hours', 'extended', 'flexible', 'scheduled')),
    preferred_contact VARCHAR(20) CHECK (preferred_contact IN ('email', 'phone', 'whatsapp', 'linkedin')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investor profiles - Extended profile data for investors
CREATE TABLE investor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    investor_type VARCHAR(20) CHECK (investor_type IN ('angel', 'vc', 'corporate', 'family-office', 'fund', 'individual')),
    fund_name VARCHAR(255),
    investment_stage_focus VARCHAR(20) CHECK (investment_stage_focus IN ('pre-seed', 'seed', 'series-a', 'series-b', 'growth', 'all-stages')),
    check_size_min DECIMAL(15,2),
    check_size_max DECIMAL(15,2),
    industry_focus JSONB, -- Store array of industries as JSON
    portfolio_size INTEGER DEFAULT 0,
    years_experience INTEGER,
    aum DECIMAL(15,2), -- Assets Under Management
    investment_thesis TEXT,
    geographic_focus TEXT[],
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Startups table - Core startup/idea information
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    problem_statement TEXT NOT NULL,
    solution_description TEXT NOT NULL,
    target_market TEXT NOT NULL,
    market_size VARCHAR(20) CHECK (market_size IN ('small', 'medium', 'large')),
    customer_segments TEXT,
    revenue_model VARCHAR(20) CHECK (revenue_model IN ('subscription', 'one-time', 'freemium', 'marketplace', 'advertising', 'other')),
    current_stage VARCHAR(20) CHECK (current_stage IN ('idea', 'mvp', 'beta', 'launched', 'growth')),
    industry VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    unique_value_proposition TEXT,
    competitive_advantage TEXT,
    business_model TEXT,
    go_to_market_strategy TEXT,
    team_size INTEGER DEFAULT 1,
    funding_raised DECIMAL(15,2) DEFAULT 0,
    funding_goal DECIMAL(15,2),
    website VARCHAR(255),
    demo_url VARCHAR(255),
    pitch_deck_url VARCHAR(255),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Validations table - AI validation results and analysis
CREATE TABLE validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    viability_level VARCHAR(20) CHECK (viability_level IN ('very-low', 'low', 'medium', 'high')),
    scores JSONB NOT NULL, -- Store category scores as JSON
    recommendations JSONB, -- Store recommendations as JSON
    analysis_data JSONB, -- Store detailed analysis data
    validation_version VARCHAR(10) DEFAULT '1.0', -- Track validation algorithm version
    processing_time_ms INTEGER, -- Track performance metrics
    input_data_hash VARCHAR(64), -- For detecting duplicate validations
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table - Investment interest and tracking
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    investment_type VARCHAR(20) CHECK (investment_type IN ('equity', 'debt', 'convertible', 'grant', 'safe')),
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'due-diligence', 'negotiating', 'committed', 'closed', 'rejected', 'withdrawn')),
    timeline VARCHAR(50),
    contact_preference VARCHAR(20) CHECK (contact_preference IN ('email', 'phone', 'video', 'linkedin')),
    investor_notes TEXT,
    due_diligence_items JSONB, -- Store checklist as JSON
    next_steps TEXT,
    equity_percentage DECIMAL(5,2), -- For equity investments
    valuation DECIMAL(15,2), -- Pre-money valuation
    terms_summary TEXT,
    expected_close_date DATE,
    priority_level VARCHAR(10) CHECK (priority_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique investment per investor per startup
    UNIQUE(startup_id, investor_id)
);

-- Notifications table - System notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    type VARCHAR(30) CHECK (type IN ('investment_interest', 'validation_complete', 'system', 'reminder', 'milestone')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Store additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist table - Investor's saved startups
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    notes TEXT,
    interest_level VARCHAR(10) CHECK (interest_level IN ('low', 'medium', 'high')),
    tags TEXT[], -- Custom tags for organization
    reminder_date DATE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique watchlist entry per investor per startup
    UNIQUE(investor_id, startup_id)
);

-- Founder readiness assessments table
CREATE TABLE founder_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    category_scores JSONB NOT NULL, -- Store individual category scores
    strengths TEXT[],
    improvement_areas TEXT[],
    recommendations TEXT[],
    assessment_data JSONB, -- Store raw assessment data
    assessment_version VARCHAR(10) DEFAULT '1.0',
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table - Track user sessions and analytics
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Activity log table - Track user actions for analytics
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30), -- e.g., 'startup', 'validation', 'investment'
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_startups_founder_id ON startups(founder_id);
CREATE INDEX idx_startups_industry ON startups(industry);
CREATE INDEX idx_startups_is_public ON startups(is_public);
CREATE INDEX idx_startups_current_stage ON startups(current_stage);
CREATE INDEX idx_startups_created_at ON startups(created_at);

CREATE INDEX idx_validations_startup_id ON validations(startup_id);
CREATE INDEX idx_validations_overall_score ON validations(overall_score);
CREATE INDEX idx_validations_validated_at ON validations(validated_at);

CREATE INDEX idx_investments_startup_id ON investments(startup_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_created_at ON investments(created_at);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_watchlist_investor_id ON watchlist(investor_id);
CREATE INDEX idx_watchlist_startup_id ON watchlist(startup_id);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrepreneur_profiles_updated_at BEFORE UPDATE ON entrepreneur_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON startups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW startup_details AS
SELECT 
    s.*,
    u.first_name || ' ' || u.last_name as founder_name,
    u.email as founder_email,
    ep.company_name as founder_company,
    ep.title as founder_title,
    v.overall_score as latest_validation_score,
    v.viability_level as latest_viability_level,
    COUNT(i.id) as investment_interest_count
FROM startups s
JOIN users u ON s.founder_id = u.id
LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id
LEFT JOIN validations v ON s.id = v.startup_id
LEFT JOIN investments i ON s.id = i.startup_id
WHERE s.is_public = true
GROUP BY s.id, u.first_name, u.last_name, u.email, ep.company_name, ep.title, v.overall_score, v.viability_level;

CREATE VIEW investor_dashboard AS
SELECT 
    u.id as investor_id,
    u.first_name || ' ' || u.last_name as investor_name,
    ip.investor_type,
    ip.fund_name,
    ip.check_size_min,
    ip.check_size_max,
    COUNT(DISTINCT i.startup_id) as investments_count,
    COUNT(DISTINCT w.startup_id) as watchlist_count
FROM users u
JOIN investor_profiles ip ON u.id = ip.user_id
LEFT JOIN investments i ON u.id = i.investor_id
LEFT JOIN watchlist w ON u.id = w.investor_id
WHERE u.user_type = 'investor'
GROUP BY u.id, u.first_name, u.last_name, ip.investor_type, ip.fund_name, ip.check_size_min, ip.check_size_max;

-- Insert sample data (optional - for testing)
/*
INSERT INTO users (email, password_hash, first_name, last_name, user_type, phone, location) VALUES
('john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeweLIp6eD8sQ/5u6', 'John', 'Doe', 'entrepreneur', '+1234567890', 'San Francisco, CA'),
('jane@investor.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeweLIp6eD8sQ/5u6', 'Jane', 'Smith', 'investor', '+1987654321', 'New York, NY');

INSERT INTO entrepreneur_profiles (user_id, experience_level, industry_interests, company_name, title) 
SELECT id, '3-5-years', 'Technology, AI', 'TechStartup Inc', 'CEO & Founder' FROM users WHERE email = 'john@example.com';

INSERT INTO investor_profiles (user_id, investor_type, fund_name, check_size_min, check_size_max) 
SELECT id, 'vc', 'Innovation Ventures', 100000, 5000000 FROM users WHERE email = 'jane@investor.com';
*/

-- Grant permissions (adjust as needed for your application user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

COMMIT;
