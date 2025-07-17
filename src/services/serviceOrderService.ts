
import { supabase } from '@/lib/supabase';
import { ServiceOrder, ServiceOrderStatus } from '@/types';

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
        query = query.eq('status', ServiceOrderStatus.SENT_FOR_QUOTES);
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
      const { data: existingOrders } = await supabase
        .from('service_orders')
        .select('os_number')
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (existingOrders && existingOrders.length > 0) {
        const lastNumber = parseInt(existingOrders[0].os_number.replace(/\D/g, '')) || 0;
        nextNumber = lastNumber + 1;
      }

      const osNumber = `OS${nextNumber.toString().padStart(6, '0')}`;

      const { data, error } = await supabase
        .from('service_orders')
        .insert([{
          os_number: osNumber,
          city_hall_id: serviceOrderData.city_hall_id,
          vehicle_type: serviceOrderData.vehicle_type,
          brand: serviceOrderData.brand,
          model: serviceOrderData.model,
          fuel: serviceOrderData.fuel,
          year: serviceOrderData.year,
          engine: serviceOrderData.engine,
          color: serviceOrderData.color,
          transmission: serviceOrderData.transmission,
          license_plate: serviceOrderData.license_plate,
          chassis: serviceOrderData.chassis,
          km: serviceOrderData.km,
          vehicle_market_value: serviceOrderData.vehicle_market_value,
          registration: serviceOrderData.registration,
          tank_capacity: serviceOrderData.tank_capacity,
          service_city: serviceOrderData.service_city,
          service_type: serviceOrderData.service_type,
          service_category: serviceOrderData.service_category,
          vehicle_location: serviceOrderData.vehicle_location,
          notes: serviceOrderData.notes,
          status: ServiceOrderStatus.DRAFT
        }])
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
      const updateData: any = { status, updated_at: new Date().toISOString() };
      
      if (status === ServiceOrderStatus.SENT_FOR_QUOTES) {
        updateData.sent_for_quotes_at = new Date().toISOString();
      } else if (status === ServiceOrderStatus.CANCELLED) {
        updateData.cancelled_at = new Date().toISOString();
      }

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
