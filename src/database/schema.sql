-- Comprehensive Database Schema for Service Order Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User types enum
CREATE TYPE user_type AS ENUM ('CITY_HALL', 'WORKSHOP', 'QUERY_ADMIN', 'GENERAL_ADMIN');

-- Service order status enum
CREATE TYPE service_order_status AS ENUM ('DRAFT', 'SENT_FOR_QUOTES', 'QUOTED', 'ACCEPTED', 'CANCELLED');

-- Quote status enum
CREATE TYPE quote_status AS ENUM ('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- Vehicle types and other enums
CREATE TYPE vehicle_type AS ENUM ('CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'VAN', 'OTHER');
CREATE TYPE fuel_type AS ENUM ('GASOLINE', 'ETHANOL', 'DIESEL', 'FLEX', 'ELECTRIC', 'HYBRID');
CREATE TYPE transmission_type AS ENUM ('MANUAL', 'AUTOMATIC', 'CVT');
CREATE TYPE service_type AS ENUM ('MAINTENANCE', 'REPAIR', 'INSPECTION', 'OTHER');

-- Main users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    user_type user_type NOT NULL,
    login_number VARCHAR(20) UNIQUE NOT NULL, -- System generated number
    trade_name VARCHAR(255),
    corporate_name VARCHAR(255),
    cnpj VARCHAR(18), -- 00.000.000/0000-00 format
    state_registration VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(9), -- 00000-000 format
    address TEXT,
    responsible_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- City Hall specific fields
CREATE TABLE public.city_halls (
    user_id UUID REFERENCES public.user_profiles(id) PRIMARY KEY,
    parts_discount_percentage DECIMAL(5,2) DEFAULT 0, -- Discount percentage for parts
    labor_discount_percentage DECIMAL(5,2) DEFAULT 0, -- Discount percentage for labor
    -- Tax information
    ir_labor DECIMAL(5,2) DEFAULT 0,
    ir_parts DECIMAL(5,2) DEFAULT 0,
    pis_labor DECIMAL(5,2) DEFAULT 0,
    pis_parts DECIMAL(5,2) DEFAULT 0,
    cofins_labor DECIMAL(5,2) DEFAULT 0,
    cofins_parts DECIMAL(5,2) DEFAULT 0,
    csll_labor DECIMAL(5,2) DEFAULT 0,
    csll_parts DECIMAL(5,2) DEFAULT 0
);

-- Workshop specific fields
CREATE TABLE public.workshops (
    user_id UUID REFERENCES public.user_profiles(id) PRIMARY KEY,
    bank_name VARCHAR(100),
    bank_branch VARCHAR(20),
    bank_account VARCHAR(30)
);

-- Workshop accreditation with city halls
CREATE TABLE public.workshop_accreditations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(user_id),
    city_hall_id UUID REFERENCES public.city_halls(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workshop_id, city_hall_id)
);

-- Service Orders
CREATE TABLE public.service_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    os_number VARCHAR(50) UNIQUE NOT NULL,
    city_hall_id UUID REFERENCES public.city_halls(user_id) NOT NULL,
    
    -- Vehicle information
    vehicle_type vehicle_type NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    fuel fuel_type,
    year INTEGER,
    engine VARCHAR(100),
    color VARCHAR(50),
    transmission transmission_type,
    license_plate VARCHAR(20),
    chassis VARCHAR(50),
    km INTEGER,
    vehicle_market_value DECIMAL(12,2),
    registration VARCHAR(50),
    tank_capacity DECIMAL(8,2),
    
    -- Service information
    service_city VARCHAR(100),
    service_type service_type,
    service_category VARCHAR(100),
    vehicle_location TEXT,
    notes TEXT,
    
    -- Status and dates
    status service_order_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_for_quotes_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Quotes for service orders
CREATE TABLE public.quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_order_id UUID REFERENCES public.service_orders(id) NOT NULL,
    workshop_id UUID REFERENCES public.workshops(user_id) NOT NULL,
    
    -- Quote information
    quote_date DATE DEFAULT CURRENT_DATE,
    validity_days INTEGER DEFAULT 30,
    estimated_delivery_days INTEGER,
    estimated_start_days INTEGER,
    service_location TEXT,
    notes TEXT,
    
    -- Calculated totals (will be computed from quote_items)
    total_parts_without_discount DECIMAL(12,2) DEFAULT 0,
    total_parts_discount DECIMAL(12,2) DEFAULT 0,
    total_parts_with_discount DECIMAL(12,2) DEFAULT 0,
    total_labor_without_discount DECIMAL(12,2) DEFAULT 0,
    total_labor_discount DECIMAL(12,2) DEFAULT 0,
    total_labor_with_discount DECIMAL(12,2) DEFAULT 0,
    total_without_discount DECIMAL(12,2) DEFAULT 0,
    total_discount DECIMAL(12,2) DEFAULT 0,
    total_with_discount DECIMAL(12,2) DEFAULT 0,
    
    -- Status and dates
    status quote_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(service_order_id, workshop_id) -- One quote per workshop per service order
);

-- Quote items (parts and labor)
CREATE TABLE public.quote_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    
    -- Item information
    code VARCHAR(100),
    description TEXT NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    item_type VARCHAR(50), -- 'PARTS' or 'LABOR' or 'BOTH'
    
    -- Quantities and values
    quantity DECIMAL(10,3) DEFAULT 1,
    unit_value DECIMAL(12,2) DEFAULT 0,
    
    -- Parts calculations (read-only, calculated)
    parts_discount_percentage DECIMAL(5,2) DEFAULT 0, -- From city hall
    parts_value_with_discount DECIMAL(12,2) DEFAULT 0,
    
    -- Labor information
    labor_hours DECIMAL(8,2) DEFAULT 0,
    labor_hour_value DECIMAL(12,2) DEFAULT 0,
    labor_value DECIMAL(12,2) DEFAULT 0,
    labor_discount_percentage DECIMAL(5,2) DEFAULT 0, -- From city hall
    labor_value_with_discount DECIMAL(12,2) DEFAULT 0,
    
    -- Warranty
    warranty_days INTEGER DEFAULT 0,
    warranty_km INTEGER DEFAULT 0,
    
    -- Total item value (parts + labor with discounts)
    total_item_value DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service order history/audit log
CREATE TABLE public.service_order_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_order_id UUID REFERENCES public.service_orders(id) NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id),
    action VARCHAR(100) NOT NULL, -- 'CREATED', 'SENT_FOR_QUOTES', 'QUOTE_SUBMITTED', 'QUOTE_ACCEPTED', 'CANCELLED', etc.
    description TEXT,
    metadata JSONB, -- Additional data about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications for workshops
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
    read BOOLEAN DEFAULT FALSE,
    service_order_id UUID REFERENCES public.service_orders(id),
    quote_id UUID REFERENCES public.quotes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX idx_user_profiles_login_number ON public.user_profiles(login_number);
CREATE INDEX idx_service_orders_city_hall ON public.service_orders(city_hall_id);
CREATE INDEX idx_service_orders_status ON public.service_orders(status);
CREATE INDEX idx_service_orders_created_at ON public.service_orders(created_at);
CREATE INDEX idx_quotes_service_order ON public.quotes(service_order_id);
CREATE INDEX idx_quotes_workshop ON public.quotes(workshop_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quote_items_quote ON public.quote_items(quote_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- RLS (Row Level Security) Policies will be added here
-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_accreditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Function to generate unique login numbers
CREATE OR REPLACE FUNCTION generate_login_number(user_type_param user_type)
RETURNS VARCHAR(20) AS $$
DECLARE
    prefix VARCHAR(3);
    next_num INTEGER;
    result VARCHAR(20);
BEGIN
    -- Set prefix based on user type
    CASE user_type_param
        WHEN 'CITY_HALL' THEN prefix := 'CH';
        WHEN 'WORKSHOP' THEN prefix := 'WS';
        WHEN 'QUERY_ADMIN' THEN prefix := 'QA';
        WHEN 'GENERAL_ADMIN' THEN prefix := 'GA';
    END CASE;
    
    -- Get next number for this type
    SELECT COALESCE(MAX(CAST(SUBSTRING(login_number FROM 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.user_profiles
    WHERE user_type = user_type_param
    AND login_number ~ ('^' || prefix || '[0-9]+$');
    
    -- Format result with leading zeros
    result := prefix || LPAD(next_num::text, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON public.service_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_items_updated_at
    BEFORE UPDATE ON public.quote_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();