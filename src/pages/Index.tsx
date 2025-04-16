
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkSupabaseConnection } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("Index page - Auth state:", { isAuthenticated, isLoading });
    
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao banco de dados. Verifique sua conexão.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Index page - Connection check error:", error);
      }
    };
    
    checkConnection();
    
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
  
  // Show a simple loading screen while initial auth check happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-20 w-20 text-primary animate-spin" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-primary">
          Sistema de Gestão de Ordens de Serviço
        </h1>
        <p className="text-xl text-muted-foreground">
          Verificando sessão...
        </p>
      </div>
    </div>
  );
};

export default Index;
