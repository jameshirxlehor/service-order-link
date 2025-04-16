
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login page after a brief moment
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
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
          Redirecionando para login...
        </div>
      </div>
    </div>
  );
};

export default Index;
