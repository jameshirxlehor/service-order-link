import { UserProfile, UserType } from "@/types";

// Mock data for development when database is empty
const mockUsers: (UserProfile & { 
  name?: string; 
  email?: string; 
  phone?: string; 
  login?: string;
  role?: UserType;
  created_at: string;
})[] = [
  {
    id: "1",
    user_type: UserType.GENERAL_ADMIN,
    login_number: "admin001",
    trade_name: "Administrador Geral",
    responsible_email: "admin@sistema.com.br",
    contact_phone: "(11) 99999-9999",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    updated_at: new Date().toISOString(),
    // Legacy compatibility fields
    name: "Administrador Geral",
    email: "admin@sistema.com.br",
    phone: "(11) 99999-9999",
    login: "admin001",
    role: UserType.GENERAL_ADMIN,
  },
  {
    id: "2",
    user_type: UserType.CITY_HALL,
    login_number: "pref001",
    trade_name: "Prefeitura de São Paulo",
    corporate_name: "Prefeitura Municipal de São Paulo",
    cnpj: "11.222.333/0001-44",
    state_registration: "123456789",
    city: "São Paulo",
    state: "SP",
    zip_code: "01001-000",
    address: "Praça da Sé, s/n",
    responsible_email: "contato@prefeitura.sp.gov.br",
    contact_phone: "(11) 3333-1000",
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString(),
    // Legacy compatibility fields
    name: "Prefeitura de São Paulo",
    email: "contato@prefeitura.sp.gov.br",
    phone: "(11) 3333-1000",
    login: "pref001",
    role: UserType.CITY_HALL,
  },
  {
    id: "3",
    user_type: UserType.WORKSHOP,
    login_number: "of001",
    trade_name: "Oficina Auto Center",
    corporate_name: "Auto Center Mecânica e Elétrica Ltda",
    cnpj: "22.333.444/0001-55",
    state_registration: "987654321",
    city: "São Paulo",
    state: "SP",
    zip_code: "04567-000",
    address: "Rua das Oficinas, 123",
    responsible_email: "contato@autocentermec.com.br",
    contact_phone: "(11) 4444-2000",
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
    // Legacy compatibility fields
    name: "Oficina Auto Center",
    email: "contato@autocentermec.com.br",
    phone: "(11) 4444-2000",
    login: "of001",
    role: UserType.WORKSHOP,
  },
  {
    id: "4",
    user_type: UserType.QUERY_ADMIN,
    login_number: "cons001",
    trade_name: "Consultor do Sistema",
    responsible_email: "consultor@sistema.com.br",
    contact_phone: "(11) 5555-3000",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
    // Legacy compatibility fields
    name: "Consultor do Sistema",
    email: "consultor@sistema.com.br",
    phone: "(11) 5555-3000",
    login: "cons001",
    role: UserType.QUERY_ADMIN,
  }
];

export interface CreateUserData {
  user_type: UserType;
  login_number: string;
  trade_name?: string;
  corporate_name?: string;
  cnpj?: string;
  state_registration?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address?: string;
  responsible_email: string;
  contact_phone?: string;
  // City Hall specific fields
  parts_discount_percentage?: number;
  labor_discount_percentage?: number;
  ir_labor?: number;
  ir_parts?: number;
  pis_labor?: number;
  pis_parts?: number;
  cofins_labor?: number;
  cofins_parts?: number;
  csll_labor?: number;
  csll_parts?: number;
  // Workshop specific fields
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;
}

export const userService = {
  // Get all users
  async getAllUsers(roleFilter?: string) {
    try {
      // Use mock data for development
      let filteredMockData = mockUsers;
      
      if (roleFilter && roleFilter !== 'all') {
        filteredMockData = mockUsers.filter(user => user.user_type === roleFilter);
      }
      
      return { data: filteredMockData, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], error };
    }
  },

  // Get user by ID
  async getUserById(id: string) {
    try {
      // Use mock data for development
      const mockData = mockUsers.find(user => user.id === id);
      if (mockData) {
        return { data: mockData, error: null };
      }
      return { data: null, error: new Error('User not found') };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error };
    }
  },

  // Create new user
  async createUser(userData: CreateUserData) {
    try {
      // For mock data, generate a new ID and add to mock array
      const newUser: UserProfile & { 
        name?: string; 
        email?: string; 
        phone?: string; 
        login?: string;
        role?: UserType;
      } = {
        id: `mock-${Date.now()}`,
        user_type: userData.user_type,
        login_number: userData.login_number,
        trade_name: userData.trade_name,
        corporate_name: userData.corporate_name,
        cnpj: userData.cnpj,
        state_registration: userData.state_registration,
        city: userData.city,
        state: userData.state,
        zip_code: userData.zip_code,
        address: userData.address,
        responsible_email: userData.responsible_email,
        contact_phone: userData.contact_phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Legacy compatibility fields
        name: userData.trade_name || userData.responsible_email,
        email: userData.responsible_email,
        phone: userData.contact_phone || '',
        login: userData.login_number,
        role: userData.user_type,
      };

      // Add to mock data for immediate display
      mockUsers.unshift(newUser);
      
      // For development, just use mock data
      console.log('Created new user (mock):', newUser);

      return { data: newUser, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error };
    }
  },

  // Update user
  async updateUser(id: string, userData: Partial<CreateUserData>) {
    try {
      // Update in mock data first
      const mockIndex = mockUsers.findIndex(user => user.id === id);
      if (mockIndex !== -1) {
        mockUsers[mockIndex] = {
          ...mockUsers[mockIndex],
          ...userData,
          updated_at: new Date().toISOString(),
          // Update legacy fields
          name: userData.trade_name || mockUsers[mockIndex].name,
          email: userData.responsible_email || mockUsers[mockIndex].email,
          phone: userData.contact_phone || mockUsers[mockIndex].phone,
          login: userData.login_number || mockUsers[mockIndex].login,
        };
      }

      // For development, just use mock data
      console.log('Updated user (mock):', mockUsers[mockIndex]);

      return { data: mockUsers[mockIndex], error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  },

  // Delete user
  async deleteUser(id: string) {
    try {
      // Remove from mock data first
      const mockIndex = mockUsers.findIndex(user => user.id === id);
      if (mockIndex !== -1) {
        mockUsers.splice(mockIndex, 1);
      }

      // For development, just use mock data
      console.log('Deleted user (mock):', id);

      return { error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error };
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const { data: users } = await this.getAllUsers();
      
      const stats = {
        total: users?.length || 0,
        cityHalls: users?.filter(u => u.user_type === UserType.CITY_HALL).length || 0,
        workshops: users?.filter(u => u.user_type === UserType.WORKSHOP).length || 0,
        queryAdmins: users?.filter(u => u.user_type === UserType.QUERY_ADMIN).length || 0,
        generalAdmins: users?.filter(u => u.user_type === UserType.GENERAL_ADMIN).length || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
  }
};