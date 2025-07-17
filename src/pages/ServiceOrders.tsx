
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ServiceOrderStatus } from "@/types";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { serviceOrderService } from "@/services/serviceOrderService";
import ServiceOrderCard from "@/components/service-orders/ServiceOrderCard";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ServiceOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!user) return null;

  const isCityHall = user.user_type === UserRole.CITY_HALL;
  const isWorkshop = user.user_type === UserRole.WORKSHOP;

  // Fetch service orders
  const { 
    data: serviceOrdersData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['service-orders', user.id, user.user_type],
    queryFn: () => serviceOrderService.getServiceOrders(user.id, user.user_type),
  });

  const serviceOrders = serviceOrdersData?.data || [];

  // Filter service orders based on search and status
  const filteredServiceOrders = serviceOrders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.os_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: ServiceOrderStatus) => {
    try {
      const result = await serviceOrderService.updateServiceOrderStatus(id, status);
      
      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da ordem de serviço.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Status da ordem de serviço atualizado com sucesso.",
      });

      // Refresh the data
      refetch();
    } catch (error) {
      console.error('Error updating service order status:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">Erro ao carregar ordens de serviço</p>
          <Button onClick={() => refetch()}>Tentar Novamente</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground">
              {isCityHall 
                ? "Gerencie e acompanhe todas as ordens de serviço" 
                : isWorkshop 
                ? "Visualize ordens de serviço disponíveis para cotação"
                : "Visualize todas as ordens de serviço do sistema"
              }
            </p>
          </div>
          {isCityHall && (
            <Button
              className="sm:w-auto w-full"
              onClick={() => navigate("/service-orders/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem de Serviço
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número OS, veículo, placa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="SENT_FOR_QUOTES">Enviado para Cotação</SelectItem>
                    <SelectItem value="QUOTED">Cotado</SelectItem>
                    <SelectItem value="ACCEPTED">Aceito</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Orders List */}
        {filteredServiceOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {serviceOrders.length === 0 
                  ? "Nenhuma ordem de serviço encontrada"
                  : "Nenhuma ordem de serviço corresponde aos filtros aplicados"
                }
              </p>
              {isCityHall && serviceOrders.length === 0 && (
                <Button onClick={() => navigate("/service-orders/new")}>
                  Criar Primeira Ordem de Serviço
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServiceOrders.map((serviceOrder) => (
              <ServiceOrderCard
                key={serviceOrder.id}
                serviceOrder={serviceOrder}
                userType={user.user_type}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServiceOrders;
