
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These are your public Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., 'https://example.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
