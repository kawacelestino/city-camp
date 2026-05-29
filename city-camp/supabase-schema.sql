-- =============================================
-- CITY CAMP - Schema do Banco de Dados
-- Cole isso no SQL Editor do Supabase
-- =============================================

-- Tabela de quartos
create table quartos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  capacidade int default 2,
  fotos text[] default '{}',
  comodidades text[] default '{}',
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

-- Tabela de reservas
create table reservas (
  id uuid default gen_random_uuid() primary key,
  quarto_id uuid references quartos(id),
  cliente_nome text not null,
  cliente_email text not null,
  cliente_telefone text,
  data_checkin date not null,
  data_checkout date not null,
  valor_total numeric(10,2) not null,
  status text default 'pendente' check (status in ('pendente','confirmada','cancelada','paga')),
  pagamento_id text,
  observacoes text,
  created_at timestamp with time zone default now()
);

-- Tabela de bloqueios (datas travadas pela dona)
create table bloqueios (
  id uuid default gen_random_uuid() primary key,
  quarto_id uuid references quartos(id),
  data_inicio date not null,
  data_fim date not null,
  motivo text,
  created_at timestamp with time zone default now()
);

-- Tabela de promoções
create table promocoes (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  desconto_percentual numeric(5,2) not null,
  data_inicio date not null,
  data_fim date not null,
  quarto_id uuid references quartos(id),
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

-- Tabela de produtos/extras
create table produtos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

-- Inserir quartos de exemplo
insert into quartos (nome, descricao, preco, capacidade, comodidades) values
('Quarto Standard', 'Quarto aconchegante com cama de casal, ar-condicionado e banheiro privativo.', 180.00, 2, ARRAY['Ar-condicionado', 'TV', 'Wi-Fi', 'Banheiro privativo']),
('Suíte Família', 'Suíte espaçosa com duas camas, ideal para famílias. Vista para o jardim.', 280.00, 4, ARRAY['Ar-condicionado', 'TV', 'Wi-Fi', 'Frigobar', 'Varanda']),
('Chalé Premium', 'Chalé independente com decoração rústica, varanda e toda privacidade.', 320.00, 2, ARRAY['Ar-condicionado', 'TV', 'Wi-Fi', 'Frigobar', 'Varanda privativa', 'Banheira']);

-- Inserir produtos de exemplo
insert into produtos (nome, descricao, preco) values
('Café da manhã', 'Café da manhã completo servido no quarto', 25.00),
('Transfer aeroporto', 'Traslado do aeroporto até a pousada', 80.00),
('Passeio de barco', 'Passeio pelo rio com guia local', 120.00);

-- Inserir promoção de exemplo
insert into promocoes (titulo, descricao, desconto_percentual, data_inicio, data_fim, ativo)
values ('Promoção Fim de Semana', 'Reserve sexta e sábado com 20% de desconto!', 20.00, current_date, current_date + interval '30 days', true);

-- RLS (Row Level Security) - deixa público para leitura
alter table quartos enable row level security;
alter table reservas enable row level security;
alter table bloqueios enable row level security;
alter table promocoes enable row level security;
alter table produtos enable row level security;

create policy "Quartos visíveis para todos" on quartos for select using (true);
create policy "Promoções visíveis para todos" on promocoes for select using (true);
create policy "Produtos visíveis para todos" on produtos for select using (true);
create policy "Bloqueios visíveis para todos" on bloqueios for select using (true);
create policy "Inserir reservas" on reservas for insert with check (true);
create policy "Ver própria reserva" on reservas for select using (true);
create policy "Admin pode tudo em quartos" on quartos for all using (true);
create policy "Admin pode tudo em reservas" on reservas for all using (true);
create policy "Admin pode tudo em bloqueios" on bloqueios for all using (true);
create policy "Admin pode tudo em promocoes" on promocoes for all using (true);
create policy "Admin pode tudo em produtos" on produtos for all using (true);
