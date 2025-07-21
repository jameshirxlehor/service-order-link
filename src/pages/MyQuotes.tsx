import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Calendar, Car } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { serviceOrderService } from "@/services/serviceOrderService";

interface SimpleServiceOrder {
  id: string;
  os_number: string;
  vehicle_type: string;
  brand?: string;
  model?: string;
  year?: number;
  service_type?: string;
  service_city?: string;
  vehicle_location?: string;
}

interface Quote {
  id: string;
  service_order_id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  quote_amount: number;
  description: string;
  status: string;
  created_at: string;
  service_order?: SimpleServiceOrder;
}

const MyQuotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyQuotes();
  }, [user]);

  const fetchMyQuotes = async () => {
    if (!user) return;

    try {
      // For now, we'll create some mock data since the quotes table might not exist yet
      // In a real implementation, you would fetch from your database
      const mockQuotes: Quote[] = [
        {
          id: '1',
          service_order_id: 'SO-001',
          company_name: 'AutoFix Workshop',
          contact_email: 'contact@autofix.com',
          contact_phone: '+1 (555) 123-4567',
          quote_amount: 1250.00,
          description: 'Complete brake system inspection and replacement of brake pads',
          status: 'PENDING',
          created_at: new Date().toISOString(),
          service_order: {
            id: 'SO-001',
            os_number: 'SO-001',
            vehicle_type: 'CAR',
            brand: 'Toyota',
            model: 'Camry',
            year: 2020,
            service_type: 'REPAIR',
            service_city: 'Springfield',
            vehicle_location: 'Main Street Parking'
          }
        }
      ];

      setQuotes(mockQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load your quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Quotes</h1>
            <p className="text-muted-foreground">
              View and manage all your submitted quotes
            </p>
          </div>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No quotes found</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't submitted any quotes yet.
              </p>
              <Button onClick={() => navigate('/service-orders')}>
                Browse Service Orders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {quote.service_order?.os_number || 'Unknown Order'}
                      </CardTitle>
                      <CardDescription>
                        {quote.service_order ? `${quote.service_order.brand} ${quote.service_order.model} (${quote.service_order.year})` : 'Vehicle details unavailable'}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Company:</span>
                        <p className="text-muted-foreground">{quote.company_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Quote Amount:</span>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(quote.quote_amount)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Service Type:</span>
                        <p className="text-muted-foreground">{quote.service_order?.service_type || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Location:</span>
                        <p className="text-muted-foreground">
                          {quote.service_order ? `${quote.service_order.vehicle_location}, ${quote.service_order.service_city}` : 'Location unavailable'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p className="text-muted-foreground">{quote.contact_email}</p>
                        <p className="text-muted-foreground">{quote.contact_phone}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Submitted on {formatDate(quote.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {quote.description && (
                    <div className="mt-4">
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground mt-1">{quote.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/service-orders/${quote.service_order_id}`)}
                    >
                      View Service Order
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/service-orders/${quote.service_order_id}/quotes`)}
                    >
                      View All Quotes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyQuotes;