import { Quote, QuoteStatus } from "@/types";

// Mock data for development until Supabase schema is ready
const mockQuotes: Quote[] = [
  {
    id: "1",
    service_order_id: "test-id",
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
    service_order_id: "test-id",
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const quotes = mockQuotes.filter(q => q.service_order_id === serviceOrderId);
    return { data: quotes, error: null };
  },

  // Get a specific quote by ID
  async getQuoteById(quoteId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const quote = mockQuotes.find(q => q.id === quoteId);
    return quote ? { data: quote, error: null } : { data: null, error: new Error('Quote not found') };
  },

  // Create a new quote (for workshops)
  async createQuote(quoteData: {
    service_order_id: string;
    workshop_id: string;
    notes?: string;
    estimated_delivery_days?: number;
  }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      ...quoteData,
      quote_date: new Date().toISOString(),
      validity_days: 30,
      total_parts_without_discount: 0,
      total_parts_discount: 0,
      total_parts_with_discount: 0,
      total_labor_without_discount: 0,
      total_labor_discount: 0,
      total_labor_with_discount: 0,
      total_without_discount: 0,
      total_discount: 0,
      total_with_discount: 0,
      status: QuoteStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newQuote, error: null };
  },

  // Update quote status
  async updateQuoteStatus(quoteId: string, status: QuoteStatus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const quote = mockQuotes.find(q => q.id === quoteId);
    if (quote) {
      quote.status = status;
      quote.updated_at = new Date().toISOString();
      
      if (status === QuoteStatus.SUBMITTED) {
        quote.submitted_at = new Date().toISOString();
      }
      
      return { data: quote, error: null };
    }
    
    return { data: null, error: new Error('Quote not found') };
  },
};