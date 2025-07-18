
import { supabase } from '@/lib/supabase';
import { ServiceOrder, ServiceOrderStatus } from '@/types';

export const serviceOrderService = {
  // Get all service orders for a user (with proper filtering based on user type)
  async getServiceOrders(userId: string, userType: string) {
    try {
      let query = supabase
        .from('service_orders')
        .select('*')
        .order('createdAt', { ascending: false });

      // Filter based on user type
      if (userType === 'CITY_HALL') {
        query = query.eq('cityHallId', userId);
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
  async createServiceOrder(serviceOrderData: Partial<ServiceOrder>) {
    try {
      // Generate OS number (simple increment for now)
      const timestamp = Date.now();
      const osNumber = `OS${timestamp.toString().slice(-6)}`;

      const insertData = {
        number: osNumber,
        cityHallId: serviceOrderData.city_hall_id || '',
        status: 'DRAFT',
        vehicle: {
          type: serviceOrderData.vehicle_type || '',
          brand: serviceOrderData.brand || '',
          model: serviceOrderData.model || '',
          fuel: serviceOrderData.fuel || '',
          year: serviceOrderData.year?.toString() || '',
          engine: serviceOrderData.engine || '',
          color: serviceOrderData.color || '',
          transmission: serviceOrderData.transmission || '',
          licensePlate: serviceOrderData.license_plate || '',
          chassis: serviceOrderData.chassis || '',
          km: serviceOrderData.km || 0,
          marketValue: serviceOrderData.vehicle_market_value || 0,
          registration: serviceOrderData.registration || '',
          tankCapacity: serviceOrderData.tank_capacity || 0
        },
        serviceInfo: {
          city: serviceOrderData.service_city || '',
          type: serviceOrderData.service_type || '',
          category: serviceOrderData.service_category || '',
          location: serviceOrderData.vehicle_location || '',
          notes: serviceOrderData.notes || ''
        }
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
  async updateServiceOrderStatus(id: string, status: ServiceOrderStatus) {
    try {
      const updateData: Record<string, any> = { 
        status: status.toString(),
        updatedAt: new Date().toISOString() 
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
