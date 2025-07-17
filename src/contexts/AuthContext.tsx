
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "@/types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createDefaultProfile, fetchUserProfile, fetchUserData } from "@/services/userProfileService";
import { toast } from "@/hooks/use-toast";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const auth = useSupabaseAuth();

  const getUserProfile = async (session: Session) => {
    const { user: authUser } = session;
    
    if (!authUser) return null;
    
    try {
      console.log("AuthContext - Fetching user profile for:", authUser.email);
      const profileData = await fetchUserProfile(authUser);
      
      if (!profileData) {
        console.log("AuthContext - No profile found, creating default profile");
        const newUser = await createDefaultProfile(authUser);
        if (newUser) {
          console.log("AuthContext - Default profile created successfully");
          setUser(newUser);
          toast({
            title: "Perfil criado",
            description: "Um perfil padrão foi criado para você.",
          });
          return newUser;
        }
        return null;
      }
      
      console.log("AuthContext - Profile found, fetching full user data");
      const userData = await fetchUserData(profileData);
      console.log("AuthContext - User data fetched:", userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("AuthContext - Error fetching user profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive"
      });
      return null;
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        console.log("AuthContext - Initial session check...");
        const { data: { session } } = await auth.getSession();
        
        if (session) {
          console.log("AuthContext - Initial session found for:", session.user?.email);
          await getUserProfile(session);
        } else {
          console.log("AuthContext - No initial session found");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext - Error checking initial session:", error);
        setUser(null);
      } finally {
        console.log("AuthContext - Initial check complete, finishing initialization");
        setIsLoading(false);
        setInitialized(true);
        setSessionChecked(true);
      }
    };

    checkSession();

    // Add event listener for storage changes to handle auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token') {
        console.log("AuthContext - Auth storage changed, reloading page");
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Add beforeunload event to persist session data
    const handleBeforeUnload = () => {
      // This helps with session persistence across page reloads
      localStorage.setItem('lastAuthState', JSON.stringify({
        isAuthenticated: !!user,
        userId: user?.id,
        timestamp: new Date().getTime()
      }));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    if (!initialized) return;
    
    console.log("AuthContext - Setting up auth state change listener");
    
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthContext - Auth state changed:", event, session?.user?.email);
        
        if (event === "SIGNED_IN" && session) {
          setIsLoading(true);
          console.log("AuthContext - User signed in, fetching profile");
          await getUserProfile(session);
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          console.log("AuthContext - User signed out, clearing user state");
          setUser(null);
        } else if (event === "TOKEN_REFRESHED" && session) {
          console.log("AuthContext - Token refreshed, updating session");
          setIsLoading(true);
          await getUserProfile(session);
          setIsLoading(false);
        } else if (event === "USER_UPDATED" && session) {
          console.log("AuthContext - User updated, refreshing profile");
          setIsLoading(true);
          await getUserProfile(session);
          setIsLoading(false);
        }
      }
    );

    // Check if we need to recover from a page reload
    const checkForReload = async () => {
      if (sessionChecked && !user) {
        const lastAuthState = localStorage.getItem('lastAuthState');
        if (lastAuthState) {
          try {
            const parsed = JSON.parse(lastAuthState);
            const timeDiff = new Date().getTime() - parsed.timestamp;
            // If last auth state is less than 30 seconds old, consider it still valid
            if (parsed.isAuthenticated && timeDiff < 30000) {
              console.log("AuthContext - Recovering from page reload, checking session");
              const { data: { session } } = await auth.getSession();
              if (session) {
                await getUserProfile(session);
              }
            }
          } catch (e) {
            console.error("Error parsing lastAuthState", e);
          }
        }
      }
    };
    
    checkForReload();

    return () => {
      console.log("AuthContext - Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [initialized, sessionChecked, user]);

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext - Attempting login with:", email);
      setIsLoading(true);
      
      const { error, data } = await auth.login(email, password);
      
      if (error) {
        console.error("AuthContext - Login error:", error);
        toast({
          title: "Falha no login",
          description: error.message || "Verifique suas credenciais e tente novamente",
          variant: "destructive"
        });
        return { success: false };
      }
      
      console.log("AuthContext - Login API call successful:", !!data?.session);
      
      if (data?.session) {
        console.log("AuthContext - Session available immediately after login");
        const userData = await getUserProfile(data.session);
        console.log("AuthContext - User profile after login:", !!userData);
        return { success: !!userData };
      }
      
      return { success: !!data?.session };
    } catch (error: any) {
      console.error("AuthContext - Login failed:", error);
      
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
      console.log("AuthContext - Attempting to logout");
      localStorage.removeItem('lastAuthState');
      const { error } = await auth.logout();
      
      if (error) throw error;
      
      console.log("AuthContext - Logout successful, clearing user");
      setUser(null);
    } catch (error) {
      console.error("AuthContext - Logout failed:", error);
      
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar sua sessão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Log auth state changes
  useEffect(() => {
    console.log("AuthContext - State updated:", { 
      isAuthenticated: !!user, 
      isLoading, 
      initialized,
      sessionChecked,
      user: user ? `${user.responsible_email} (${user.user_type})` : null 
    });
  }, [user, isLoading, initialized, sessionChecked]);

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
