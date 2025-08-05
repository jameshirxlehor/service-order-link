import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { quoteService } from '@/services/quoteService';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Loader2, 
  FileText, 
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unit_price: z.number().min(0, 'Preço deve ser positivo'),
  category: z.enum(['PARTS', 'LABOR']),
  brand: z.string().optional(),
  part_number: z.string().optional(),
});

const quoteSchema = z.object({
  estimated_delivery_days: z.number().min(1, 'Prazo deve ser maior que 0'),
  estimated_start_date: z.string().min(1, 'Data de início é obrigatória'),
  valid_until: z.string().min(1, 'Data de validade é obrigatória'),
  service_location: z.string().min(1, 'Local do serviço é obrigatório'),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos um item'),
  // Discount fields
  parts_discount_percentage: z.number().min(0).max(100).optional(),
  labor_discount_percentage: z.number().min(0).max(100).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormComponentProps {
  serviceOrder: any;
}

const QuoteFormComponent = ({ serviceOrder }: QuoteFormComponentProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      estimated_delivery_days: 3,
      service_location: 'Na oficina',
      items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          category: 'LABOR',
        }
      ],
      parts_discount_percentage: 0,
      labor_discount_percentage: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const watchedItems = form.watch('items');
  const partsDiscount = form.watch('parts_discount_percentage') || 0;
  const laborDiscount = form.watch('labor_discount_percentage') || 0;

  // Calculate totals
  const calculateTotals = () => {
    const partsSubtotal = watchedItems
      .filter(item => item.category === 'PARTS')
      .reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
    
    const laborSubtotal = watchedItems
      .filter(item => item.category === 'LABOR')
      .reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);

    const partsDiscountAmount = (partsSubtotal * partsDiscount) / 100;
    const laborDiscountAmount = (laborSubtotal * laborDiscount) / 100;

    const partsTotal = partsSubtotal - partsDiscountAmount;
    const laborTotal = laborSubtotal - laborDiscountAmount;
    const total = partsTotal + laborTotal;

    return {
      partsSubtotal,
      laborSubtotal,
      partsDiscountAmount,
      laborDiscountAmount,
      partsTotal,
      laborTotal,
      subtotal: partsSubtotal + laborSubtotal,
      totalDiscount: partsDiscountAmount + laborDiscountAmount,
      total
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: QuoteFormData) => {
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      const result = await quoteService.createQuote({
        service_order_id: id,
        workshop_id: user.id,
        date: new Date().toISOString(),
        valid_until: new Date(data.valid_until).toISOString(),
        estimated_delivery_days: data.estimated_delivery_days,
        estimated_start_date: new Date(data.estimated_start_date).toISOString(),
        service_location: data.service_location,
        notes: data.notes || '',
        status: 'PENDING',
        items: data.items,
        totals: {
          parts_subtotal: totals.partsSubtotal,
          labor_subtotal: totals.laborSubtotal,
          parts_discount: totals.partsDiscountAmount,
          labor_discount: totals.laborDiscountAmount,
          subtotal: totals.subtotal,
          total: totals.total
        }
      });

      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a cotação.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Cotação criada com sucesso.",
      });

      navigate(`/service-orders/${id}/quotes`);
    } catch (error) {
      console.error('Error creating quote:', error);
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
    <div className="max-w-6xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Service Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações da Ordem de Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Veículo</span>
                  <p className="font-medium">{serviceOrder.brand} {serviceOrder.model} ({serviceOrder.year})</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Placa</span>
                  <p className="font-medium">{serviceOrder.license_plate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Tipo de Serviço</span>
                  <p className="font-medium">{serviceOrder.service_type}</p>
                </div>
              </div>
              {serviceOrder.notes && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-muted-foreground">Observações da OS</span>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{serviceOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalhes da Cotação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_delivery_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Entrega (dias) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="estimated_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válida até *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local do Serviço *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o local" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Na oficina">Na oficina</SelectItem>
                          <SelectItem value="No local do cliente">No local do cliente</SelectItem>
                          <SelectItem value="Guincho + oficina">Guincho + oficina</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Observações da Cotação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre a cotação..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Itens da Cotação
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    category: 'LABOR',
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Troca de óleo motor"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LABOR">Mão de obra</SelectItem>
                              <SelectItem value="PARTS">Peças</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Unitário *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Total do Item</FormLabel>
                      <div className="mt-2 p-2 bg-muted rounded">
                        <span className="font-medium">
                          R$ {((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {watchedItems[index]?.category === 'PARTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.brand`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca da Peça</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Bosch" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.part_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código da Peça</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 0280158017" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Discounts and Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Descontos e Totais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parts_discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto em Peças (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="labor_discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto em Mão de Obra (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal Peças:</span>
                    <span>R$ {totals.partsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Desconto Peças ({partsDiscount}%):</span>
                    <span>- R$ {totals.partsDiscountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Peças:</span>
                    <span>R$ {totals.partsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal Mão de Obra:</span>
                    <span>R$ {totals.laborSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Desconto M.O. ({laborDiscount}%):</span>
                    <span>- R$ {totals.laborDiscountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Mão de Obra:</span>
                    <span>R$ {totals.laborTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-right space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Subtotal Geral:</span>
                  <span>R$ {totals.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Desconto Total:</span>
                  <span>- R$ {totals.totalDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>TOTAL FINAL:</span>
                  <span>R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/service-orders/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Enviar Cotação
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

export default QuoteFormComponent;