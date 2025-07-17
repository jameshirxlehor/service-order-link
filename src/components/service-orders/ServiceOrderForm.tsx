
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleType, FuelType, TransmissionType, ServiceType } from '@/types';
import { serviceOrderService } from '@/services/serviceOrderService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const serviceOrderSchema = z.object({
  vehicle_type: z.nativeEnum(VehicleType),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  license_plate: z.string().min(1, 'Placa é obrigatória'),
  fuel: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  engine: z.string().optional(),
  color: z.string().optional(),
  chassis: z.string().optional(),
  km: z.number().optional(),
  vehicle_market_value: z.number().optional(),
  registration: z.string().optional(),
  tank_capacity: z.number().optional(),
  service_city: z.string().min(1, 'Cidade do serviço é obrigatória'),
  service_type: z.nativeEnum(ServiceType),
  service_category: z.string().optional(),
  vehicle_location: z.string().optional(),
  notes: z.string().optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

const ServiceOrderForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema)
  });

  const onSubmit = async (data: ServiceOrderFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await serviceOrderService.createServiceOrder({
        ...data,
        city_hall_id: user.id
      });

      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a ordem de serviço.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso.",
      });

      navigate('/service-orders');
    } catch (error) {
      console.error('Error creating service order:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Veículo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_type">Tipo de Veículo *</Label>
                  <Select onValueChange={(value) => setValue('vehicle_type', value as VehicleType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VehicleType.CAR}>Carro</SelectItem>
                      <SelectItem value={VehicleType.TRUCK}>Caminhão</SelectItem>
                      <SelectItem value={VehicleType.MOTORCYCLE}>Moto</SelectItem>
                      <SelectItem value={VehicleType.BUS}>Ônibus</SelectItem>
                      <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                      <SelectItem value={VehicleType.OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vehicle_type && (
                    <p className="text-sm text-destructive">{errors.vehicle_type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input {...register('brand')} />
                  {errors.brand && (
                    <p className="text-sm text-destructive">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input {...register('model')} />
                  {errors.model && (
                    <p className="text-sm text-destructive">{errors.model.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="year">Ano *</Label>
                  <Input 
                    type="number" 
                    {...register('year', { valueAsNumber: true })} 
                  />
                  {errors.year && (
                    <p className="text-sm text-destructive">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="license_plate">Placa *</Label>
                  <Input {...register('license_plate')} />
                  {errors.license_plate && (
                    <p className="text-sm text-destructive">{errors.license_plate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fuel">Combustível</Label>
                  <Select onValueChange={(value) => setValue('fuel', value as FuelType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o combustível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FuelType.GASOLINE}>Gasolina</SelectItem>
                      <SelectItem value={FuelType.ETHANOL}>Álcool</SelectItem>
                      <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
                      <SelectItem value={FuelType.FLEX}>Flex</SelectItem>
                      <SelectItem value={FuelType.ELECTRIC}>Elétrico</SelectItem>
                      <SelectItem value={FuelType.HYBRID}>Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Serviço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_city">Cidade do Serviço *</Label>
                  <Input {...register('service_city')} />
                  {errors.service_city && (
                    <p className="text-sm text-destructive">{errors.service_city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="service_type">Tipo de Serviço *</Label>
                  <Select onValueChange={(value) => setValue('service_type', value as ServiceType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ServiceType.MAINTENANCE}>Manutenção</SelectItem>
                      <SelectItem value={ServiceType.REPAIR}>Reparo</SelectItem>
                      <SelectItem value={ServiceType.INSPECTION}>Inspeção</SelectItem>
                      <SelectItem value={ServiceType.OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.service_type && (
                    <p className="text-sm text-destructive">{errors.service_type.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="vehicle_location">Localização do Veículo</Label>
                  <Input {...register('vehicle_location')} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea {...register('notes')} rows={4} />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/service-orders')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Ordem de Serviço'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderForm;
