import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

const ServiceOrderQuotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/service-orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Service Order Quotes
              </h1>
              <p className="text-muted-foreground">
                Quotes for Service Order ID: {id}
              </p>
            </div>
          </div>
        </div>

        <Card className="animate-enter">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Construction className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle>Página em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Esta página está sendo reconstruída para trabalhar com o novo sistema de banco de dados. 
              Em breve estará disponível com todas as funcionalidades de cotações.
            </p>
            <Button onClick={() => navigate("/service-orders")}>
              Voltar para Lista de OS
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ServiceOrderQuotes;