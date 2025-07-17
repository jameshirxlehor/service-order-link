import { UserProfile, UserType } from "@/types";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export const createDefaultProfile = async (authUser: SupabaseUser): Promise<UserProfile | null> => {
  // For now, return a mock profile until the actual database tables are created
  return {
    id: authUser.id,
    user_type: UserType.QUERY_ADMIN,
    login_number: authUser.email?.split('@')[0] || 'user',
    responsible_email: authUser.email || '',
    contact_phone: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as UserProfile;
};

export const fetchUserProfile = async (authUser: SupabaseUser) => {
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authUser.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }

  return profileData;
};

export const fetchUserData = async (profileData: any): Promise<UserProfile | null> => {
  // For now, just return the profile data as UserProfile
  // In the future, we can join with city_halls/workshops tables if needed
  return profileData as UserProfile;
};
