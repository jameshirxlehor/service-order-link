
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These are your public Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL'; // e.g., 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if the Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
