import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Car, FileText, MapPin, Calendar, Wrench, Loader2 } from "lucide-react";
import { serviceOrderService } from "@/services/serviceOrderService";
import { UserRole } from "@/types";

const ServiceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const isCityHall = user.user_type === UserRole.CITY_HALL;
  const isWorkshop = user.user_type === UserRole.WORKSHOP;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'SENT_FOR_QUOTES':
        return 'default';
      case 'QUOTED':
        return 'outline';
      case 'ACCEPTED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho';
      case 'SENT_FOR_QUOTES':
        return 'Enviado para Cotação';
      case 'QUOTED':
        return 'Cotado';
      case 'ACCEPTED':
        return 'Aceito';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
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

  if (error || !serviceOrder) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">Erro ao carregar ordem de serviço</p>
          <Button onClick={() => navigate("/service-orders")}>
            Voltar para Lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
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
                OS #{serviceOrder.os_number}
              </h1>
              <p className="text-muted-foreground">
                Criada em {new Date(serviceOrder.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(serviceOrder.status)}>
              {getStatusText(serviceOrder.status)}
            </Badge>
            {(isCityHall || isWorkshop) && (
              <Button onClick={() => navigate(`/service-orders/${id}/quotes`)}>
                Ver Cotações
              </Button>
            )}
          </div>
        </div>

        {/* Service Order Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informações do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Marca/Modelo</span>
                  <p className="font-medium">{serviceOrder.brand} {serviceOrder.model}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Ano</span>
                  <p className="font-medium">{serviceOrder.year || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Placa</span>
                  <p className="font-medium">{serviceOrder.license_plate || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Cor</span>
                  <p className="font-medium">{serviceOrder.color || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Combustível</span>
                  <p className="font-medium">{serviceOrder.fuel || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Transmissão</span>
                  <p className="font-medium">{serviceOrder.transmission || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Quilometragem</span>
                  <p className="font-medium">{serviceOrder.km ? `${serviceOrder.km.toLocaleString()} km` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Motor</span>
                  <p className="font-medium">{serviceOrder.engine || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Informações do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tipo de Serviço</span>
                <p className="font-medium">{serviceOrder.service_type || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                <p className="font-medium">{serviceOrder.service_category || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Local do Serviço</span>
                <p className="font-medium">{serviceOrder.service_city || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Localização do Veículo</span>
                <p className="font-medium">{serviceOrder.vehicle_location || 'N/A'}</p>
              </div>
              
              {serviceOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Observações</span>
                    <p className="mt-1 text-sm">{serviceOrder.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Chassi</span>
                <p className="font-medium">{serviceOrder.chassis || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Registro</span>
                <p className="font-medium">{serviceOrder.registration || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Capacidade do Tanque</span>
                <p className="font-medium">{serviceOrder.tank_capacity ? `${serviceOrder.tank_capacity}L` : 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Valor de Mercado</span>
                <p className="font-medium">
                  {serviceOrder.vehicle_market_value ? 
                    `R$ ${serviceOrder.vehicle_market_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                    'N/A'
                  }
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Última Atualização</span>
                <p className="font-medium">{new Date(serviceOrder.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ServiceOrderDetail;