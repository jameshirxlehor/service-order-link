
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      city_halls: {
        Row: {
          id: string
          profile_id: string
          tradeName: string
          corporateName: string
          cnpj: string
          stateRegistration: string
          city: string
          state: string
          zipCode: string
          address: string
          discountPercentage: number
          taxInfo: {
            ir: number
            pis: number
            cofins: number
            csll: number
            laborTax: number
            partsTax: number
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          tradeName: string
          corporateName: string
          cnpj: string
          stateRegistration: string
          city: string
          state: string
          zipCode: string
          address: string
          discountPercentage: number
          taxInfo: {
            ir: number
            pis: number
            cofins: number
            csll: number
            laborTax: number
            partsTax: number
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          tradeName?: string
          corporateName?: string
          cnpj?: string
          stateRegistration?: string
          city?: string
          state?: string
          zipCode?: string
          address?: string
          discountPercentage?: number
          taxInfo?: {
            ir: number
            pis: number
            cofins: number
            csll: number
            laborTax: number
            partsTax: number
          }
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          serviceOrderId: string
          workshopId: string
          status: string
          date: string
          validUntil: string
          estimatedDeliveryDays: number
          estimatedStartDate: string
          serviceLocation: string
          notes: string
          items: Json[]
          totals: {
            totalPartsWithoutDiscount: number
            partsDiscount: number
            partsDiscountPercentage: number
            totalPartsWithDiscount: number
            totalLaborWithoutDiscount: number
            laborDiscount: number
            laborDiscountPercentage: number
            totalLaborWithDiscount: number
            totalWithoutDiscount: number
            totalDiscount: number
            totalDiscountPercentage: number
            totalWithDiscount: number
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          serviceOrderId: string
          workshopId: string
          status: string
          date: string
          validUntil: string
          estimatedDeliveryDays: number
          estimatedStartDate: string
          serviceLocation: string
          notes: string
          items: Json[]
          totals: {
            totalPartsWithoutDiscount: number
            partsDiscount: number
            partsDiscountPercentage: number
            totalPartsWithDiscount: number
            totalLaborWithoutDiscount: number
            laborDiscount: number
            laborDiscountPercentage: number
            totalLaborWithDiscount: number
            totalWithoutDiscount: number
            totalDiscount: number
            totalDiscountPercentage: number
            totalWithDiscount: number
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          serviceOrderId?: string
          workshopId?: string
          status?: string
          date?: string
          validUntil?: string
          estimatedDeliveryDays?: number
          estimatedStartDate?: string
          serviceLocation?: string
          notes?: string
          items?: Json[]
          totals?: {
            totalPartsWithoutDiscount: number
            partsDiscount: number
            partsDiscountPercentage: number
            totalPartsWithDiscount: number
            totalLaborWithoutDiscount: number
            laborDiscount: number
            laborDiscountPercentage: number
            totalLaborWithDiscount: number
            totalWithoutDiscount: number
            totalDiscount: number
            totalDiscountPercentage: number
            totalWithDiscount: number
          }
          created_at?: string
          updated_at?: string
        }
      }
      service_order_history: {
        Row: {
          id: string
          serviceOrderId: string
          action: string
          userId: string
          userRole: string
          details: string
          timestamp: string
        }
        Insert: {
          id?: string
          serviceOrderId: string
          action: string
          userId: string
          userRole: string
          details: string
          timestamp: string
        }
        Update: {
          id?: string
          serviceOrderId?: string
          action?: string
          userId?: string
          userRole?: string
          details?: string
          timestamp?: string
        }
      }
      service_orders: {
        Row: {
          id: string
          number: string
          cityHallId: string
          status: string
          vehicle: {
            type: string
            brand: string
            model: string
            fuel: string
            year: string
            engine: string
            color: string
            transmission: string
            licensePlate: string
            chassis: string
            km: number
            marketValue: number
            registration: string
            tankCapacity: number
          }
          serviceInfo: {
            city: string
            type: string
            category: string
            location: string
            notes: string
          }
          sentToWorkshops: string[]
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          number: string
          cityHallId: string
          status: string
          vehicle: {
            type: string
            brand: string
            model: string
            fuel: string
            year: string
            engine: string
            color: string
            transmission: string
            licensePlate: string
            chassis: string
            km: number
            marketValue: number
            registration: string
            tankCapacity: number
          }
          serviceInfo: {
            city: string
            type: string
            category: string
            location: string
            notes: string
          }
          sentToWorkshops?: string[]
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          number?: string
          cityHallId?: string
          status?: string
          vehicle?: {
            type: string
            brand: string
            model: string
            fuel: string
            year: string
            engine: string
            color: string
            transmission: string
            licensePlate: string
            chassis: string
            km: number
            marketValue: number
            registration: string
            tankCapacity: number
          }
          serviceInfo?: {
            city: string
            type: string
            category: string
            location: string
            notes: string
          }
          sentToWorkshops?: string[]
          createdAt?: string
          updatedAt?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          auth_id: string
          login: string
          role: string
          name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          login: string
          role: string
          name: string
          email: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          login?: string
          role?: string
          name?: string
          email?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          profile_id: string
          tradeName: string
          corporateName: string
          cnpj: string
          stateRegistration: string
          city: string
          state: string
          zipCode: string
          address: string
          accreditedCityHalls: string[]
          bankDetails: {
            bank: string
            branch: string
            account: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          tradeName: string
          corporateName: string
          cnpj: string
          stateRegistration: string
          city: string
          state: string
          zipCode: string
          address: string
          accreditedCityHalls: string[]
          bankDetails: {
            bank: string
            branch: string
            account: string
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          tradeName?: string
          corporateName?: string
          cnpj?: string
          stateRegistration?: string
          city?: string
          state?: string
          zipCode?: string
          address?: string
          accreditedCityHalls?: string[]
          bankDetails?: {
            bank: string
            branch: string
            account: string
          }
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
