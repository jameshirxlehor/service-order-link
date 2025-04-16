
// User types
export enum UserRole {
  CITY_HALL = "CITY_HALL",
  WORKSHOP = "WORKSHOP",
  QUERY_ADMIN = "QUERY_ADMIN",
  GENERAL_ADMIN = "GENERAL_ADMIN"
}

export interface User {
  id: string;
  login: string;
  role: UserRole;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityHall extends User {
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

export interface Workshop extends User {
  tradeName: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  accreditedCityHalls: string[]; // Array of cityHall IDs
  bankDetails: {
    bank: string;
    branch: string;
    account: string;
  };
}

export interface Admin extends User {
  name: string;
}

// Service Order types
export enum ServiceOrderStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  QUOTED = "QUOTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum VehicleType {
  CAR = "CAR",
  TRUCK = "TRUCK",
  VAN = "VAN",
  MOTORCYCLE = "MOTORCYCLE",
  BUS = "BUS",
  OTHER = "OTHER"
}

export enum FuelType {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  ETHANOL = "ETHANOL",
  FLEX = "FLEX",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID"
}

export enum TransmissionType {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  SEMI_AUTOMATIC = "SEMI_AUTOMATIC"
}

export enum ServiceType {
  PREVENTIVE = "PREVENTIVE",
  CORRECTIVE = "CORRECTIVE",
  EMERGENCY = "EMERGENCY"
}

export enum ServiceCategory {
  MECHANICAL = "MECHANICAL",
  ELECTRICAL = "ELECTRICAL",
  BODY_WORK = "BODY_WORK",
  PAINTING = "PAINTING",
  TIRE = "TIRE",
  GLASS = "GLASS",
  OTHER = "OTHER"
}

export interface ServiceOrder {
  id: string;
  number: string;
  cityHallId: string;
  status: ServiceOrderStatus;
  vehicle: {
    type: VehicleType;
    brand: string;
    model: string;
    fuel: FuelType;
    year: string;
    engine: string;
    color: string;
    transmission: TransmissionType;
    licensePlate: string;
    chassis: string;
    km: number;
    marketValue: number;
    registration: string;
    tankCapacity: number;
  };
  serviceInfo: {
    city: string;
    type: ServiceType;
    category: ServiceCategory;
    location: string;
    notes: string;
  };
  quotes: string[]; // Array of quote IDs
  history: {
    timestamp: Date;
    action: string;
    userId: string;
    details: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Quote types
export enum QuoteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum ItemType {
  PART = "PART",
  LABOR = "LABOR",
  SERVICE = "SERVICE"
}

export enum ItemCategory {
  ENGINE = "ENGINE",
  TRANSMISSION = "TRANSMISSION",
  BRAKE = "BRAKE",
  SUSPENSION = "SUSPENSION",
  ELECTRICAL = "ELECTRICAL",
  BODY = "BODY",
  OTHER = "OTHER"
}

export interface QuoteItem {
  id: string;
  code: string;
  description: string;
  brand: string;
  category: ItemCategory;
  type: ItemType;
  partsDiscountPercentage: number; // Read-only from city hall
  laborDiscountPercentage: number; // Read-only from city hall
  quantity: number;
  unitValue: number;
  partsValueWithDiscount: number; // Calculated
  laborTime: number; // In hours
  laborHourValue: number;
  laborValue: number; // Calculated
  laborValueWithDiscount: number; // Calculated
  warrantyDays: number;
  warrantyKm: number;
  totalValue: number; // Calculated
}

export interface Quote {
  id: string;
  serviceOrderId: string;
  workshopId: string;
  status: QuoteStatus;
  date: Date;
  validUntil: Date;
  estimatedDeliveryDays: number;
  estimatedStartDate: Date;
  serviceLocation: string;
  notes: string;
  items: QuoteItem[];
  totals: {
    totalPartsWithoutDiscount: number;
    partsDiscount: number;
    partsDiscountPercentage: number;
    totalPartsWithDiscount: number;
    totalLaborWithoutDiscount: number;
    laborDiscount: number;
    laborDiscountPercentage: number;
    totalLaborWithDiscount: number;
    totalWithoutDiscount: number;
    totalDiscount: number;
    totalDiscountPercentage: number;
    totalWithDiscount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
