
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";

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
    // Here we would normally check for an existing session
    // For now, we'll just simulate with localStorage
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock login - in a real app, this would communicate with a backend
      // For demo purposes, we'll create mock users for each role
      let mockUser: User;
      
      if (email.includes("cityhall")) {
        mockUser = {
          id: "ch-1",
          login: "100001",
          role: UserRole.CITY_HALL,
          email: email,
          phone: "123-456-7890",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (email.includes("workshop")) {
        mockUser = {
          id: "ws-1",
          login: "200001",
          role: UserRole.WORKSHOP,
          email: email,
          phone: "123-456-7890",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (email.includes("queryadmin")) {
        mockUser = {
          id: "qa-1",
          login: "300001",
          role: UserRole.QUERY_ADMIN,
          email: email,
          phone: "123-456-7890",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        mockUser = {
          id: "ga-1",
          login: "400001",
          role: UserRole.GENERAL_ADMIN,
          email: email,
          phone: "123-456-7890",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Clear user session
    setUser(null);
    localStorage.removeItem("user");
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
