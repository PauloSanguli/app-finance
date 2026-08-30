-- Tabela de cartões
create table if not exists public.cards (
  id text primary key,
  "bankId" text not null,
  "customBankName" text,
  "accountHolder" text not null,
  "cardNumber" text not null,
  "accountType" text not null,
  "ibanSuffix" text not null,
  "colorTheme" text not null,
  "createdAt" text not null default to_char(now(), 'YYYY-MM-DD')
);

-- Tabela de subcontas
create table if not exists public.subaccounts (
  id text primary key,
  "cardId" text not null references public.cards(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  "targetBudget" numeric,
  "defaultIncomeShare" numeric,
  notes text,
  "createdAt" text not null default to_char(now(), 'YYYY-MM-DD')
);

-- Tabela de rendimentos
create table if not exists public.income_sources (
  id text primary key,
  name text not null,
  "defaultAmount" numeric not null default 0,
  frequency text not null,
  "receivingDay" integer,
  active boolean not null default true,
  notes text
);

-- Tabela de transações
create table if not exists public.transactions (
  id text primary key,
  "subaccountId" text not null references public.subaccounts(id) on delete cascade,
  "cardId" text not null references public.cards(id) on delete cascade,
  type text not null check (type in ('EXPENSE', 'INCOME')),
  amount numeric not null default 0,
  date text not null,
  description text not null,
  "incomeSourceId" text,
  "createdAt" text not null default to_char(now(), 'YYYY-MM-DDTHH24:MI:SSZ')
);

-- Índices úteis
create index if not exists idx_cards_bankid on public.cards("bankId");
create index if not exists idx_subaccounts_cardid on public.subaccounts("cardId");
create index if not exists idx_transactions_subaccount on public.transactions("subaccountId");
create index if not exists idx_transactions_card on public.transactions("cardId");
create index if not exists idx_transactions_date on public.transactions(date);

-- Opcional: permitir leitura/escrita simples para autenticação anon
alter table public.cards enable row level security;
alter table public.subaccounts enable row level security;
alter table public.transactions enable row level security;
alter table public.income_sources enable row level security;

create policy if not exists "Allow all access for anon" on public.cards for all using (true) with check (true);
create policy if not exists "Allow all access for anon" on public.subaccounts for all using (true) with check (true);
create policy if not exists "Allow all access for anon" on public.transactions for all using (true) with check (true);
create policy if not exists "Allow all access for anon" on public.income_sources for all using (true) with check (true);
