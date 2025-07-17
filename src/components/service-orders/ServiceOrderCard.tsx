
import { ServiceOrder, ServiceOrderStatus, UserType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  MapPin, 
  Wrench, 
  Eye, 
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ServiceOrderCardProps {
  serviceOrder: ServiceOrder;
  userType: UserType;
  onStatusChange?: (id: string, status: ServiceOrderStatus) => void;
}

const getStatusBadge = (status: ServiceOrderStatus) => {
  const statusConfig = {
    [ServiceOrderStatus.DRAFT]: { variant: 'secondary' as const, label: 'Rascunho' },
    [ServiceOrderStatus.SENT_FOR_QUOTES]: { variant: 'default' as const, label: 'Enviado para Cotação' },
    [ServiceOrderStatus.QUOTED]: { variant: 'outline' as const, label: 'Cotado' },
    [ServiceOrderStatus.ACCEPTED]: { variant: 'success' as const, label: 'Aceito' },
    [ServiceOrderStatus.CANCELLED]: { variant: 'destructive' as const, label: 'Cancelado' }
  };

  const config = statusConfig[status] || statusConfig[ServiceOrderStatus.DRAFT];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const ServiceOrderCard = ({ serviceOrder, userType, onStatusChange }: ServiceOrderCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/service-orders/${serviceOrder.id}`);
  };

  const handleViewQuotes = () => {
    navigate(`/service-orders/${serviceOrder.id}/quotes`);
  };

  const handleSendForQuotes = () => {
    if (onStatusChange) {
      onStatusChange(serviceOrder.id, ServiceOrderStatus.SENT_FOR_QUOTES);
    }
  };

  const canSendForQuotes = userType === UserType.CITY_HALL && serviceOrder.status === ServiceOrderStatus.DRAFT;
  const canViewQuotes = serviceOrder.status === ServiceOrderStatus.SENT_FOR_QUOTES || serviceOrder.status === ServiceOrderStatus.QUOTED;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {serviceOrder.os_number}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(serviceOrder.created_at), 'dd/MM/yyyy')}
            </div>
          </div>
          {getStatusBadge(serviceOrder.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vehicle Information */}
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {serviceOrder.brand} {serviceOrder.model} ({serviceOrder.year})
          </span>
        </div>

        {/* Location */}
        {serviceOrder.service_city && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{serviceOrder.service_city}</span>
          </div>
        )}

        {/* Service Type */}
        {serviceOrder.service_type && (
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">
              {serviceOrder.service_type.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        )}

        {/* License Plate */}
        {serviceOrder.license_plate && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{serviceOrder.license_plate}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </Button>

          {canViewQuotes && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewQuotes}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Cotações
            </Button>
          )}

          {canSendForQuotes && (
            <Button
              size="sm"
              onClick={handleSendForQuotes}
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              Enviar para Cotação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderCard;
