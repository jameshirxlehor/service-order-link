
import { ReactNode, useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { UserRole } from "@/types";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layoutError, setLayoutError] = useState<Error | null>(null);
  const location = useLocation();

  useEffect(() => {
    console.log("MainLayout - Auth state:", { 
      user: user ? `${user.email} (${user.role})` : null, 
      isLoading, 
      isAuthenticated,
      path: location.pathname
    });
  }, [user, isLoading, isAuthenticated, location.pathname]);

  // Error boundary for the layout
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("MainLayout - Caught runtime error:", event.error);
      setLayoutError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

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
  if (!isAuthenticated || !user) {
    console.log("MainLayout - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Show error state if there's an error
  if (layoutError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="flex flex-col items-center text-center max-w-md p-6">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">Ocorreu um erro inesperado. Por favor, tente recarregar a página.</p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }

  let roleText = "";
  switch (user.role) {
    case UserRole.CITY_HALL:
      roleText = "Prefeitura";
      break;
    case UserRole.WORKSHOP:
      roleText = "Oficina";
      break;
    case UserRole.QUERY_ADMIN:
      roleText = "Administrador de Consulta";
      break;
    case UserRole.GENERAL_ADMIN:
      roleText = "Administrador Geral";
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
          <Suspense fallback={
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
