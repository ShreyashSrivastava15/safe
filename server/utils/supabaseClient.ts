import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Mock client for when credentials are missing
const mockSupabase = {
    from: (table: string) => ({
        select: () => ({
            order: () => ({
                limit: () => Promise.resolve({ data: [], error: null })
            })
        }),
        insert: (data: any) => Promise.resolve({ data: null, error: null }),
    }),
};

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing! Logging will be disabled.');
}

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : (mockSupabase as any);
