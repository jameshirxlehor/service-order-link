
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ServiceOrderStatus, ServiceType, ServiceCategory, UserRole } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Car,
  ArrowLeft,
  Building,
  Tag,
  MapPin,
  FileText,
  Wrench,
  Clock,
  ClipboardList,
  Download,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to format a date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const ServiceOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) return null;
  
  const isCityHall = user.role === UserRole.CITY_HALL;
  const isWorkshop = user.role === UserRole.WORKSHOP;
  
  // Fetch service order details
  const { data: serviceOrder, isLoading } = useQuery({
    queryKey: ['service-order', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          city_halls:cityHallId(tradeName, corporateName)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  
  // Fetch service order history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['service-order-history', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('service_order_history')
        .select('*')
        .eq('serviceOrderId', id)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });
  
  // Maps for displaying human-readable values
  const serviceTypeMap: Record<string, string> = {
    [ServiceType.PREVENTIVE]: "Preventiva",
    [ServiceType.CORRECTIVE]: "Corretiva",
    [ServiceType.EMERGENCY]: "Emergência"
  };
  
  const serviceCategoryMap: Record<string, string> = {
    [ServiceCategory.MECHANICAL]: "Mecânica",
    [ServiceCategory.ELECTRICAL]: "Elétrica",
    [ServiceCategory.BODY_WORK]: "Funilaria",
    [ServiceCategory.PAINTING]: "Pintura",
    [ServiceCategory.TIRE]: "Pneus",
    [ServiceCategory.GLASS]: "Vidros",
    [ServiceCategory.OTHER]: "Outros"
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ServiceOrderStatus.DRAFT:
        return <Badge variant="outline">Rascunho</Badge>;
      case ServiceOrderStatus.SENT:
        return <Badge className="bg-blue-500">Enviado</Badge>;
      case ServiceOrderStatus.QUOTED:
        return <Badge className="bg-yellow-500">Orçado</Badge>;
      case ServiceOrderStatus.ACCEPTED:
        return <Badge className="bg-green-500">Aceito</Badge>;
      case ServiceOrderStatus.REJECTED:
        return <Badge variant="destructive">Rejeitado</Badge>;
      case ServiceOrderStatus.COMPLETED:
        return <Badge className="bg-green-700">Concluído</Badge>;
      case ServiceOrderStatus.CANCELLED:
        return <Badge variant="outline" className="bg-destructive/20">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
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
                {isLoading ? <Skeleton className="h-9 w-48" /> : `Ordem de Serviço ${serviceOrder?.number}`}
              </h1>
              <div className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-5 w-64 mt-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Criada em {formatDate(serviceOrder?.createdAt || '')}</span>
                    {getStatusBadge(serviceOrder?.status || '')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isCityHall && serviceOrder?.status === ServiceOrderStatus.DRAFT && (
              <Button onClick={() => navigate(`/service-orders/${id}/edit`)}>
                Editar
              </Button>
            )}
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Informações do Veículo
                </CardTitle>
              </CardHeader>
              {isLoading ? (
                <CardContent className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </CardContent>
              ) : (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Marca/Modelo</p>
                      <p className="text-base">
                        {serviceOrder?.vehicle?.brand} {serviceOrder?.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Placa</p>
                      <p className="text-base">{serviceOrder?.vehicle?.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ano</p>
                      <p className="text-base">{serviceOrder?.vehicle?.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cor</p>
                      <p className="text-base">{serviceOrder?.vehicle?.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Combustível</p>
                      <p className="text-base">{serviceOrder?.vehicle?.fuel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Motor</p>
                      <p className="text-base">{serviceOrder?.vehicle?.engine}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transmissão</p>
                      <p className="text-base">{serviceOrder?.vehicle?.transmission}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Chassi</p>
                      <p className="text-base">{serviceOrder?.vehicle?.chassis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quilometragem</p>
                      <p className="text-base">{serviceOrder?.vehicle?.km.toLocaleString('pt-BR')} km</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor de Mercado</p>
                      <p className="text-base">R$ {serviceOrder?.vehicle?.marketValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registro</p>
                      <p className="text-base">{serviceOrder?.vehicle?.registration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacidade do Tanque</p>
                      <p className="text-base">{serviceOrder?.vehicle?.tankCapacity} litros</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Informações do Serviço
                </CardTitle>
              </CardHeader>
              {isLoading ? (
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </CardContent>
              ) : (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo de Serviço</p>
                      <p className="text-base">
                        {serviceTypeMap[serviceOrder?.serviceInfo?.type] || serviceOrder?.serviceInfo?.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                      <p className="text-base">
                        {serviceCategoryMap[serviceOrder?.serviceInfo?.category] || serviceOrder?.serviceInfo?.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                      <p className="text-base">{serviceOrder?.serviceInfo?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Localização do Veículo</p>
                      <p className="text-base">{serviceOrder?.serviceInfo?.location}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Observações</p>
                      <p className="text-base whitespace-pre-wrap">{serviceOrder?.serviceInfo?.notes || "Nenhuma observação."}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Histórico</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Linha do Tempo</CardTitle>
                    <CardDescription>Histórico de eventos da ordem de serviço</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : history?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum histórico disponível.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history?.map((event) => (
                          <div key={event.id} className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{event.action.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.details}</p>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{event.userRole}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Prefeitura
                </CardTitle>
              </CardHeader>
              {isLoading ? (
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              ) : (
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{serviceOrder?.city_halls?.tradeName}</p>
                    <p className="text-sm text-muted-foreground">{serviceOrder?.city_halls?.corporateName}</p>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Service Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      {getStatusBadge(serviceOrder?.status || '')}
                    </div>
                    <Separator />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Atualizada em:</p>
                      <p>{formatDate(serviceOrder?.updatedAt || '')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Workshops */}
            {serviceOrder?.sentToWorkshops && serviceOrder?.sentToWorkshops.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Oficinas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Esta ordem foi enviada para {serviceOrder?.sentToWorkshops.length} oficina(s)
                    </p>
                    {serviceOrder?.status === ServiceOrderStatus.SENT && (
                      <div className="text-sm">
                        <p>Aguardando orçamentos...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCityHall && serviceOrder?.status === ServiceOrderStatus.QUOTED && (
                  <Button className="w-full">
                    Ver Orçamentos
                  </Button>
                )}
                {isWorkshop && serviceOrder?.status === ServiceOrderStatus.SENT && (
                  <Button className="w-full">
                    Criar Orçamento
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceOrderDetail;
