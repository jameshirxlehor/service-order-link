import { UserProfile, UserType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export const createDefaultProfile = async (authUser: SupabaseUser): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        auth_id: authUser.id,
        login: authUser.email || '',
        role: 'QUERY_ADMIN',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        phone: authUser.user_metadata?.phone || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return mapDatabaseUserToProfile(data);
  } catch (error) {
    console.error('Error creating default profile:', error);
    return null;
  }
};

export const fetchUserProfile = async (authUser: SupabaseUser) => {
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  return profileData;
};

export const fetchUserData = async (profileData: any): Promise<UserProfile | null> => {
  if (!profileData) return null;
  
  // Map the database user_profiles structure to our UserProfile interface
  return mapDatabaseUserToProfile(profileData);
};

// Helper function to map database user_profiles to UserProfile interface
const mapDatabaseUserToProfile = (dbUser: any): UserProfile => {
  return {
    id: dbUser.id,
    user_type: dbUser.role as UserType,
    login_number: dbUser.login,
    responsible_email: dbUser.login,
    contact_phone: dbUser.phone || '',
    trade_name: dbUser.name,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at
  } as UserProfile;
};
