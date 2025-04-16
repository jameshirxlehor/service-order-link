
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createDefaultProfile, fetchUserProfile, fetchUserData } from "@/services/userProfileService";
import { toast } from "@/hooks/use-toast";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  const auth = useSupabaseAuth();

  const getUserProfile = async (session: Session) => {
    const { user: authUser } = session;
    
    if (!authUser) return;
    
    try {
      setIsLoading(true);
      
      const profileData = await fetchUserProfile(authUser);
      
      if (!profileData) {
        const newUser = await createDefaultProfile(authUser);
        if (newUser) {
          setUser(newUser);
          toast({
            title: "Perfil criado",
            description: "Um perfil padrão foi criado para você.",
          });
        }
        return;
      }
      
      const userData = await fetchUserData(profileData);
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await auth.getSession();
        if (session) {
          await getUserProfile(session);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await getUserProfile(session);
        } else if (event === "SIGNED_OUT") {
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
    setIsLoading(true);
    
    try {
      const { error } = await auth.login(email, password);
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
      const { error } = await auth.logout();
      
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
