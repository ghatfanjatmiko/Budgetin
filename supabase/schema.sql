-- ============================================================
-- Budgetin' — Skema Database
-- Jalankan file ini di Supabase Dashboard > SQL Editor
--
-- Sudah pernah jalanin versi lama file ini? Tinggal jalankan baris
-- ini sendiri buat update tabel subscriptions_debts kamu:
--   alter table subscriptions_debts add column if not exists type text not null default 'Langganan';
--   alter table subscriptions_debts add constraint subscriptions_debts_type_check check (type in ('Langganan','Hutang'));
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Tables ----------

create table if not exists income (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,          -- tanggal 1 dari bulan terkait, mis. 2026-01-01
  source text not null,
  type text not null default 'Aktif',
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists savings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  description text not null,
  priority text,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  category text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists variable_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  category text not null,
  plan_amount numeric not null default 0,
  is_auto boolean not null default false,  -- true untuk kategori "Jajan & Nongkrong" yang auto-link ke transactions
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  kind text not null check (kind in ('Jajan', 'Nongkrong')),
  name text not null,
  qty numeric not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions_debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'Langganan' check (type in ('Langganan', 'Hutang')),
  name text not null,
  due_day int,
  amount numeric not null default 0,
  status text not null default 'Belum Bayar',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Wajib dinyalakan supaya data satu pengguna tidak bisa dilihat/diubah pengguna lain.

alter table income enable row level security;
alter table savings enable row level security;
alter table fixed_expenses enable row level security;
alter table variable_expenses enable row level security;
alter table transactions enable row level security;
alter table subscriptions_debts enable row level security;

create policy "individual access" on income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "individual access" on savings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "individual access" on fixed_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "individual access" on variable_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "individual access" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "individual access" on subscriptions_debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Index bantu query bulan berjalan ----------
create index if not exists idx_income_month on income (user_id, month);
create index if not exists idx_savings_month on savings (user_id, month);
create index if not exists idx_fixed_month on fixed_expenses (user_id, month);
create index if not exists idx_variable_month on variable_expenses (user_id, month);
create index if not exists idx_transactions_date on transactions (user_id, date);
