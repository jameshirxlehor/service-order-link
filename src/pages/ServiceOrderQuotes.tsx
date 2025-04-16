
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, QuoteStatus, ServiceOrderStatus } from "@/types";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  Wrench,
  Calendar,
  Clock,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

// Helper function to format a date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Helper function to format currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ServiceOrderQuotes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);
  
  if (!user) return null;
  
  const isCityHall = user.role === UserRole.CITY_HALL;
  
  // Fetch service order details
  const { data: serviceOrder, isLoading: orderLoading } = useQuery({
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
  
  // Fetch quotes for this service order
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['service-order-quotes', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          workshops:workshopId(tradeName, corporateName)
        `)
        .eq('serviceOrderId', id)
        .order('created_at');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });
  
  // Mutation to accept a quote
  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      // First update the quote status
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: QuoteStatus.ACCEPTED })
        .eq('id', quoteId);
        
      if (quoteError) throw quoteError;
      
      // Update all other quotes to rejected
      const { error: otherQuotesError } = await supabase
        .from('quotes')
        .update({ status: QuoteStatus.REJECTED })
        .eq('serviceOrderId', id as string)
        .neq('id', quoteId);
        
      if (otherQuotesError) throw otherQuotesError;
      
      // Update the service order status
      const { error: orderError } = await supabase
        .from('service_orders')
        .update({ 
          status: ServiceOrderStatus.ACCEPTED,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id as string);
        
      if (orderError) throw orderError;
      
      // Add to service order history
      const { error: historyError } = await supabase
        .from('service_order_history')
        .insert({
          serviceOrderId: id as string,
          action: 'QUOTE_ACCEPTED',
          userId: user.id,
          userRole: user.role,
          details: `Orçamento aceito para execução`,
          timestamp: new Date().toISOString()
        });
        
      if (historyError) throw historyError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-order-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['service-order'] });
      
      toast({
        title: "Orçamento aceito",
        description: "O orçamento foi aceito e os demais foram rejeitados automaticamente",
      });
      
      setSelectedQuote(null);
      setSelectedAction(null);
    },
    onError: (error) => {
      console.error("Error accepting quote:", error);
      
      toast({
        title: "Erro ao aceitar orçamento",
        description: "Não foi possível aceitar o orçamento. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to reject a quote
  const rejectQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      // Update the quote status
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: QuoteStatus.REJECTED })
        .eq('id', quoteId);
        
      if (quoteError) throw quoteError;
      
      // Add to service order history
      const { error: historyError } = await supabase
        .from('service_order_history')
        .insert({
          serviceOrderId: id as string,
          action: 'QUOTE_REJECTED',
          userId: user.id,
          userRole: user.role,
          details: `Orçamento rejeitado`,
          timestamp: new Date().toISOString()
        });
        
      if (historyError) throw historyError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-order-quotes'] });
      
      toast({
        title: "Orçamento rejeitado",
        description: "O orçamento foi rejeitado com sucesso",
      });
      
      setSelectedQuote(null);
      setSelectedAction(null);
    },
    onError: (error) => {
      console.error("Error rejecting quote:", error);
      
      toast({
        title: "Erro ao rejeitar orçamento",
        description: "Não foi possível rejeitar o orçamento. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  const handleQuoteAction = () => {
    if (!selectedQuote || !selectedAction) return;
    
    if (selectedAction === 'accept') {
      acceptQuoteMutation.mutate(selectedQuote);
    } else {
      rejectQuoteMutation.mutate(selectedQuote);
    }
  };
  
  const getQuoteStatusBadge = (status: string) => {
    switch (status) {
      case QuoteStatus.PENDING:
        return <Badge className="bg-blue-500">Pendente</Badge>;
      case QuoteStatus.ACCEPTED:
        return <Badge className="bg-green-500">Aceito</Badge>;
      case QuoteStatus.REJECTED:
        return <Badge variant="destructive">Rejeitado</Badge>;
      case QuoteStatus.CANCELLED:
        return <Badge variant="outline" className="bg-destructive/20">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const isLoading = orderLoading || quotesLoading;
  const isPending = acceptQuoteMutation.isPending || rejectQuoteMutation.isPending;
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
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
                {orderLoading ? (
                  <Skeleton className="h-9 w-48" />
                ) : (
                  `Orçamentos - OS ${serviceOrder?.number}`
                )}
              </h1>
              <div className="text-muted-foreground">
                {orderLoading ? (
                  <Skeleton className="h-5 w-64 mt-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Criada em {formatDate(serviceOrder?.createdAt || '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Todos
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with info */}
          <div className="space-y-6 order-2 md:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5" />
                  Prefeitura
                </CardTitle>
              </CardHeader>
              {orderLoading ? (
                <CardContent className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </CardContent>
              ) : (
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{serviceOrder?.city_halls?.tradeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceOrder?.city_halls?.corporateName}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quotesLoading ? (
                  <>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">Total de orçamentos:</span>
                      <p className="font-medium">{quotes?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orçamentos pendentes:</span>
                      <p className="font-medium">
                        {quotes?.filter(q => q.status === QuoteStatus.PENDING).length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orçamentos aceitos:</span>
                      <p className="font-medium">
                        {quotes?.filter(q => q.status === QuoteStatus.ACCEPTED).length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orçamentos rejeitados:</span>
                      <p className="font-medium">
                        {quotes?.filter(q => q.status === QuoteStatus.REJECTED).length || 0}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main content - Quotes */}
          <div className="md:col-span-3 order-1 md:order-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex mb-4">
                <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pendentes</TabsTrigger>
                <TabsTrigger value="accepted" className="flex-1">Aceitos</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1">Rejeitados</TabsTrigger>
              </TabsList>
              
              {/* All Quotes */}
              {['all', 'pending', 'accepted', 'rejected'].map((tabValue) => (
                <TabsContent value={tabValue} key={tabValue}>
                  {isLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {quotes?.filter(quote => {
                        if (tabValue === 'all') return true;
                        if (tabValue === 'pending') return quote.status === QuoteStatus.PENDING;
                        if (tabValue === 'accepted') return quote.status === QuoteStatus.ACCEPTED;
                        if (tabValue === 'rejected') return quote.status === QuoteStatus.REJECTED;
                        return true;
                      }).length === 0 ? (
                        <Card>
                          <CardContent className="text-center p-12">
                            <p className="text-muted-foreground">
                              Nenhum orçamento {tabValue === 'pending' ? 'pendente' : 
                                tabValue === 'accepted' ? 'aceito' : 
                                tabValue === 'rejected' ? 'rejeitado' : ''} encontrado.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        quotes?.filter(quote => {
                          if (tabValue === 'all') return true;
                          if (tabValue === 'pending') return quote.status === QuoteStatus.PENDING;
                          if (tabValue === 'accepted') return quote.status === QuoteStatus.ACCEPTED;
                          if (tabValue === 'rejected') return quote.status === QuoteStatus.REJECTED;
                          return true;
                        }).map((quote) => (
                          <Card key={quote.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/40">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-5 w-5 text-primary" />
                                  <CardTitle className="text-lg">{quote.workshops?.tradeName}</CardTitle>
                                </div>
                                {getQuoteStatusBadge(quote.status)}
                              </div>
                              <CardDescription>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Data: {formatDate(quote.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Válido até: {formatDate(quote.validUntil)}</span>
                                  </div>
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Estimativa de entrega</p>
                                    <p className="font-medium">{quote.estimatedDeliveryDays} dias</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Data estimada de início</p>
                                    <p className="font-medium">{formatDate(quote.estimatedStartDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Local do serviço</p>
                                    <p className="font-medium">{quote.serviceLocation}</p>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="font-medium mb-2">Observações</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {quote.notes || "Nenhuma observação adicional."}
                                  </p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="font-medium mb-3">Resumo dos valores</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total de peças (sem desconto):</span>
                                      <span>{formatCurrency(quote.totals.totalPartsWithoutDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Desconto em peças ({quote.totals.partsDiscountPercentage}%):</span>
                                      <span>-{formatCurrency(quote.totals.partsDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                      <span>Total de peças (com desconto):</span>
                                      <span>{formatCurrency(quote.totals.totalPartsWithDiscount)}</span>
                                    </div>
                                    
                                    <Separator className="my-1" />
                                    
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total de mão de obra (sem desconto):</span>
                                      <span>{formatCurrency(quote.totals.totalLaborWithoutDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Desconto em mão de obra ({quote.totals.laborDiscountPercentage}%):</span>
                                      <span>-{formatCurrency(quote.totals.laborDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                      <span>Total de mão de obra (com desconto):</span>
                                      <span>{formatCurrency(quote.totals.totalLaborWithDiscount)}</span>
                                    </div>
                                    
                                    <Separator className="my-1" />
                                    
                                    <div className="flex justify-between font-medium">
                                      <span>Total do orçamento:</span>
                                      <span className="text-lg text-primary">
                                        {formatCurrency(quote.totals.totalWithDiscount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 px-6 py-4 flex justify-between">
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/service-orders/${id}/quotes/${quote.id}`)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Button>
                              
                              {isCityHall && quote.status === QuoteStatus.PENDING && (
                                <div className="flex gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className="bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          setSelectedQuote(quote.id);
                                          setSelectedAction('reject');
                                        }}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Rejeitar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Rejeitar orçamento</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja rejeitar este orçamento? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => {
                                          setSelectedQuote(null);
                                          setSelectedAction(null);
                                        }}>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={handleQuoteAction}
                                          disabled={isPending}
                                        >
                                          {isPending ? 'Rejeitando...' : 'Sim, rejeitar'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          setSelectedQuote(quote.id);
                                          setSelectedAction('accept');
                                        }}
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Aceitar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Aceitar orçamento</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Ao aceitar este orçamento, todos os outros serão automaticamente rejeitados.
                                          Deseja continuar?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => {
                                          setSelectedQuote(null);
                                          setSelectedAction(null);
                                        }}>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={handleQuoteAction}
                                          disabled={isPending}
                                        >
                                          {isPending ? 'Aceitando...' : 'Sim, aceitar'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                              
                              {quote.status === QuoteStatus.ACCEPTED && (
                                <Badge className="px-3 py-1 bg-green-500">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Orçamento Aceito
                                </Badge>
                              )}
                            </CardFooter>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceOrderQuotes;
