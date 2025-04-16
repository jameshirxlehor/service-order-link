
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    console.log("Index page - Auth state check:", { isAuthenticated, isLoading, redirectAttempted });
    
    // Only attempt redirection once authentication check completes
    if (!isLoading && !redirectAttempted) {
      setRedirectAttempted(true);
      
      if (isAuthenticated) {
        console.log("Index page - Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Index page - Redirecting to login");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading, redirectAttempted]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Building2 className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Sistema de Gestão de Ordens de Serviço
        </h1>
        <p className="text-xl text-muted-foreground">
          Gerenciamento eficiente de ordens de serviço e orçamentos
        </p>
        <div className="mt-6 text-muted-foreground text-sm">
          {isLoading ? "Verificando autenticação..." : 
            redirectAttempted ? `Redirecionando para ${isAuthenticated ? "dashboard" : "login"}...` : ""}
        </div>
      </div>
    </div>
  );
};

export default Index;
