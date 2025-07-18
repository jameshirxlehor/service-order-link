import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dybrlyssenhxbpnfhiwb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YnJseXNzZW5oeGJwbmZoaXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzA2NTgsImV4cCI6MjA2MDM0NjY1OH0.qeByyMkxftSK5P9JfDo5FFmq8Na4DgYlPTRxvWNcEuU';

// Create untyped client to avoid infinite type recursion
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

      if (error) {
        console.error('Error fetching service order:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Service order fetch error:', error);
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