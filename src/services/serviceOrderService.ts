import { createClient } from '@supabase/supabase-js';
import { ServiceOrder, ServiceOrderStatus, VehicleType, FuelType, TransmissionType, ServiceType } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dybrlyssenhxbpnfhiwb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YnJseXNzZW5oeGJwbmZoaXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzA2NTgsImV4cCI6MjA2MDM0NjY1OH0.qeByyMkxftSK5P9JfDo5FFmq8Na4DgYlPTRxvWNcEuU';

// Create untyped client to avoid infinite type recursion
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock data for development when database is empty
const mockServiceOrders: ServiceOrder[] = [
  {
    id: "1",
    os_number: "OS001234",
    city_hall_id: "44af6935-b49d-4dc7-861d-4f3e33c5c2b3", // Current user
    vehicle_type: VehicleType.CAR,
    brand: "Toyota",
    model: "Corolla",
    fuel: FuelType.FLEX,
    year: 2020,
    engine: "1.8",
    color: "Prata",
    transmission: TransmissionType.AUTOMATIC,
    license_plate: "ABC-1234",
    chassis: "9BR53ZEC4L4123456",
    km: 45000,
    vehicle_market_value: 85000,
    registration: "1234567890",
    tank_capacity: 55,
    service_city: "São Paulo",
    service_type: ServiceType.MAINTENANCE,
    service_category: "MECHANICAL",
    vehicle_location: "Garagem Municipal",
    notes: "Revisão geral do veículo conforme cronograma de manutenção preventiva.",
    status: ServiceOrderStatus.SENT_FOR_QUOTES,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    sent_for_quotes_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
  {
    id: "2",
    os_number: "OS001235",
    city_hall_id: "44af6935-b49d-4dc7-861d-4f3e33c5c2b3",
    vehicle_type: VehicleType.TRUCK,
    brand: "Ford",
    model: "Cargo",
    fuel: FuelType.DIESEL,
    year: 2019,
    engine: "3.0",
    color: "Branco",
    transmission: TransmissionType.MANUAL,
    license_plate: "XYZ-5678",
    km: 120000,
    service_city: "São Paulo",
    service_type: ServiceType.REPAIR,
    service_category: "MECHANICAL",
    vehicle_location: "Pátio da Prefeitura",
    notes: "Reparo no sistema de freios e suspensão.",
    status: ServiceOrderStatus.DRAFT,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date().toISOString(),
  }
];

export const serviceOrderService = {
  // Get all service orders for a user (with proper filtering based on user type)
  async getServiceOrders(userId: string, userType: string) {
    try {
      let query = supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user type
      if (userType === 'CITY_HALL') {
        query = query.eq('city_hall_id', userId);
      }
      // For WORKSHOP users, we'll need to get service orders that are available for quoting
      // For now, let them see all service orders that are SENT_FOR_QUOTES
      else if (userType === 'WORKSHOP') {
        query = query.eq('status', 'SENT_FOR_QUOTES');
      }

      const { data, error } = await query;

      // If no data from database, use mock data for development
      if (!data || data.length === 0) {
        let filteredMockData = mockServiceOrders;
        
        if (userType === 'CITY_HALL') {
          filteredMockData = mockServiceOrders.filter(os => os.city_hall_id === userId);
        } else if (userType === 'WORKSHOP') {
          filteredMockData = mockServiceOrders.filter(os => os.status === ServiceOrderStatus.SENT_FOR_QUOTES);
        }
        
        return { data: filteredMockData, error: null };
      }

      if (error) {
        console.error('Error fetching service orders:', error);
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Service order fetch error:', error);
      return { data: null, error };
    }
  },

  // Get a single service order by ID
  async getServiceOrderById(id: string) {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', id)
        .single();

      // If no data from database, check mock data
      if (!data) {
        const mockData = mockServiceOrders.find(os => os.id === id);
        if (mockData) {
          return { data: mockData, error: null };
        }
      }

      if (error) {
        console.error('Error fetching service order:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Service order fetch error:', error);
      // Try mock data as fallback
      const mockData = mockServiceOrders.find(os => os.id === id);
      if (mockData) {
        return { data: mockData, error: null };
      }
      return { data: null, error };
    }
  },

  // Create a new service order
  async createServiceOrder(serviceOrderData: any) {
    try {
      // Generate OS number (simple increment for now)
      const timestamp = Date.now();
      const osNumber = `OS${timestamp.toString().slice(-6)}`;

      const insertData: any = {
        os_number: osNumber,
        city_hall_id: serviceOrderData.city_hall_id || '',
        status: 'DRAFT',
        vehicle_type: serviceOrderData.vehicle_type || 'CAR',
        brand: serviceOrderData.brand || '',
        model: serviceOrderData.model || '',
        fuel: serviceOrderData.fuel || 'GASOLINE',
        year: serviceOrderData.year || null,
        engine: serviceOrderData.engine || '',
        color: serviceOrderData.color || '',
        transmission: serviceOrderData.transmission || 'MANUAL',
        license_plate: serviceOrderData.license_plate || '',
        chassis: serviceOrderData.chassis || '',
        km: serviceOrderData.km || 0,
        vehicle_market_value: serviceOrderData.vehicle_market_value || 0,
        registration: serviceOrderData.registration || '',
        tank_capacity: serviceOrderData.tank_capacity || 0,
        service_city: serviceOrderData.service_city || '',
        service_type: serviceOrderData.service_type || 'MAINTENANCE',
        service_category: serviceOrderData.service_category || '',
        vehicle_location: serviceOrderData.vehicle_location || '',
        notes: serviceOrderData.notes || ''
      };

      const { data, error } = await supabase
        .from('service_orders')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating service order:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Service order creation error:', error);
      return { data: null, error };
    }
  },

  // Update service order status
  async updateServiceOrderStatus(id: string, status: string) {
    try {
      const updateData: any = { 
        status: status,
        updated_at: new Date().toISOString() 
      };

      const { data, error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating service order status:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Service order update error:', error);
      return { data: null, error };
    }
  }
};