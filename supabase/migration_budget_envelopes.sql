-- ============================================================
-- Migration: Alokasi Budget (%) — fitur Budgetin' Plus
-- Jalankan file INI SAJA di Supabase Dashboard > SQL Editor kalau
-- database kamu sudah ada (jangan re-run schema.sql penuh).
--
-- Tidak menyentuh/mengubah data atau kolom yang sudah ada — cuma
-- menambah 1 tabel baru (budget_envelopes) dan 1 kolom nullable
-- (envelope_id) di fixed_expenses & variable_expenses. Semua fitur
-- lama tetap jalan persis sama untuk user yang bukan Plus.
-- ============================================================

-- ---------- Tabel baru ----------
create table if not exists budget_envelopes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  name text not null,
  -- pecahan 0..1 (mis. 0.5 = 50%), bukan 0..100
  percentage numeric not null default 0 check (percentage >= 0 and percentage <= 1),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Kaitkan kategori existing ke envelope (opsional, nullable) ----------
alter table fixed_expenses
  add column if not exists envelope_id uuid references budget_envelopes(id) on delete set null;

alter table variable_expenses
  add column if not exists envelope_id uuid references budget_envelopes(id) on delete set null;

-- ---------- Row Level Security ----------
alter table budget_envelopes enable row level security;

drop policy if exists "individual access" on budget_envelopes;
create policy "individual access" on budget_envelopes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Index ----------
create index if not exists idx_envelopes_month on budget_envelopes (user_id, month);
create index if not exists idx_fixed_envelope on fixed_expenses (envelope_id);
create index if not exists idx_variable_envelope on variable_expenses (envelope_id);
