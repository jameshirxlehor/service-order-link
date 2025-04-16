
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole, CityHall, Workshop, Admin } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await getUserProfile(session);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await getUserProfile(session);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch detailed user profile based on auth session
  const getUserProfile = async (session: Session) => {
    const { user: authUser } = session;
    
    if (!authUser) return;
    
    try {
      setIsLoading(true);
      
      // First get the user_profiles record to determine role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') { // Not found is OK
        throw profileError;
      }
      
      // If no profile exists, create a default one
      if (!profileData) {
        // Create a default user profile
        const defaultProfile = {
          auth_id: authUser.id,
          login: authUser.email?.split('@')[0] || 'user',
          role: UserRole.QUERY_ADMIN, // Default role
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
          // Create default admin user with query admin role
          const userData: Admin = {
            id: newProfile.id,
            login: newProfile.login,
            role: UserRole.QUERY_ADMIN,
            email: authUser.email || '',
            phone: newProfile.phone || '',
            createdAt: new Date(newProfile.created_at),
            updatedAt: new Date(newProfile.updated_at),
            name: newProfile.name || 'User'
          };
          
          setUser(userData);
          setIsLoading(false);
          
          toast({
            title: "Perfil criado",
            description: "Um perfil padrão foi criado para você.",
          });
          
          return;
        }
      }
      
      let userData: User | null = null;
      
      // Based on role, fetch the appropriate table
      if (profileData?.role === UserRole.CITY_HALL) {
        const { data: cityHallData, error: cityHallError } = await supabase
          .from('city_halls')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();
          
        if (cityHallError) throw cityHallError;
        
        if (cityHallData) {
          userData = {
            id: profileData.id,
            login: profileData.login,
            role: UserRole.CITY_HALL,
            email: authUser.email || '',
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
          userData = {
            id: profileData.id,
            login: profileData.login,
            role: UserRole.WORKSHOP,
            email: authUser.email || '',
            phone: profileData.phone,
            createdAt: new Date(profileData.created_at),
            updatedAt: new Date(profileData.updated_at),
            ...workshopData
          } as Workshop;
        }
      } else {
        // For admin roles, we just use the profile data
        userData = {
          id: profileData.id,
          login: profileData.login,
          role: profileData.role,
          email: authUser.email || '',
          phone: profileData.phone,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
          name: profileData.name
        } as Admin;
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed:", error);
      
      toast({
        title: "Falha no login",
        description: error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar sua sessão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
