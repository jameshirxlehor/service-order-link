-- Insert sample data with correct enum values

-- Insert sample user profiles without auth_id references
INSERT INTO public.user_profiles (login, role, name, phone) VALUES
  ('admin@prefeitura.gov.br', 'GENERAL_ADMIN', 'Administrador Geral', '(11) 99999-9999'),
  ('consulta@sistema.gov.br', 'QUERY_ADMIN', 'Admin Consulta', '(11) 88888-8888'),
  ('prefeitura@cidade.gov.br', 'CITY_HALL', 'Prefeitura Municipal', '(11) 77777-7777'),
  ('oficina@mecanica.com.br', 'WORKSHOP', 'Oficina Mecânica São Paulo', '(11) 66666-6666'),
  ('oficina2@auto.com.br', 'WORKSHOP', 'Auto Center Silva', '(11) 55555-5555');

-- Insert sample city halls
INSERT INTO public.city_halls (profile_id, trade_name, corporate_name, cnpj, city, state, zip_code, address, discount_percentage, tax_info) VALUES
  ((SELECT id FROM public.user_profiles WHERE login = 'prefeitura@cidade.gov.br'), 
   'Prefeitura Municipal de São Paulo', 
   'Prefeitura Municipal de São Paulo', 
   '12.345.678/0001-90', 
   'São Paulo', 
   'SP', 
   '01000-000', 
   'Praça da Sé, s/n - Centro',
   10.0,
   '{"ir": 2.5, "pis": 1.65, "csll": 1.0, "cofins": 7.6, "laborTax": 5.0, "partsTax": 12.0}'::jsonb);

-- Insert sample workshops
INSERT INTO public.workshops (profile_id, trade_name, corporate_name, cnpj, city, state, zip_code, address, bank_details, accredited_city_halls) VALUES
  ((SELECT id FROM public.user_profiles WHERE login = 'oficina@mecanica.com.br'),
   'Oficina Mecânica São Paulo',
   'Mecânica São Paulo Ltda',
   '98.765.432/0001-10',
   'São Paulo',
   'SP',
   '02000-000',
   'Rua das Flores, 123 - Vila Madalena',
   '{"bank": "Banco do Brasil", "branch": "1234-5", "account": "12345-6"}'::jsonb,
   ARRAY[(SELECT id FROM public.city_halls LIMIT 1)]),
  ((SELECT id FROM public.user_profiles WHERE login = 'oficina2@auto.com.br'),
   'Auto Center Silva',
   'Silva Automóveis Ltda',
   '11.222.333/0001-44',
   'São Paulo',
   'SP',
   '03000-000',
   'Av. Paulista, 456 - Bela Vista',
   '{"bank": "Itaú", "branch": "5678-9", "account": "67890-1"}'::jsonb,
   ARRAY[(SELECT id FROM public.city_halls LIMIT 1)]);

-- Insert sample service orders with CORRECT enum values
INSERT INTO public.service_orders (city_hall_id, number, status, vehicle, service_info, sent_to_workshops) VALUES
  ((SELECT id FROM public.city_halls LIMIT 1),
   'OS-2024-001',
   'SENT_FOR_QUOTES',
   '{"plate": "ABC-1234", "model": "Volkswagen Gol", "year": "2018", "color": "Branco", "chassisNumber": "9BWZZZ377VT004251", "renavam": "12345678901"}'::jsonb,
   '{"description": "Troca de pastilhas de freio e revisão geral", "priority": "MEDIUM", "serviceType": "MAINTENANCE"}'::jsonb,
   ARRAY[(SELECT id FROM public.workshops WHERE trade_name = 'Oficina Mecânica São Paulo'), (SELECT id FROM public.workshops WHERE trade_name = 'Auto Center Silva')]),
  ((SELECT id FROM public.city_halls LIMIT 1),
   'OS-2024-002',
   'QUOTED',
   '{"plate": "XYZ-5678", "model": "Ford Ka", "year": "2020", "color": "Prata", "chassisNumber": "9BFZZZ54XKM123456", "renavam": "98765432109"}'::jsonb,
   '{"description": "Reparo na suspensão dianteira", "priority": "HIGH", "serviceType": "REPAIR"}'::jsonb,
   ARRAY[(SELECT id FROM public.workshops WHERE trade_name = 'Oficina Mecânica São Paulo')]),
  ((SELECT id FROM public.city_halls LIMIT 1),
   'OS-2024-003',
   'ACCEPTED',
   '{"plate": "DEF-9012", "model": "Chevrolet Onix", "year": "2019", "color": "Azul", "chassisNumber": "9BGZZZ48XJG789123", "renavam": "11122233344"}'::jsonb,
   '{"description": "Troca de óleo e filtros", "priority": "LOW", "serviceType": "MAINTENANCE"}'::jsonb,
   ARRAY[(SELECT id FROM public.workshops WHERE trade_name = 'Auto Center Silva')]);

-- Insert sample quotes with correct status values
INSERT INTO public.quotes (service_order_id, workshop_id, date, valid_until, estimated_delivery_days, estimated_start_date, items, totals, status, service_location, notes) VALUES
  ((SELECT id FROM public.service_orders WHERE number = 'OS-2024-001'),
   (SELECT id FROM public.workshops WHERE trade_name = 'Oficina Mecânica São Paulo'),
   NOW(),
   NOW() + INTERVAL '30 days',
   5,
   NOW() + INTERVAL '2 days',
   ARRAY['{"description": "Pastilhas de freio dianteiras", "quantity": 1, "unitPrice": 150.00, "total": 150.00}', '{"description": "Mão de obra - Troca de pastilhas", "quantity": 1, "unitPrice": 80.00, "total": 80.00}']::jsonb[],
   '{"subtotal": 230.00, "taxes": 27.60, "discount": 0.00, "total": 257.60}'::jsonb,
   'PENDING',
   'WORKSHOP',
   'Serviço inclui garantia de 6 meses'),
  ((SELECT id FROM public.service_orders WHERE number = 'OS-2024-001'),
   (SELECT id FROM public.workshops WHERE trade_name = 'Auto Center Silva'),
   NOW(),
   NOW() + INTERVAL '30 days',
   3,
   NOW() + INTERVAL '1 day',
   ARRAY['{"description": "Pastilhas de freio premium", "quantity": 1, "unitPrice": 180.00, "total": 180.00}', '{"description": "Mão de obra especializada", "quantity": 1, "unitPrice": 100.00, "total": 100.00}']::jsonb[],
   '{"subtotal": 280.00, "taxes": 33.60, "discount": 28.00, "total": 285.60}'::jsonb,
   'ACCEPTED',
   'WORKSHOP',
   'Peças originais com garantia estendida'),
  ((SELECT id FROM public.service_orders WHERE number = 'OS-2024-002'),
   (SELECT id FROM public.workshops WHERE trade_name = 'Oficina Mecânica São Paulo'),
   NOW() - INTERVAL '5 days',
   NOW() + INTERVAL '25 days',
   7,
   NOW() + INTERVAL '1 day',
   ARRAY['{"description": "Kit suspensão dianteira", "quantity": 1, "unitPrice": 450.00, "total": 450.00}', '{"description": "Mão de obra - Suspensão", "quantity": 1, "unitPrice": 200.00, "total": 200.00}']::jsonb[],
   '{"subtotal": 650.00, "taxes": 78.00, "discount": 65.00, "total": 663.00}'::jsonb,
   'ACCEPTED',
   'WORKSHOP',
   'Inclui alinhamento e balanceamento');

-- Enable RLS on all tables
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for testing (allow all reads)
CREATE POLICY "Allow all reads for testing" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all reads for city halls" ON public.city_halls FOR SELECT USING (true);
CREATE POLICY "Allow all reads for workshops" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Allow all reads for service orders" ON public.service_orders FOR SELECT USING (true);
CREATE POLICY "Allow all reads for quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Allow all reads for history" ON public.service_order_history FOR SELECT USING (true);