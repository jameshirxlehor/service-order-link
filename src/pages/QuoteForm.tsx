import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import QuoteFormComponent from "@/components/quotes/QuoteFormComponent";
import { UserRole } from "@/types";
import { serviceOrderService } from "@/services/serviceOrderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuoteForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  if (!user) return null;

  // Only Workshop users can create quotes
  if (user.user_type !== UserRole.WORKSHOP) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">
            Apenas oficinas podem criar cotações
          </p>
          <Button onClick={() => navigate("/service-orders")}>
            Voltar para Lista de OS
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Fetch service order details
  const { 
    data: serviceOrderData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['service-order', id],
    queryFn: () => serviceOrderService.getServiceOrderById(id!),
    enabled: !!id,
  });

  const serviceOrder = serviceOrderData?.data;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error || !serviceOrder) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">Ordem de serviço não encontrada</p>
          <Button onClick={() => navigate("/service-orders")}>
            Voltar para Lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Check if service order is available for quoting
  if (serviceOrder.status !== 'SENT_FOR_QUOTES') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Ordem de Serviço Indisponível</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Esta ordem de serviço não está disponível para cotação.
              </p>
              <p className="text-sm">
                Status atual: <span className="font-medium">{serviceOrder.status}</span>
              </p>
              <Button onClick={() => navigate("/service-orders")}>
                Voltar para Lista de OS
              </Button>
            </CardContent>
          </Card>
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
            onClick={() => navigate(`/service-orders/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nova Cotação
            </h1>
            <p className="text-muted-foreground">
              OS #{serviceOrder.os_number} - {serviceOrder.brand} {serviceOrder.model} ({serviceOrder.year})
            </p>
          </div>
        </div>

        <QuoteFormComponent serviceOrder={serviceOrder} />
      </div>
    </MainLayout>
  );
};

export default QuoteForm;