
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { VehicleType, FuelType, TransmissionType, ServiceType } from '@/types';
import { serviceOrderService } from '@/services/serviceOrderService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Car, Wrench, FileText, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const serviceOrderSchema = z.object({
  // Vehicle Information
  vehicle_type: z.nativeEnum(VehicleType),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900, 'Ano deve ser maior que 1900').max(new Date().getFullYear() + 1, 'Ano inválido'),
  license_plate: z.string().min(1, 'Placa é obrigatória'),
  fuel: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  engine: z.string().optional(),
  color: z.string().optional(),
  chassis: z.string().optional(),
  km: z.number().min(0, 'Quilometragem deve ser positiva').optional(),
  vehicle_market_value: z.number().min(0, 'Valor deve ser positivo').optional(),
  registration: z.string().optional(),
  tank_capacity: z.number().min(0, 'Capacidade deve ser positiva').optional(),
  
  // Service Information
  service_city: z.string().min(1, 'Cidade do serviço é obrigatória'),
  service_type: z.nativeEnum(ServiceType),
  service_category: z.string().optional(),
  vehicle_location: z.string().min(1, 'Localização do veículo é obrigatória'),
  notes: z.string().optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

const ServiceOrderForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      vehicle_type: VehicleType.CAR,
      fuel: FuelType.GASOLINE,
      transmission: TransmissionType.MANUAL,
      service_type: ServiceType.MAINTENANCE,
    }
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
        description: `Ordem de serviço ${result.data?.number} criada com sucesso.`,
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informações do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Veículo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={VehicleType.CAR}>Carro</SelectItem>
                          <SelectItem value={VehicleType.TRUCK}>Caminhão</SelectItem>
                          <SelectItem value={VehicleType.MOTORCYCLE}>Moto</SelectItem>
                          <SelectItem value={VehicleType.BUS}>Ônibus</SelectItem>
                          <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                          <SelectItem value={VehicleType.OTHER}>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corolla" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 2020"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: ABC-1234" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Branco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustível</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o combustível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={FuelType.GASOLINE}>Gasolina</SelectItem>
                          <SelectItem value={FuelType.ETHANOL}>Álcool</SelectItem>
                          <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
                          <SelectItem value={FuelType.FLEX}>Flex</SelectItem>
                          <SelectItem value={FuelType.ELECTRIC}>Elétrico</SelectItem>
                          <SelectItem value={FuelType.HYBRID}>Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmissão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a transmissão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TransmissionType.MANUAL}>Manual</SelectItem>
                          <SelectItem value={TransmissionType.AUTOMATIC}>Automático</SelectItem>
                          <SelectItem value={TransmissionType.CVT}>CVT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1.8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quilometragem</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 50000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_market_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Mercado (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Ex: 45000.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tank_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade do Tanque (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 55"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9BR53ZEC4L4123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registro/RENAVAM</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="service_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ServiceType.MAINTENANCE}>Manutenção</SelectItem>
                          <SelectItem value={ServiceType.REPAIR}>Reparo</SelectItem>
                          <SelectItem value={ServiceType.INSPECTION}>Inspeção</SelectItem>
                          <SelectItem value={ServiceType.OTHER}>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria do Serviço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MECHANICAL, ELECTRICAL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade do Serviço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização do Veículo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Garagem Municipal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhes adicionais sobre o serviço solicitado..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/service-orders')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Criar Ordem de Serviço
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ServiceOrderForm;
