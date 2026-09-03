# Budgetin' — Starter Project (Next.js + Supabase + AI)

Versi lengkap sesuai desain mockup: 5 halaman (Home, Budget, Tracker, Tagihan,
Profil) + Insights + Scan Struk dengan AI beneran (bukan simulasi).

**Yang sudah ada dan fungsional:**
- Login pakai email + password, pendaftaran terbuka (siapapun bisa daftar sendiri) — pakai Gmail sendiri sebagai SMTP, lihat setup wajib di bawah. Ada juga "Lupa password?"
- **Home** — saldo bulan ini, Budget Health bar, Streak &amp; Badge nyatet, ringkasan 3 kolom, mini chart, transaksi terakhir
- **Budget** — form Pendapatan, Nabung, Pengeluaran Tetap/Tidak Tetap
- **Tracker** — daftar transaksi dikelompokkan per hari, filter Jajan/Nongkrong, tombol tambah (+), **Split Nongkrong** (bagi tagihan + salin pesan WA)
- **Tagihan** — Langganan & Hutang, terpisah tab
- **Insights** — prediksi akhir bulan (dihitung nyata dari transaksi), kategori pengeluaran tertinggi, performa vs bulan lalu, **Benchmark Komunitas Kampus** (agregat anonim, minimal 3 pengguna per kampus)
- **Scan Struk dengan AI** — foto struk beneran dikirim ke Google Gemini buat dibaca otomatis
- **Profil** — info akun, ganti password, kelola data, input kampus (buat Benchmark), banner upgrade Budgetin' Plus (approval manual via WhatsApp, bukan payment gateway otomatis)
- **Unduh Laporan** — CSV gratis, Excel &amp; PDF khusus Plus
- **Paywall minimal** — Scan Struk &amp; export Excel/PDF dikunci di belakang status Plus; status ini cuma bisa diubah lewat service_role key (dev), bukan dari client, jadi nggak bisa diakalin sendiri sama pengguna
- Sidebar di desktop, bottom nav di mobile — responsive
- Month Picker — bisa lihat histori bulan-bulan sebelumnya
- Row Level Security aktif di semua tabel; benchmark kampus cuma mengembalikan agregat, tidak pernah data mentah antar pengguna

**Yang masih placeholder (belum fungsional):**
- Upgrade ke Plus diproses MANUAL — pengguna klik "Upgrade" → chat WA admin →
  admin toggle `is_plus` di database. Belum ada payment gateway otomatis
  (Midtrans/Xendit dll).
- **Catat via WhatsApp/Telegram bot** — BUKAN sekadar nambah kode di app ini,
  butuh proyek terpisah: daftar WhatsApp Business API / Twilio, server
  webhook buat nerima pesan masuk, dan parsing teks jadi transaksi. Kalau mau
  dikerjain, lebih baik dibahas sebagai fase terpisah.

---

## 0. Kalau kamu baru upgrade dari versi sebelumnya

Ada 2 perubahan skema database yang WAJIB dijalankan di SQL Editor Supabase
kalau sebelumnya sudah pernah setup:

```sql
-- 1. Kolom type untuk Tagihan (kalau belum pernah dijalankan)
alter table subscriptions_debts add column if not exists type text not null default 'Langganan';

-- 2. Tabel profiles + fungsi benchmark kampus (fitur baru)
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  campus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "individual access" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Kolom is_plus + proteksi biar cuma admin (service_role) yang bisa
--    ubah, bukan pengguna sendiri (fitur paywall)
alter table profiles add column if not exists is_plus boolean not null default false;

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
```

Untuk fungsi `get_campus_benchmark`, paling gampang copy-paste ulang seluruh
isi `supabase/schema.sql` ke SQL Editor dan jalankan — semua perintahnya pakai
`if not exists` / `create or replace` jadi aman dijalankan berkali-kali tanpa
merusak data yang sudah ada.

### Cara meng-upgrade seseorang ke Plus (manual)

Setelah orangnya chat WA & bayar (di luar sistem, manual), buka **SQL
Editor** Supabase dan jalankan (ganti email-nya):

```sql
update profiles set is_plus = true
where user_id = (select id from auth.users where email = 'email-orangnya@gmail.com');
```

Kalau baris `profiles` orang itu belum ada (dia belum pernah isi kampus),
insert dulu:

```sql
insert into profiles (user_id, is_plus)
select id, true from auth.users where email = 'email-orangnya@gmail.com'
on conflict (user_id) do update set is_plus = true;
```

### Setup tombol "Upgrade Sekarang" (nomor WhatsApp)

Tambahkan satu env variable lagi di `.env.local` (dan di Vercel):

```
NEXT_PUBLIC_ADMIN_WHATSAPP=62812xxxxxxx
```

Format nomor internasional tanpa tanda `+` atau spasi (contoh: nomor
`0812-3456-7890` ditulis `6281234567890`). Tombol "Upgrade Sekarang" dan
"Kirim Masukan" di Profil bakal buka chat WhatsApp ke nomor ini otomatis,
lengkap dengan pesan & email pengguna sudah terisi duluan.

---

## 1. Setup Supabase

Sama seperti sebelumnya — jalankan `supabase/schema.sql` di SQL Editor.

> **Sudah pernah setup sebelumnya?** Tabel `subscriptions_debts` sekarang
> punya kolom baru `type` ('Langganan'/'Hutang'). Jalankan ini di SQL Editor:
> ```sql
> alter table subscriptions_debts add column if not exists type text not null default 'Langganan';
> alter table subscriptions_debts add constraint subscriptions_debts_type_check check (type in ('Langganan','Hutang'));
> ```

Ambil **Project URL** dan **Publishable/anon key** dari Project Settings > API
seperti biasa.

### ⚠️ WAJIB: Setup Gmail sebagai SMTP (supaya siapapun bisa daftar sendiri)

Login/daftar sekarang **email + password terbuka** — siapapun bisa daftar
sendiri lewat aplikasi, dapat email konfirmasi & bisa reset password kalau
lupa. Supaya email-nya beneran nyampe ke sembarang alamat (bukan cuma
akunmu sendiri), pakai **Gmail kamu sendiri sebagai SMTP** — gratis, tanpa
perlu domain.

**A. Generate App Password dari akun Gmail kamu**

1. Buka [myaccount.google.com/security](https://myaccount.google.com/security)
2. Pastikan **2-Step Verification** aktif (nyalain dulu kalau belum)
3. Cari **App Passwords**, buat baru dengan nama bebas (misal "Budgetin SMTP")
4. Copy kode 16 karakter yang muncul — cuma keliatan sekali, simpan dulu

**B. Masukkan ke Supabase**

1. **Authentication** → **Emails** → **SMTP Settings**
2. Nyalain **"Enable custom SMTP"**, isi:
   ```
   Sender email : emailgmailkamu@gmail.com
   Sender name  : Budgetin'
   Host         : smtp.gmail.com
   Port         : 587
   Username     : emailgmailkamu@gmail.com
   Password     : [App Password 16 karakter, tanpa spasi]
   ```
3. Save.

**C. Atur Redirect URL**

**Authentication** → **URL Configuration** → tambahkan di **Redirect URLs**:
- `http://localhost:3000/set-password`
- `https://domain-vercel-kamu.vercel.app/set-password` (setelah deploy)

Setelah ini, siapapun bisa klik "Daftar" di aplikasi, isi email + password,
dapat email konfirmasi beneran, dan kalau lupa password bisa reset sendiri
lewat "Lupa password?".

> **Batasan yang perlu kamu tahu:** akun Gmail personal cuma bisa kirim ke
> maksimal ~500 penerima per 24 jam — jauh lebih dari cukup untuk tugas
> kuliah/demo, tapi kalau nanti aplikasi ini beneran dipakai ratusan orang
> per hari, baru perlu pindah ke provider seperti Resend dengan domain
> terverifikasi.

## 2. Setup Scan Struk AI (pakai Google Gemini — gratis)

1. Buka [aistudio.google.com/apikey](https://aistudio.google.com/apikey),
   login pakai akun Google kamu.
2. Klik **Create API Key**, copy nilainya.
3. Masukkan ke `.env.local` sebagai `GEMINI_API_KEY` (**tanpa** `NEXT_PUBLIC_`
   di depan — variable ini harus tetap rahasia di server).
4. Tanpa key ini, semua fitur lain tetap jalan normal — cuma halaman Scan
   Struk yang akan menampilkan pesan error kalau dicoba.

> Model yang dipakai (`gemini-3.5-flash-lite`) punya free tier lumayan besar
> (ribuan request per hari) — untuk testing/demo/tugas kuliah, kemungkinan
> besar kamu nggak akan pernah kena limit sama sekali.

## 3. Jalankan di komputer

```bash
cd budgetin
npm install
cp .env.local.example .env.local
# isi .env.local dengan 3 nilai: Supabase URL, Supabase key, Gemini key
npm run dev
```

Buka `http://localhost:3000`.

### Error "Module not found: Can't resolve 'lucide-react'" (atau package lain)?

Ini artinya `node_modules` di komputermu belum punya package terbaru —
biasanya karena file project di-update (ada package baru ditambahkan) tapi
`npm install` belum dijalankan ulang. Perbaikannya:

```bash
# hentikan dulu server (Ctrl+C), lalu:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Di Windows PowerShell, ganti baris pertama dengan:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
```

## 4. Deploy ke Vercel

Sama seperti sebelumnya, tapi tambahkan environment variable ketiga di Vercel:
`GEMINI_API_KEY` (selain `NEXT_PUBLIC_SUPABASE_URL` dan
`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## 5. Struktur folder (ringkas)

```
app/
├── (app)/              # halaman berlogin, pakai sidebar/bottom nav
│   ├── dashboard/       # Home
│   ├── budget/          # form budgeting
│   ├── tracker/         # daftar transaksi + /add
│   ├── tagihan/         # langganan & hutang
│   ├── insights/        # prediksi & analisis
│   └── profile/         # profil + laporan
├── scan/                 # halaman scan struk (full-screen, tanpa nav)
├── api/scan-receipt/     # server route yang manggil Gemini API
├── login/
└── auth/callback/
components/
├── AppNav.tsx            # sidebar (desktop) + bottom nav (mobile)
└── Fab.tsx                # tombol + mengambang di mobile
```

