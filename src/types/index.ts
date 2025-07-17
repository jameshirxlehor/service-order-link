// Enums matching database schema
export enum UserType {
  CITY_HALL = 'CITY_HALL',
  WORKSHOP = 'WORKSHOP',
  QUERY_ADMIN = 'QUERY_ADMIN',
  GENERAL_ADMIN = 'GENERAL_ADMIN'
}

export enum ServiceOrderStatus {
  DRAFT = 'DRAFT',
  SENT_FOR_QUOTES = 'SENT_FOR_QUOTES',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  // Legacy compatibility
  SENT = 'SENT_FOR_QUOTES',
  REJECTED = 'CANCELLED',
  COMPLETED = 'ACCEPTED'
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum VehicleType {
  CAR = 'CAR',
  TRUCK = 'TRUCK',
  MOTORCYCLE = 'MOTORCYCLE',
  BUS = 'BUS',
  VAN = 'VAN',
  OTHER = 'OTHER'
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  ETHANOL = 'ETHANOL',
  DIESEL = 'DIESEL',
  FLEX = 'FLEX',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT',
  // Legacy compatibility
  SEMI_AUTOMATIC = 'CVT'
}

export enum ServiceType {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  OTHER = 'OTHER'
}

// Legacy compatibility constants
export const ServiceTypeLegacy = {
  PREVENTIVE: 'MAINTENANCE',
  CORRECTIVE: 'REPAIR',
  EMERGENCY: 'REPAIR'
} as const;

export enum ServiceCategory {
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  BODY_WORK = 'BODY_WORK',
  PAINTING = 'PAINTING',
  TIRE = 'TIRE',
  GLASS = 'GLASS',
  OTHER = 'OTHER'
}

export enum ItemType {
  PART = 'PART',
  LABOR = 'LABOR',
  SERVICE = 'SERVICE'
}

export enum ItemCategory {
  ENGINE = 'ENGINE',
  TRANSMISSION = 'TRANSMISSION',
  BRAKE = 'BRAKE',
  SUSPENSION = 'SUSPENSION',
  ELECTRICAL = 'ELECTRICAL',
  BODY = 'BODY',
  OTHER = 'OTHER'
}

// Main user profile interface
export interface UserProfile {
  id: string;
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
  created_at: string;
  updated_at: string;
}

// City Hall specific data
export interface CityHall {
  user_id: string;
  parts_discount_percentage: number;
  labor_discount_percentage: number;
  ir_labor: number;
  ir_parts: number;
  pis_labor: number;
  pis_parts: number;
  cofins_labor: number;
  cofins_parts: number;
  csll_labor: number;
  csll_parts: number;
}

// Workshop specific data
export interface Workshop {
  user_id: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;
}

// Workshop accreditation
export interface WorkshopAccreditation {
  id: string;
  workshop_id: string;
  city_hall_id: string;
  created_at: string;
}

// Service Order interface
export interface ServiceOrder {
  id: string;
  os_number: string;
  city_hall_id: string;
  
  // Vehicle information
  vehicle_type: VehicleType;
  brand?: string;
  model?: string;
  fuel?: FuelType;
  year?: number;
  engine?: string;
  color?: string;
  transmission?: TransmissionType;
  license_plate?: string;
  chassis?: string;
  km?: number;
  vehicle_market_value?: number;
  registration?: string;
  tank_capacity?: number;
  
  // Service information
  service_city?: string;
  service_type?: ServiceType;
  service_category?: string;
  vehicle_location?: string;
  notes?: string;
  
  // Status and dates
  status: ServiceOrderStatus;
  created_at: string;
  updated_at: string;
  sent_for_quotes_at?: string;
  cancelled_at?: string;
  
  // Relations
  city_hall?: UserProfile & { city_halls: CityHall };
  quotes?: Quote[];
}

// Quote interface
export interface Quote {
  id: string;
  service_order_id: string;
  workshop_id: string;
  
  // Quote information
  quote_date: string;
  validity_days: number;
  estimated_delivery_days?: number;
  estimated_start_days?: number;
  service_location?: string;
  notes?: string;
  
  // Calculated totals
  total_parts_without_discount: number;
  total_parts_discount: number;
  total_parts_with_discount: number;
  total_labor_without_discount: number;
  total_labor_discount: number;
  total_labor_with_discount: number;
  total_without_discount: number;
  total_discount: number;
  total_with_discount: number;
  
  // Status and dates
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  responded_at?: string;
  
  // Relations
  workshop?: UserProfile & { workshops: Workshop };
  quote_items?: QuoteItem[];
}

// Quote Item interface
export interface QuoteItem {
  id: string;
  quote_id: string;
  
  // Item information
  code?: string;
  description: string;
  brand?: string;
  category?: string;
  item_type?: string;
  
  // Quantities and values
  quantity: number;
  unit_value: number;
  
  // Parts calculations
  parts_discount_percentage: number;
  parts_value_with_discount: number;
  
  // Labor information
  labor_hours: number;
  labor_hour_value: number;
  labor_value: number;
  labor_discount_percentage: number;
  labor_value_with_discount: number;
  
  // Warranty
  warranty_days: number;
  warranty_km: number;
  
  // Total item value
  total_item_value: number;
  
  created_at: string;
  updated_at: string;
}

// Service Order History
export interface ServiceOrderHistory {
  id: string;
  service_order_id: string;
  user_id?: string;
  action: string;
  description?: string;
  metadata?: any;
  created_at: string;
  
  // Relations
  user?: UserProfile;
}

// Notification interface
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  service_order_id?: string;
  quote_id?: string;
  created_at: string;
}

// Legacy compatibility - map old interfaces to new ones
export const UserRole = UserType;

// Legacy User interface (for backward compatibility)
export interface User {
  id: string;
  login: string;
  role: UserType;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy CityHall interface (for backward compatibility) 
export interface CityHall_Legacy extends User {
  tradeName: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  discountPercentage: number;
  taxInfo: {
    ir: number;
    pis: number;
    cofins: number;
    csll: number;
    laborTax: number;
    partsTax: number;
  };
}

// Legacy Workshop interface (for backward compatibility)
export interface Workshop_Legacy extends User {
  tradeName: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  accreditedCityHalls: string[];
  bankDetails: {
    bank: string;
    branch: string;
    account: string;
  };
}

// Legacy Admin interface (for backward compatibility)
export interface Admin extends User {
  name: string;
}