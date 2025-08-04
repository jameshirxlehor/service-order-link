import { supabase } from "@/integrations/supabase/client";
import { UserType } from "@/types";

export const dashboardService = {
  // Get dashboard stats for City Hall users
  async getCityHallStats(cityHallId: string) {
    try {
      // Get active service orders
      const { data: serviceOrders, error: soError } = await supabase
        .from('service_orders')
        .select('id, status, created_at')
        .eq('city_hall_id', cityHallId);

      if (soError) throw soError;

      // Get pending quotes for city hall's service orders
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, service_order_id')
        .in('service_order_id', serviceOrders?.map(so => so.id) || [])
        .eq('status', 'PENDING');

      if (quotesError) throw quotesError;

      return {
        data: {
          activeServiceOrders: serviceOrders?.length || 0,
          pendingQuotes: quotes?.length || 0,
          recentServiceOrders: serviceOrders?.slice(0, 5) || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching city hall stats:', error);
      return { data: null, error };
    }
  },

  // Get dashboard stats for Workshop users
  async getWorkshopStats(workshopId: string) {
    try {
      // Get available service orders (sent for quotes but workshop hasn't quoted yet)
      const { data: availableOrders, error: aoError } = await supabase
        .from('service_orders')
        .select('id, status, created_at')
        .eq('status', 'SENT_FOR_QUOTES');

      if (aoError) throw aoError;

      // Get workshop's quotes
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, created_at, service_order_id')
        .eq('workshop_id', workshopId);

      if (quotesError) throw quotesError;

      const submittedQuotes = quotes?.length || 0;
      const acceptedQuotes = quotes?.filter(q => q.status === 'ACCEPTED').length || 0;

      return {
        data: {
          availableOrders: availableOrders?.length || 0,
          submittedQuotes,
          acceptedQuotes,
          recentOrders: availableOrders?.slice(0, 5) || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching workshop stats:', error);
      return { data: null, error };
    }
  },

  // Get dashboard stats for Query Admin users
  async getQueryAdminStats() {
    try {
      // Get all service orders
      const { data: serviceOrders, error: soError } = await supabase
        .from('service_orders')
        .select('id, status, created_at');

      if (soError) throw soError;

      // Get all quotes
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, created_at');

      if (quotesError) throw quotesError;

      const totalOrders = serviceOrders?.length || 0;
      const completedOrders = serviceOrders?.filter(so => so.status === 'COMPLETED').length || 0;
      const pendingQuotes = quotes?.filter(q => q.status === 'PENDING').length || 0;

      return {
        data: {
          totalServiceOrders: totalOrders,
          completedOrders,
          pendingQuotes,
          recentActivity: serviceOrders?.slice(0, 5) || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching query admin stats:', error);
      return { data: null, error };
    }
  },

  // Get dashboard stats for General Admin users
  async getGeneralAdminStats() {
    try {
      // Get all service orders
      const { data: serviceOrders, error: soError } = await supabase
        .from('service_orders')
        .select('id, status, created_at');

      if (soError) throw soError;

      // Get city halls count
      const { data: cityHalls, error: chError } = await supabase
        .from('city_halls')
        .select('id');

      if (chError) throw chError;

      // Get workshops count
      const { data: workshops, error: wError } = await supabase
        .from('workshops')
        .select('id');

      if (wError) throw wError;

      // Get all users count
      const { data: users, error: uError } = await supabase
        .from('user_profiles')
        .select('id');

      if (uError) throw uError;

      const totalOrders = serviceOrders?.length || 0;
      const completedOrders = serviceOrders?.filter(so => so.status === 'COMPLETED').length || 0;

      return {
        data: {
          totalServiceOrders: totalOrders,
          completedOrders,
          cityHallsCount: cityHalls?.length || 0,
          workshopsCount: workshops?.length || 0,
          totalUsers: users?.length || 0,
          recentServiceOrders: serviceOrders?.slice(0, 5) || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching general admin stats:', error);
      return { data: null, error };
    }
  }
};