export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      city_halls: {
        Row: {
          address: string
          city: string
          cnpj: string
          corporate_name: string
          created_at: string
          discount_percentage: number
          id: string
          profile_id: string | null
          state: string
          state_registration: string | null
          tax_info: Json
          trade_name: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          cnpj: string
          corporate_name: string
          created_at?: string
          discount_percentage?: number
          id?: string
          profile_id?: string | null
          state: string
          state_registration?: string | null
          tax_info?: Json
          trade_name: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          cnpj?: string
          corporate_name?: string
          created_at?: string
          discount_percentage?: number
          id?: string
          profile_id?: string | null
          state?: string
          state_registration?: string | null
          tax_info?: Json
          trade_name?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_halls_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          date: string
          estimated_delivery_days: number
          estimated_start_date: string
          id: string
          items: Json[]
          notes: string | null
          service_location: string
          service_order_id: string | null
          status: string
          totals: Json
          updated_at: string
          valid_until: string
          workshop_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          estimated_delivery_days: number
          estimated_start_date: string
          id?: string
          items?: Json[]
          notes?: string | null
          service_location: string
          service_order_id?: string | null
          status: string
          totals: Json
          updated_at?: string
          valid_until: string
          workshop_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          estimated_delivery_days?: number
          estimated_start_date?: string
          id?: string
          items?: Json[]
          notes?: string | null
          service_location?: string
          service_order_id?: string | null
          status?: string
          totals?: Json
          updated_at?: string
          valid_until?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_history: {
        Row: {
          action: string
          details: string | null
          id: string
          service_order_id: string | null
          timestamp: string
          user_id: string | null
          user_role: string
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          service_order_id?: string | null
          timestamp?: string
          user_id?: string | null
          user_role: string
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          service_order_id?: string | null
          timestamp?: string
          user_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_history_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          city_hall_id: string | null
          created_at: string
          id: string
          number: string
          sent_to_workshops: string[]
          service_info: Json
          status: string
          updated_at: string
          vehicle: Json
        }
        Insert: {
          city_hall_id?: string | null
          created_at?: string
          id?: string
          number: string
          sent_to_workshops?: string[]
          service_info: Json
          status: string
          updated_at?: string
          vehicle: Json
        }
        Update: {
          city_hall_id?: string | null
          created_at?: string
          id?: string
          number?: string
          sent_to_workshops?: string[]
          service_info?: Json
          status?: string
          updated_at?: string
          vehicle?: Json
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_city_hall_id_fkey"
            columns: ["city_hall_id"]
            isOneToOne: false
            referencedRelation: "city_halls"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_id: string | null
          created_at: string
          id: string
          login: string
          name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          id?: string
          login: string
          name?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          id?: string
          login?: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      workshops: {
        Row: {
          accredited_city_halls: string[]
          address: string
          bank_details: Json
          city: string
          cnpj: string
          corporate_name: string
          created_at: string
          id: string
          profile_id: string | null
          state: string
          state_registration: string | null
          trade_name: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          accredited_city_halls?: string[]
          address: string
          bank_details?: Json
          city: string
          cnpj: string
          corporate_name: string
          created_at?: string
          id?: string
          profile_id?: string | null
          state: string
          state_registration?: string | null
          trade_name: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          accredited_city_halls?: string[]
          address?: string
          bank_details?: Json
          city?: string
          cnpj?: string
          corporate_name?: string
          created_at?: string
          id?: string
          profile_id?: string | null
          state?: string
          state_registration?: string | null
          trade_name?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
