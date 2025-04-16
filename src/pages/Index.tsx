
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("Index page - Auth state:", { isAuthenticated, isLoading });
    
    // Only redirect when the auth state is determined (not loading)
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("Index page - User authenticated, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Index page - User not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          {isLoading ? (
            <Loader2 className="h-20 w-20 text-primary animate-spin" />
          ) : (
            <Building2 className="h-20 w-20 text-primary animate-pulse" />
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Sistema de Gestão de Ordens de Serviço
        </h1>
        <p className="text-xl text-muted-foreground">
          Gerenciamento eficiente de ordens de serviço e orçamentos
        </p>
        <div className="mt-6 text-muted-foreground text-sm">
          {isLoading ? "Verificando autenticação..." : 
            `Redirecionando para ${isAuthenticated ? "dashboard" : "login"}...`}
        </div>
      </div>
    </div>
  );
};

export default Index;
