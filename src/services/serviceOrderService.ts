import { supabase } from "@/integrations/supabase/client";
import { ServiceOrder, ServiceOrderStatus, VehicleType, FuelType, TransmissionType, ServiceType } from '@/types';

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
        .select(`
          id,
          number,
          city_hall_id,
          status,
          created_at,
          updated_at,
          vehicle,
          service_info
        `)
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
        return { data: [], error };
      }

      // Transform data to match expected format
      const transformedData = (data || []).map((order: any) => ({
        id: order.id,
        os_number: order.number,
        city_hall_id: order.city_hall_id,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Vehicle data
        vehicle_type: order.vehicle?.type || 'CAR',
        brand: order.vehicle?.brand || '',
        model: order.vehicle?.model || '',
        year: order.vehicle?.year || null,
        license_plate: order.vehicle?.license_plate || '',
        fuel: order.vehicle?.fuel || 'GASOLINE',
        transmission: order.vehicle?.transmission || 'MANUAL',
        color: order.vehicle?.color || '',
        engine: order.vehicle?.engine || '',
        chassis: order.vehicle?.chassis || '',
        km: order.vehicle?.km || 0,
        vehicle_market_value: order.vehicle?.market_value || 0,
        registration: order.vehicle?.registration || '',
        tank_capacity: order.vehicle?.tank_capacity || 0,
        // Service data
        service_type: order.service_info?.type || 'MAINTENANCE',
        service_category: order.service_info?.category || '',
        service_city: order.service_info?.city || '',
        vehicle_location: order.service_info?.location || '',
        notes: order.service_info?.notes || ''
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Service order fetch error:', error);
      return { data: [], error };
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
        // Return mock data if not found in database
        const mockOrder = mockServiceOrders.find(order => order.id === id);
        if (mockOrder) {
          return { data: mockOrder, error: null };
        }
        throw error;
      }

      // Transform data to match expected format
      const vehicle = data.vehicle as any || {};
      const serviceInfo = data.service_info as any || {};
      
      const transformedData = {
        id: data.id,
        os_number: data.number || `OS${data.id?.slice(-6)}`,
        city_hall_id: data.city_hall_id,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Vehicle data
        vehicle_type: vehicle.type || 'CAR',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || null,
        license_plate: vehicle.license_plate || '',
        fuel: vehicle.fuel || 'GASOLINE',
        transmission: vehicle.transmission || 'MANUAL',
        color: vehicle.color || '',
        engine: vehicle.engine || '',
        chassis: vehicle.chassis || '',
        km: vehicle.km || 0,
        vehicle_market_value: vehicle.market_value || 0,
        registration: vehicle.registration || '',
        tank_capacity: vehicle.tank_capacity || 0,
        // Service data
        service_type: serviceInfo.type || 'MAINTENANCE',
        service_category: serviceInfo.category || '',
        service_city: serviceInfo.city || '',
        vehicle_location: serviceInfo.location || '',
        description: serviceInfo.notes || '',
        notes: serviceInfo.notes || '',
        // Contact info (will be available when contact_info field is added)
        contact_name: '',
        contact_phone: '',
        contact_email: ''
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Service order fetch error:', error);
      // Return mock data if error
      const mockOrder = mockServiceOrders.find(order => order.id === id);
      if (mockOrder) {
        return { data: mockOrder, error: null };
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

      const insertData = {
        number: osNumber,
        city_hall_id: serviceOrderData.city_hall_id || '',
        status: 'DRAFT',
        vehicle: {
          type: serviceOrderData.vehicle_type || 'CAR',
          brand: serviceOrderData.brand || '',
          model: serviceOrderData.model || '',
          year: serviceOrderData.year || null,
          license_plate: serviceOrderData.license_plate || '',
          fuel: serviceOrderData.fuel || 'GASOLINE',
          transmission: serviceOrderData.transmission || 'MANUAL',
          color: serviceOrderData.color || '',
          engine: serviceOrderData.engine || '',
          chassis: serviceOrderData.chassis || '',
          km: serviceOrderData.km || 0,
          market_value: serviceOrderData.vehicle_market_value || 0,
          registration: serviceOrderData.registration || '',
          tank_capacity: serviceOrderData.tank_capacity || 0
        },
        service_info: {
          type: serviceOrderData.service_type || 'MAINTENANCE',
          category: serviceOrderData.service_category || '',
          city: serviceOrderData.service_city || '',
          location: serviceOrderData.vehicle_location || '',
          notes: serviceOrderData.notes || ''
        },
        sent_to_workshops: []
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