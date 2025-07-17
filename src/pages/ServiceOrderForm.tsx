
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ServiceOrderForm from "@/components/service-orders/ServiceOrderForm";
import { UserType } from "@/types";

const ServiceOrderFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  // Only City Hall users can create service orders
  if (user.user_type !== UserType.CITY_HALL) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">
            Apenas prefeituras podem criar ordens de serviço
          </p>
          <Button onClick={() => navigate("/service-orders")}>
            Voltar para Lista de OS
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
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
              Nova Ordem de Serviço
            </h1>
            <p className="text-muted-foreground">
              Criar uma nova ordem de serviço para envio às oficinas
            </p>
          </div>
        </div>

        <ServiceOrderForm />
      </div>
    </MainLayout>
  );
};

export default ServiceOrderFormPage;
