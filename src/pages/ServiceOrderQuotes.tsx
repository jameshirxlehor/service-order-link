import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Phone, Mail, MapPin, Calendar, DollarSign, Clock, FileText, Loader2 } from "lucide-react";
import { Quote, QuoteStatus, UserType } from "@/types";
import { quoteService } from "@/services/quoteService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ServiceOrderQuotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuotes();
    }
  }, [id]);

  const fetchQuotes = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await quoteService.getQuotesByServiceOrderId(id);
      
      if (error) {
        toast({
          title: "Erro ao carregar cotações",
          description: "Não foi possível carregar as cotações para esta ordem de serviço.",
          variant: "destructive"
        });
        return;
      }
      
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar cotações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      [QuoteStatus.PENDING]: { label: "Pendente", variant: "secondary" as const },
      [QuoteStatus.SUBMITTED]: { label: "Enviado", variant: "default" as const },
      [QuoteStatus.ACCEPTED]: { label: "Aceito", variant: "success" as const },
      [QuoteStatus.REJECTED]: { label: "Rejeitado", variant: "destructive" as const },
      [QuoteStatus.CANCELLED]: { label: "Cancelado", variant: "destructive" as const },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

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
                Cotações da Ordem de Serviço
              </h1>
              <p className="text-muted-foreground">
                OS ID: {id}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cotação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Ainda não há cotações para esta ordem de serviço.
              </p>
              <Button onClick={() => navigate("/service-orders")}>
                Voltar para Lista de OS
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">
                          {quote.workshop?.trade_name || 'Oficina Desconhecida'}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(quote.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(quote.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(quote.total_with_discount)}
                          </p>
                        </div>
                      </div>

                      {quote.estimated_delivery_days && (
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Prazo de Entrega</p>
                            <p className="text-lg font-semibold">
                              {quote.estimated_delivery_days} {quote.estimated_delivery_days === 1 ? 'dia' : 'dias'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Informações de Contato</h4>
                        <div className="space-y-2 text-sm">
                          {quote.workshop?.responsible_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{quote.workshop.responsible_email}</span>
                            </div>
                          )}
                          {quote.workshop?.contact_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{quote.workshop.contact_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {quote.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Observações</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {quote.notes}
                        </p>
                      </div>
                    </>
                  )}

                  {user.user_type === UserType.CITY_HALL && quote.status === QuoteStatus.SUBMITTED && (
                    <>
                      <Separator />
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // TODO: Implement reject functionality
                            toast({
                              title: "Funcionalidade em desenvolvimento",
                              description: "A funcionalidade de rejeitar cotação será implementada em breve."
                            });
                          }}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          onClick={() => {
                            // TODO: Implement accept functionality
                            toast({
                              title: "Funcionalidade em desenvolvimento",
                              description: "A funcionalidade de aceitar cotação será implementada em breve."
                            });
                          }}
                        >
                          Aceitar Cotação
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServiceOrderQuotes;