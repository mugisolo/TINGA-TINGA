-- ==========================================================
-- TINGA TINGA SAFARI & HOLIDAY - SUPABASE PRODUCTION SCHEMA
-- Location: Arusha, Tanzania (P.O. Box 2751)
-- Stack: Supabase PostgreSQL 15+ with RLS, UUIDs, & Indexes
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ITINERARIES TABLE
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  countries TEXT[] NOT NULL, -- e.g. ARRAY['Tanzania', 'Uganda']
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  starting_price_per_day_usd NUMERIC(10, 2) NOT NULL,
  featured BOOLEAN DEFAULT false,
  hero_image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  overview TEXT NOT NULL,
  wildlife_highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  best_months TEXT[] DEFAULT ARRAY[]::TEXT[],
  gorilla_permit_required BOOLEAN DEFAULT false,
  gorilla_permit_cost_usd NUMERIC(10, 2) DEFAULT 0,
  
  -- Route day-by-day structure (JSONB for rich flexible milestones)
  route_days JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Price bands (Mid-range, Luxury, Signature)
  price_bands JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Inclusions and Exclusions
  inclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Ground partner transparency metadata
  ground_partner_id TEXT,
  ground_partner_disclosed_name TEXT,
  ground_partner_license TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itineraries_countries ON itineraries USING GIN (countries);
CREATE INDEX IF NOT EXISTS idx_itineraries_featured ON itineraries (featured);

-- 2. LEADS TABLE (CRM Pipeline)
CREATE TYPE lead_status_type AS ENUM (
  'new',
  'qualified',
  'quote_sent',
  'deposit_paid',
  'closed_won',
  'closed_lost'
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status lead_status_type NOT NULL DEFAULT 'new',
  source TEXT NOT NULL, -- 'trip_planner', 'contact_page', 'web_chat', 'whatsapp'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  budget_band TEXT, -- 'Mid-Range', 'Luxury', 'Signature'
  travelers_count INTEGER DEFAULT 2,
  target_dates TEXT,
  notes TEXT,
  deposit_amount_usd NUMERIC(10, 2),
  assigned_to TEXT DEFAULT 'Akim Mmari'
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- 3. CHAT SESSIONS & TRANSCRIPTS
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL DEFAULT 'web_widget', -- 'web_widget' | 'whatsapp'
  language TEXT NOT NULL DEFAULT 'en',
  user_phone TEXT,
  user_name TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  handoff_requested BOOLEAN DEFAULT false,
  handoff_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions (channel);

-- 4. VERIFIED FIELD REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  country TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE SET NULL,
  itinerary_name TEXT NOT NULL,
  budget_tier TEXT NOT NULL,
  trip_month_year TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. STATUTORY PERMIT TARIFFS (UWA / RDB / TANAPA)
CREATE TABLE IF NOT EXISTS permit_tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country TEXT NOT NULL,
  park_name TEXT NOT NULL,
  permit_type TEXT NOT NULL,
  authority TEXT NOT NULL, -- 'UWA' | 'RDB' | 'TANAPA'
  cost_usd NUMERIC(10, 2) NOT NULL,
  minimum_age INTEGER NOT NULL DEFAULT 15,
  daily_limit INTEGER NOT NULL,
  cancellation_policy TEXT NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. GROUND PARTNERS (Transparency Directory)
CREATE TABLE IF NOT EXISTS ground_partners (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  accreditation_body TEXT NOT NULL,
  license_number TEXT NOT NULL,
  fleet_specs TEXT NOT NULL,
  guide_credentials TEXT NOT NULL,
  insurance_specs TEXT NOT NULL,
  headquarters TEXT NOT NULL,
  notes TEXT
);

-- 7. 30% DEPOSIT PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL, -- 'dpo' | 'stripe' | 'paypal'
  transaction_ref TEXT UNIQUE NOT NULL,
  amount_usd NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  payment_method TEXT,
  payer_email TEXT,
  payer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public can read published itineraries, verified reviews, ground partners, and permit tariffs
CREATE POLICY "Public Read Itineraries" ON itineraries FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (verified = true);
CREATE POLICY "Public Read Ground Partners" ON ground_partners FOR SELECT USING (true);
CREATE POLICY "Public Read Permit Tariffs" ON permit_tariffs FOR SELECT USING (true);

-- Authenticated Admin Staff (Akim) has full CRUD on all tables
CREATE POLICY "Admin All Access Itineraries" ON itineraries FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Leads" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Chat Sessions" ON chat_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Reviews" ON reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Access Payments" ON payments FOR ALL TO authenticated USING (true);

-- Public can insert new leads (from Trip Planner, Contact Form, or Chat)
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Chat Sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Own Chat Sessions" ON chat_sessions FOR UPDATE USING (true);
