# Budgetin' — Starter Project (Next.js + Supabase + AI)

Versi lengkap sesuai desain mockup: 5 halaman (Home, Budget, Tracker, Tagihan,
Profil) + Insights + Scan Struk dengan AI beneran (bukan simulasi).

**Yang sudah ada dan fungsional:**
- Login pakai kode OTP 6 digit (bukan link) — tanpa keluar aplikasi
- **Home** — saldo bulan ini, Budget Health bar, Streak &amp; Badge nyatet, ringkasan 3 kolom, mini chart, transaksi terakhir
- **Budget** — form Pendapatan, Nabung, Pengeluaran Tetap/Tidak Tetap
- **Tracker** — daftar transaksi dikelompokkan per hari, filter Jajan/Nongkrong, tombol tambah (+), **Split Nongkrong** (bagi tagihan + salin pesan WA)
- **Tagihan** — Langganan & Hutang, terpisah tab
- **Insights** — prediksi akhir bulan (dihitung nyata dari transaksi), kategori pengeluaran tertinggi, performa vs bulan lalu, **Benchmark Komunitas Kampus** (agregat anonim, minimal 3 pengguna per kampus)
- **Scan Struk dengan AI** — foto struk beneran dikirim ke Claude (Anthropic) buat dibaca otomatis
- **Profil** — info akun, input kampus (buat Benchmark), banner upgrade Budgetin' Plus (belum ada pembayaran beneran), unduh laporan
- **Unduh Laporan** — export CSV asli dari data transaksi
- Sidebar di desktop, bottom nav di mobile — responsive
- Month Picker — bisa lihat histori bulan-bulan sebelumnya
- Row Level Security aktif di semua tabel; benchmark kampus cuma mengembalikan agregat, tidak pernah data mentah antar pengguna

**Yang masih placeholder (belum fungsional):**
- Tombol "Upgrade Sekarang" di Profil (belum ada sistem pembayaran)
- Menu Keamanan/Preferensi/Kelola Data di Profil (baru navigasi kosong)
- **Catat via WhatsApp/Telegram bot** — BUKAN sekadar nambah kode di app ini,
  butuh proyek terpisah: daftar WhatsApp Business API / Twilio, server
  webhook buat nerima pesan masuk, dan parsing teks jadi transaksi. Kalau mau
  dikerjain, lebih baik dibahas sebagai fase terpisah.
- Format laporan Excel/PDF (baru CSV)

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
```

Untuk fungsi `get_campus_benchmark`, paling gampang copy-paste ulang seluruh
isi `supabase/schema.sql` ke SQL Editor dan jalankan — semua perintahnya pakai
`if not exists` / `create or replace` jadi aman dijalankan berkali-kali tanpa
merusak data yang sudah ada.

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

### ⚠️ WAJIB: Edit template email supaya login pakai kode (bukan link)

Login sekarang pakai **kode 6 digit** yang diketik langsung di aplikasi — jadi
kamu nggak perlu keluar app buat klik link di email lagi. Tapi supaya kodenya
muncul di email, template default Supabase harus diedit dulu (defaultnya cuma
nampilin tombol link, bukan kode):

1. Di Supabase Dashboard, buka **Authentication** → **Email Templates**.
2. Pilih template **Magic Link**.
3. Di bagian body/isi email, tambahkan baris ini di mana saja (boleh taruh di
   atas tombol link yang sudah ada):
   ```
   Atau masukkan kode ini di aplikasi: {{ .Token }}
   ```
4. Klik **Save**.

Tanpa langkah ini, email yang masuk cuma ada tombol link doang, nggak ada
kode buat diketik — jangan sampai kelewat.

## 2. Setup Scan Struk AI

1. Buka [console.anthropic.com](https://console.anthropic.com), buat akun (ada
   starting credit gratis).
2. Bikin API key baru, copy nilainya (diawali `sk-ant-...`).
3. Masukkan ke `.env.local` sebagai `ANTHROPIC_API_KEY` (**tanpa** `NEXT_PUBLIC_`
   di depan — variable ini harus tetap rahasia di server).
4. Tanpa key ini, semua fitur lain tetap jalan normal — cuma halaman Scan
   Struk yang akan menampilkan pesan error kalau dicoba.

> Setiap kali fitur Scan Struk dipakai, itu memanggil API Anthropic dan akan
> memakai sedikit credit/biaya sesuai harga API mereka. Untuk testing/demo,
> starting credit gratis biasanya lebih dari cukup.

## 3. Jalankan di komputer

```bash
cd budgetin
npm install
cp .env.local.example .env.local
# isi .env.local dengan 3 nilai: Supabase URL, Supabase key, Anthropic key
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
`ANTHROPIC_API_KEY` (selain `NEXT_PUBLIC_SUPABASE_URL` dan
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
├── api/scan-receipt/     # server route yang manggil Anthropic API
├── login/
└── auth/callback/
components/
├── AppNav.tsx            # sidebar (desktop) + bottom nav (mobile)
└── Fab.tsx                # tombol + mengambang di mobile
```

