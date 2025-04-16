
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ServiceOrderStatus, ServiceType } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Wrench,
  Calendar,
  Car,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Helper function to format a date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Service type mapping
const serviceTypeLabels: Record<string, string> = {
  PREVENTIVE: "Preventiva",
  CORRECTIVE: "Corretiva",
  EMERGENCY: "Emergência"
};

const ServiceOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityHallFilter, setCityHallFilter] = useState("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);

  if (!user) return null;

  const isCityHall = user.role === UserRole.CITY_HALL;
  const isWorkshop = user.role === UserRole.WORKSHOP;
  const isQueryAdmin = user.role === UserRole.QUERY_ADMIN;
  const isGeneralAdmin = user.role === UserRole.GENERAL_ADMIN;

  // Query to get all city halls for filter dropdown
  const { data: cityHalls, isLoading: cityHallsLoading } = useQuery({
    queryKey: ['city-halls'],
    queryFn: async () => {
      if (!isQueryAdmin && !isGeneralAdmin) return [];
      
      const { data, error } = await supabase
        .from('city_halls')
        .select('id, tradeName')
        .order('tradeName');
        
      if (error) throw error;
      return data || [];
    },
    enabled: isQueryAdmin || isGeneralAdmin
  });

  // Query to get all accredited workshops for a city hall
  const { data: accreditedWorkshops, isLoading: workshopsLoading } = useQuery({
    queryKey: ['accredited-workshops', user.id],
    queryFn: async () => {
      if (!isCityHall || !selectedOrder) return [];
      
      const { data, error } = await supabase
        .from('workshops')
        .select('id, tradeName')
        .filter('accreditedCityHalls', 'cs', `{${user.id}}`)
        .order('tradeName');
        
      if (error) throw error;
      return data || [];
    },
    enabled: isCityHall && !!selectedOrder
  });

  // Main query to get service orders based on role
  const { data: serviceOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['service-orders', user.role, user.id, statusFilter, cityHallFilter],
    queryFn: async () => {
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          city_halls:cityHallId(tradeName),
          quotes(id)
        `);
      
      // Filter by role
      if (isCityHall) {
        query = query.eq('cityHallId', user.id);
      } else if (isWorkshop) {
        // For workshops, we need to show service orders that were sent to this workshop
        query = query.filter('sentToWorkshops', 'cs', `{${user.id}}`);
      }
      
      // Apply status filter if selected
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      // Apply city hall filter if selected
      if (cityHallFilter && (isQueryAdmin || isGeneralAdmin)) {
        query = query.eq('cityHallId', cityHallFilter);
      }
      
      // Order by creation date, newest first
      query = query.order('createdAt', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    }
  });

  // Mutation to send service order to workshops
  const sendOrderMutation = useMutation({
    mutationFn: async ({ orderId, workshopIds }: { orderId: string, workshopIds: string[] }) => {
      // First update the service order status
      const { error: updateError } = await supabase
        .from('service_orders')
        .update({ 
          status: ServiceOrderStatus.SENT,
          sentToWorkshops: workshopIds,
          updatedAt: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) throw updateError;
      
      // Add to history
      const { error: historyError } = await supabase
        .from('service_order_history')
        .insert({
          serviceOrderId: orderId,
          action: 'SENT_TO_WORKSHOPS',
          userId: user.id,
          userRole: user.role,
          details: `Enviado para ${workshopIds.length} oficina(s)`,
          timestamp: new Date().toISOString()
        });
        
      if (historyError) throw historyError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      
      toast({
        title: "Ordem de serviço enviada",
        description: "A ordem de serviço foi enviada para as oficinas selecionadas",
      });
      
      setShowSendDialog(false);
      setSelectedOrder(null);
      setSelectedWorkshops([]);
    },
    onError: (error) => {
      console.error("Error sending service order:", error);
      
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a ordem de serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Function to filter service orders based on search term
  const filteredOrders = serviceOrders?.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      order.number.toLowerCase().includes(searchLower) ||
      order.vehicle?.brand?.toLowerCase().includes(searchLower) ||
      order.vehicle?.model?.toLowerCase().includes(searchLower) ||
      order.vehicle?.licensePlate?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ServiceOrderStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-muted/50">
            <Clock className="mr-1 h-3 w-3" />
            Rascunho
          </Badge>
        );
      case ServiceOrderStatus.SENT:
        return (
          <Badge className="bg-blue-500">
            <FileText className="mr-1 h-3 w-3" />
            Enviado
          </Badge>
        );
      case ServiceOrderStatus.QUOTED:
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Orçado
          </Badge>
        );
      case ServiceOrderStatus.COMPLETED:
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSendDialogOpen = (orderId: string) => {
    setSelectedOrder(orderId);
    setSelectedWorkshops([]);
    setShowSendDialog(true);
  };

  const handleSendOrder = () => {
    if (!selectedOrder || selectedWorkshops.length === 0) {
      toast({
        title: "Selecione oficinas",
        description: "Por favor, selecione pelo menos uma oficina para enviar a ordem de serviço",
        variant: "destructive"
      });
      return;
    }
    
    sendOrderMutation.mutate({ 
      orderId: selectedOrder,
      workshopIds: selectedWorkshops
    });
  };

  const toggleWorkshopSelection = (workshopId: string) => {
    setSelectedWorkshops(prev => 
      prev.includes(workshopId)
        ? prev.filter(id => id !== workshopId)
        : [...prev, workshopId]
    );
  };

  const applyFilters = () => {
    // No need to manually filter - the useQuery will handle this
    // Just make sure we refetch when filters change
    queryClient.invalidateQueries({ queryKey: ['service-orders'] });
  };

  const isLoading = ordersLoading || cityHallsLoading || workshopsLoading;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todas as ordens de serviço
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

        <Card className="overflow-hidden animate-scale-in">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ordens de serviço..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Status</SelectItem>
                    <SelectItem value={ServiceOrderStatus.DRAFT}>Rascunho</SelectItem>
                    <SelectItem value={ServiceOrderStatus.SENT}>Enviado</SelectItem>
                    <SelectItem value={ServiceOrderStatus.QUOTED}>Orçado</SelectItem>
                    <SelectItem value={ServiceOrderStatus.COMPLETED}>Concluído</SelectItem>
                  </SelectContent>
                </Select>

                {(isQueryAdmin || isGeneralAdmin) && cityHalls && (
                  <Select
                    value={cityHallFilter}
                    onValueChange={setCityHallFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Prefeitura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as Prefeituras</SelectItem>
                      {cityHalls.map((cityHall) => (
                        <SelectItem key={cityHall.id} value={cityHall.id}>
                          {cityHall.tradeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={applyFilters}
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem de Serviço</TableHead>
                      {(isQueryAdmin || isGeneralAdmin) && (
                        <TableHead>Prefeitura</TableHead>
                      )}
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo de Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orçamentos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={(isQueryAdmin || isGeneralAdmin) ? 8 : 7} className="text-center py-8 text-muted-foreground">
                          Nenhuma ordem de serviço encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.number}</TableCell>
                          {(isQueryAdmin || isGeneralAdmin) && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{order.city_halls?.tradeName}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {order.vehicle?.brand} {order.vehicle?.model}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {order.vehicle?.licensePlate} · {order.vehicle?.year}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {serviceTypeLabels[order.serviceInfo?.type] || order.serviceInfo?.type}
                          </TableCell>
                          <TableCell>
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {order.quotes?.length > 0 ? (
                              <Badge variant="outline" className="bg-secondary/50">
                                {order.quotes.length} Orçamento{order.quotes.length !== 1 && "s"}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Nenhum
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/service-orders/${order.id}`)
                                  }
                                >
                                  Ver Detalhes
                                </DropdownMenuItem>
                                
                                {isCityHall && order.status === ServiceOrderStatus.DRAFT && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/service-orders/${order.id}/edit`)
                                      }
                                    >
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleSendDialogOpen(order.id)}
                                    >
                                      Enviar para Oficinas
                                    </DropdownMenuItem>
                                  </>
                                )}
                                
                                {(isCityHall || isGeneralAdmin) && order.quotes?.length > 0 && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/service-orders/${order.id}/quotes`)
                                    }
                                  >
                                    Ver Orçamentos
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Exportar PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Ordem de Serviço para Oficinas</DialogTitle>
            <DialogDescription>
              Selecione quais oficinas credenciadas devem receber esta ordem de serviço
              para orçamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {workshopsLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Carregando oficinas...</span>
              </div>
            ) : accreditedWorkshops?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Nenhuma oficina credenciada encontrada. Verifique as configurações de credenciamento.
              </div>
            ) : (
              accreditedWorkshops?.map((workshop) => (
                <div key={workshop.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`workshop-${workshop.id}`}
                    checked={selectedWorkshops.includes(workshop.id)}
                    onCheckedChange={() => toggleWorkshopSelection(workshop.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`workshop-${workshop.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {workshop.tradeName}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendOrder}
              disabled={selectedWorkshops.length === 0 || sendOrderMutation.isPending}
            >
              {sendOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Ordem"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ServiceOrders;
