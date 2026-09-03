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

-- Profil pengguna, dipakai untuk fitur Benchmark Komunitas Kampus.
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  campus text,
  is_plus boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mencegah pengguna biasa nge-set is_plus=true sendiri lewat client (misal
-- manggil Supabase REST API langsung). Cuma koneksi pakai service_role key
-- (dipakai admin/dev secara manual) yang boleh mengubah kolom ini — jadi
-- "upgrade ke Plus" harus lewat approval manual, bukan bisa diakalin sendiri.
create or replace function prevent_self_plus_upgrade()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.role() <> 'service_role' and new.is_plus is distinct from old.is_plus then
    new.is_plus := old.is_plus;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_plus_upgrade on profiles;
create trigger trg_prevent_self_plus_upgrade
before update on profiles
for each row execute function prevent_self_plus_upgrade();

-- ---------- Row Level Security ----------
-- Wajib dinyalakan supaya data satu pengguna tidak bisa dilihat/diubah pengguna lain.

alter table income enable row level security;
alter table savings enable row level security;
alter table fixed_expenses enable row level security;
alter table variable_expenses enable row level security;
alter table transactions enable row level security;
alter table subscriptions_debts enable row level security;
alter table profiles enable row level security;

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

create policy "individual access" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Benchmark Komunitas Kampus ----------
-- Hanya mengembalikan AGREGAT (jumlah pengguna + rata-rata), tidak pernah
-- data mentah per orang. Kalau pengguna dari kampus yang sama masih < 3
-- orang, sengaja tidak mengembalikan apa-apa supaya privasi tetap terjaga
-- (kalau cuma 1-2 orang, "rata-rata" itu sama aja bocorin angka orang lain).
create or replace function get_campus_benchmark(target_month date)
returns table (user_count bigint, avg_total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  my_campus text;
  cnt bigint;
  avg_val numeric;
begin
  select p.campus into my_campus from profiles p where p.user_id = auth.uid();

  if my_campus is null or my_campus = '' then
    return;
  end if;

  select count(*), coalesce(avg(total), 0)
  into cnt, avg_val
  from (
    select tx.user_id, sum(tx.qty * tx.price) as total
    from transactions tx
    join profiles pr on pr.user_id = tx.user_id
    where pr.campus = my_campus
      and tx.date >= target_month
      and tx.date < (target_month + interval '1 month')::date
    group by tx.user_id
  ) sub;

  if cnt < 3 then
    return;
  end if;

  return query select cnt, avg_val;
end;
$$;

grant execute on function get_campus_benchmark(date) to authenticated;

-- ---------- Index bantu query bulan berjalan ----------
create index if not exists idx_income_month on income (user_id, month);
create index if not exists idx_savings_month on savings (user_id, month);
create index if not exists idx_fixed_month on fixed_expenses (user_id, month);
create index if not exists idx_variable_month on variable_expenses (user_id, month);
create index if not exists idx_transactions_date on transactions (user_id, date);
