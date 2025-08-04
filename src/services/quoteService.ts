import { Quote, QuoteStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Mock data for development until Supabase schema is ready
const mockQuotes: Quote[] = [
  {
    id: "1",
    service_order_id: "1", // Use actual service order IDs
    workshop_id: "workshop-1",
    quote_date: new Date().toISOString(),
    validity_days: 30,
    estimated_delivery_days: 7,
    estimated_start_days: 2,
    service_location: "Na oficina",
    notes: "Troca de óleo completa com filtros. Verificação geral do motor e sistemas.",
    total_parts_without_discount: 300.00,
    total_parts_discount: 30.00,
    total_parts_with_discount: 270.00,
    total_labor_without_discount: 200.00,
    total_labor_discount: 20.00,
    total_labor_with_discount: 180.00,
    total_without_discount: 500.00,
    total_discount: 50.00,
    total_with_discount: 450.00,
    status: QuoteStatus.SUBMITTED,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    workshop: {
      id: "workshop-1",
      user_type: "WORKSHOP" as any,
      login_number: "WS001",
      trade_name: "Oficina Premium Motors",
      corporate_name: "Premium Motors Ltda",
      cnpj: "12.345.678/0001-90",
      city: "São Paulo",
      state: "SP",
      address: "Rua das Oficinas, 123",
      responsible_email: "contato@premiummotors.com.br",
      contact_phone: "(11) 99999-8888",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workshops: {} as any
    }
  },
  {
    id: "2",
    service_order_id: "1", // Use actual service order IDs
    workshop_id: "workshop-2",
    quote_date: new Date().toISOString(),
    validity_days: 30,
    estimated_delivery_days: 5,
    estimated_start_days: 1,
    service_location: "Na oficina",
    notes: "Serviço de manutenção preventiva completa. Inclui revisão de freios, suspensão e troca de fluidos.",
    total_parts_without_discount: 400.00,
    total_parts_discount: 20.00,
    total_parts_with_discount: 380.00,
    total_labor_without_discount: 250.00,
    total_labor_discount: 25.00,
    total_labor_with_discount: 225.00,
    total_without_discount: 650.00,
    total_discount: 45.00,
    total_with_discount: 605.00,
    status: QuoteStatus.PENDING,
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updated_at: new Date().toISOString(),
    workshop: {
      id: "workshop-2",
      user_type: "WORKSHOP" as any,
      login_number: "WS002",
      trade_name: "Auto Center Silva",
      corporate_name: "Silva Auto Center Ltda",
      cnpj: "98.765.432/0001-10",
      city: "São Paulo",
      state: "SP",
      address: "Av. das Nações, 456",
      responsible_email: "silva@autocenter.com.br",
      contact_phone: "(11) 88888-7777",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workshops: {} as any
    }
  }
];

export const quoteService = {
  // Get all quotes for a specific service order
  async getQuotesByServiceOrderId(serviceOrderId: string) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('service_order_id', serviceOrderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return { data: [], error };
    }
  },

  // Get a specific quote by ID
  async getQuoteById(quoteId: string) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) {
        console.error('Error fetching quote:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching quote:', error);
      return { data: null, error };
    }
  },

  // Create a new quote (for workshops)
  async createQuote(quoteData: {
    service_order_id: string;
    workshop_id: string;
    notes?: string;
    estimated_delivery_days?: number;
  }) {
    try {
      const insertData = {
        service_order_id: quoteData.service_order_id,
        workshop_id: quoteData.workshop_id,
        date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        estimated_delivery_days: quoteData.estimated_delivery_days || 3,
        estimated_start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        items: [],
        totals: {
          labor_subtotal: 0,
          parts_subtotal: 0,
          labor_discount: 0,
          parts_discount: 0,
          subtotal: 0,
          taxes: 0,
          total: 0
        },
        status: 'PENDING',
        service_location: "Workshop Address",
        notes: quoteData.notes || ""
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating quote:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating quote:', error);
      return { data: null, error };
    }
  },

  // Update quote status
  async updateQuoteStatus(quoteId: string, status: QuoteStatus) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) {
        console.error('Error updating quote status:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating quote status:', error);
      return { data: null, error };
    }
  },
};