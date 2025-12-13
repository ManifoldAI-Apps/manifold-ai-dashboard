import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to placeholder values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Only warn in development if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co' && import.meta.env.DEV) {
    console.warn('⚠️ Using placeholder Supabase credentials. The app will work with mock data only.');
    console.warn('To enable Supabase features, create a .env file with your Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
