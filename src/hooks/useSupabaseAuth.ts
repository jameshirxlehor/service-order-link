
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";

export const useSupabaseAuth = () => {
  const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const logout = async () => {
    return await supabase.auth.signOut();
  };

  const getSession = async () => {
    return await supabase.auth.getSession();
  };

  const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  };

  return {
    login,
    logout,
    getSession,
    onAuthStateChange
  };
};
