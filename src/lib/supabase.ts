
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { toast } from "@/hooks/use-toast";

// These are your public Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dybrlyssenhxbpnfhiwb.supabase.co'; // e.g., 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YnJseXNzZW5oeGJwbmZoaXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzA2NTgsImV4cCI6MjA2MDM0NjY1OH0.qeByyMkxftSK5P9JfDo5FFmq8Na4DgYlPTRxvWNcEuU'; // Your public anon key

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if the Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Using a simple query just to check connection
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Safe query function with error handling - fixed to handle Supabase query builders correctly
export const safeQuery = async (queryFn: () => any) => {
  try {
    // Execute the query function and await its result
    const result = await queryFn();
    
    // Check for Supabase-specific errors
    if (result.error) {
      console.error('Query error:', result.error);
      
      // Handle specific foreign key relationship errors
      if (result.error.code === 'PGRST200') {
        console.error('Foreign key relationship error:', result.error.details);
        toast({
          title: "Erro de consulta",
          description: "Possível erro de relação entre tabelas. Verifique o modelo de dados.",
          variant: "destructive"
        });
      }
      
      return { data: null, error: result.error };
    }
    
    // Return successful data
    return { data: result.data || [], error: null };
  } catch (error) {
    console.error('Query execution error:', error);
    return { data: null, error };
  }
};
