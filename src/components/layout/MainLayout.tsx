
import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("MainLayout - Auth state:", { user, isLoading, isAuthenticated });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-lg text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("MainLayout - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  let roleText = "";
  switch (user?.role) {
    case UserRole.CITY_HALL:
      roleText = "City Hall";
      break;
    case UserRole.WORKSHOP:
      roleText = "Workshop";
      break;
    case UserRole.QUERY_ADMIN:
      roleText = "Query Administrator";
      break;
    case UserRole.GENERAL_ADMIN:
      roleText = "General Administrator";
      break;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          userRole={roleText}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
