import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createDefaultProfile, fetchUserProfile, fetchUserData } from "@/services/userProfileService";
import { toast } from "@/hooks/use-toast";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useSupabaseAuth();

  const getUserProfile = async (session: Session) => {
    const { user: authUser } = session;
    
    if (!authUser) return null;
    
    try {
      console.log("Fetching user profile for:", authUser.email);
      const profileData = await fetchUserProfile(authUser);
      
      if (!profileData) {
        console.log("No profile found, creating default profile");
        const newUser = await createDefaultProfile(authUser);
        if (newUser) {
          console.log("Default profile created successfully");
          setUser(newUser);
          toast({
            title: "Perfil criado",
            description: "Um perfil padrão foi criado para você.",
          });
          return newUser;
        }
        return null;
      }
      
      console.log("Profile found, fetching full user data");
      const userData = await fetchUserData(profileData);
      console.log("User data fetched:", userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        console.log("Checking session status...");
        const { data: { session } } = await auth.getSession();
        
        if (session) {
          console.log("Session found, getting user profile");
          await getUserProfile(session);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        console.log("Setting isLoading to false after session check");
        setIsLoading(false);
      }
    };

    let isInitialized = false;

    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (!isInitialized) {
          isInitialized = true;
        }
        
        if (event === "SIGNED_IN" && session) {
          setIsLoading(true);
          console.log("User signed in, fetching profile");
          await getUserProfile(session);
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, clearing user state");
          setUser(null);
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      setIsLoading(true);
      
      const { error, data } = await auth.login(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Falha no login",
          description: error.message || "Verifique suas credenciais e tente novamente",
          variant: "destructive"
        });
        return { success: false };
      }
      
      console.log("Login API call successful:", data);
      
      if (data?.session) {
        console.log("Session available immediately, fetching profile");
        const userData = await getUserProfile(data.session);
        console.log("User profile set after login:", userData);
        return { success: true };
      }
      
      return { success: !!data?.session };
    } catch (error: any) {
      console.error("Login failed:", error);
      
      toast({
        title: "Falha no login",
        description: error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
      
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting to logout");
      const { error } = await auth.logout();
      
      if (error) throw error;
      
      console.log("Logout successful, clearing user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar sua sessão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Auth Provider - State updated:", { 
      isAuthenticated: !!user, 
      isLoading, 
      user: user ? `${user.email} (${user.role})` : null 
    });
  }, [user, isLoading]);

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
