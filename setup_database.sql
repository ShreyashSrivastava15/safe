-- SQL to create the necessary tables for S.A.F.E.
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analysis_logs table
CREATE TABLE IF NOT EXISTS public.analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    url TEXT,
    transaction_json JSONB,
    scores_json JSONB,
    signals JSONB,
    final_score FLOAT8,
    risk_level TEXT,
    verdict TEXT,
    explanation TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all to read (or restrict as needed)
CREATE POLICY "Allow public read access" ON public.analysis_logs
    FOR SELECT USING (true);

-- Create policy to allow all to insert (or restrict as needed)
CREATE POLICY "Allow public insert access" ON public.analysis_logs
    FOR INSERT WITH CHECK (true);
