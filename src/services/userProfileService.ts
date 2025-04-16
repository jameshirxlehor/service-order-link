import { User, UserRole, CityHall, Workshop, Admin } from "@/types";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export const createDefaultProfile = async (authUser: SupabaseUser) => {
  const defaultProfile = {
    auth_id: authUser.id,
    login: authUser.email?.split('@')[0] || 'user',
    role: UserRole.QUERY_ADMIN,
    email: authUser.email,
    phone: '',
    name: authUser.email?.split('@')[0] || 'User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert(defaultProfile)
    .select()
    .single();

  if (insertError) throw insertError;
  
  if (newProfile) {
    return {
      id: newProfile.id,
      login: newProfile.login,
      role: UserRole.QUERY_ADMIN,
      email: authUser.email || '',
      phone: newProfile.phone || '',
      createdAt: new Date(newProfile.created_at),
      updatedAt: new Date(newProfile.updated_at),
      name: newProfile.name || 'User'
    } as Admin;
  }
  
  return null;
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

export const fetchUserData = async (profileData: any): Promise<User | null> => {
  if (profileData?.role === UserRole.CITY_HALL) {
    const { data: cityHallData, error: cityHallError } = await supabase
      .from('city_halls')
      .select('*')
      .eq('profile_id', profileData.id)
      .single();
      
    if (cityHallError) throw cityHallError;
    
    if (cityHallData) {
      return {
        id: profileData.id,
        login: profileData.login,
        role: UserRole.CITY_HALL,
        email: profileData.email || '',
        phone: profileData.phone,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
        ...cityHallData
      } as CityHall;
    }
  } else if (profileData?.role === UserRole.WORKSHOP) {
    const { data: workshopData, error: workshopError } = await supabase
      .from('workshops')
      .select('*')
      .eq('profile_id', profileData.id)
      .single();
      
    if (workshopError) throw workshopError;
    
    if (workshopData) {
      return {
        id: profileData.id,
        login: profileData.login,
        role: UserRole.WORKSHOP,
        email: profileData.email || '',
        phone: profileData.phone,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
        ...workshopData
      } as Workshop;
    }
  }
  
  return {
    id: profileData.id,
    login: profileData.login,
    role: profileData.role,
    email: profileData.email || '',
    phone: profileData.phone,
    createdAt: new Date(profileData.created_at),
    updatedAt: new Date(profileData.updated_at),
    name: profileData.name
  } as Admin;
};
