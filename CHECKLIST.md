# Budgetin' — Checklist Pengembangan

> File ini buat nge-track progress project dari sesi ke sesi. Kalau mulai
> chat baru dan mau lanjut kerjain sesuatu dari sini, upload file ini di
> awal chat biar Claude tau kondisi terkini — nggak perlu jelasin ulang dari
> nol. Setiap kali sebuah item selesai, checkbox-nya diganti `[x]` dan boleh
> ditambah catatan tanggal/detail singkat.

---

## ✅ Sudah Selesai

### MVP Inti (sesuai PRD bagian 4.1)
- [x] Input pendapatan bulanan (multi sumber)
- [x] Alokasi tabungan
- [x] Pengeluaran tetap (kategori custom)
- [x] Pengeluaran tidak tetap + auto-link dari Tracker
- [x] Tracker transaksi harian (qty × harga satuan)
- [x] Langganan & hutang (Tagihan)
- [x] Dashboard ringkasan (Home)
- [x] Ganti periode bulan (Month Picker)
- [x] Salin Pendapatan/Pengeluaran dari bulan lalu

### Fitur Pembeda (PRD bagian 12B)
- [x] Split Nongkrong (bagi rata + pesan siap kirim WA)
- [x] Prediksi & Peringatan Dini (dihitung nyata dari transaksi)
- [x] Streak & Badge (Bronze/Silver/Gold)
- [x] Scan Struk dengan AI (Google Gemini 3.5 Flash Lite)
- [x] Benchmark Komunitas Kampus (agregat anonim, minimal 3 pengguna)
- [ ] Catat via WhatsApp/Telegram bot — **sengaja ditunda**, lihat bagian bawah

### Auth & Keamanan
- [x] Login email + password, pendaftaran terbuka
- [x] Lupa password (reset via email)
- [x] Ganti password saat sudah login (Profil → Keamanan)
- [x] Row Level Security di semua tabel
- [x] Gmail SMTP (gratis, tanpa domain) untuk email transaksional
- [x] Paywall `is_plus` diproteksi trigger DB (nggak bisa self-upgrade dari client)

### Monetisasi (minimal)
- [x] Banner Budgetin' Plus + tombol upgrade (redirect WhatsApp, approval manual)
- [x] Scan Struk & Export Excel/PDF dikunci di belakang status Plus
- [x] CSV tetap gratis

### Export & Laporan
- [x] Export CSV
- [x] Export Excel (.xlsx)
- [x] Export PDF

### UX Polish
- [x] Konfirmasi sebelum hapus (semua tabel)
- [x] Loading state konsisten (komponen `LoadingState`)
- [x] Toast notification (ganti semua `alert()` browser)
- [x] Highlight jatuh tempo di Tagihan (kuning ≤3 hari, merah kalau telat)
- [x] Validasi input (nggak bisa negatif/kosong)

### Menu Profil
- [x] Informasi Akun (read-only: email, tanggal daftar, kampus, status plan)
- [x] Keamanan (ganti password)
- [x] Kelola Data (reset data bulan aktif + link laporan)
- [x] Kirim Masukan (WhatsApp)
- [x] Halaman Panduan / Cara Menggunakan

### Desain & Responsivitas
- [x] UI dirombak total sesuai mockup (bukan reskin doang)
- [x] Palet warna dari logo (navy/gold/cream)
- [x] Sidebar desktop + bottom nav mobile
- [x] Logo terpasang di Nav, Login, Set Password

---

## 🔴 Prioritas Tinggi (lama)

- [x] Favicon (pakai `app/icon.png`)
- [x] Landing page publik di `/`
- [ ] Automated testing (baru sebatas `npm run build`, belum ada tes fungsional)
- [ ] Belum pernah dites end-to-end pakai Supabase produksi asli oleh kamu sendiri

## 🟡 Prioritas Sedang (lama)

- [x] Split Nongkrong custom per orang
- [x] Grafik tren 6 bulan di Insights
- [x] Rate limit di API `/api/scan-receipt` (20/hari + wajib login)
- [x] Hapus akun permanen
- [x] Setup PWA

## 🟢 Prioritas Rendah (lama)

- [x] Dark mode (toggle di sidebar & Profil, berbasis CSS variable)
- [x] Caching data (React Query) — **sekarang di SEMUA halaman**: Home, Budget, Tracker, Tagihan, Insights
- [x] Meta tags & og:image
- [x] Admin dashboard di `/admin`

## 🆕 Temuan Audit Lanjutan (semua sudah beres)

- [x] `NEXT_PUBLIC_SITE_URL` — auto-fallback ke domain Vercel (`VERCEL_URL`) kalau env var ini nggak di-set manual, jadi nggak lagi patah ke localhost di production
- [x] Halaman `error.tsx` custom
- [x] Halaman `not-found.tsx` custom (404)
- [x] `robots` noindex untuk `/admin`
- [x] Halaman Kebijakan Privasi (`/privasi`)
- [x] Ikon PWA multi-ukuran (`icon-192.png`, `icon-512.png`)

## ⚫ Sengaja Ditunda (bukan kelupaan)

- **Bot WhatsApp/Telegram** — butuh proyek infrastruktur terpisah (WA Business API/Twilio + webhook server), bukan sekadar nambah kode di app ini.
- **Payment gateway otomatis** (Midtrans/Xendit dll) — masih manual approval via WhatsApp, cukup buat skala testing/kuliah.
- **Multi-akun keluarga, integrasi bank/e-wallet, aplikasi mobile native** — eksplisit di luar scope MVP menurut PRD sendiri (bagian 4.2).

---

## 🔵 Belum Dikerjain — Butuh Kamu

Ini 2 item yang **nggak bisa aku kerjain dari sandbox** — genuinely butuh kamu:

- [ ] **Automated testing** — perlu diskusi dulu mau pakai apa (Playwright buat E2E? Jest buat unit test?), scope-nya beda tergantung pilihan.
- [ ] **Testing manual end-to-end pakai Supabase produksi asli kamu** — semua yang aku bangun cuma divalidasi lewat `npm run build` (compile check) pakai placeholder key. Belum ada jaminan alur penuh (daftar → isi budget → scan struk → export laporan → dst) beneran mulus di project Supabase kamu. **Ini prioritas paling penting sebelum nambah fitur baru lagi.**

---

## Catatan Riwayat Sesi

- **Riwayat awal**: PRD dibuat, prototype HTML, lalu full rebuild ke Next.js + Supabase sesuai mockup UI (Home/Budget/Tracker/Tagihan/Profil + Insights + Scan). Auth sempat beberapa kali ganti pendekatan (OTP → invite-only → Gmail SMTP terbuka) sebelum settle di email+password terbuka. Model AI scan struk pindah dari Claude ke Gemini (gratis). Ditutup dengan optimasi UX + paywall minimal + menu Profil lengkap.
- **Sesi lanjutan**: Semua item checklist (Tinggi/Sedang/Rendah) dikerjain, termasuk dark mode, React Query di semua halaman, admin dashboard, error/404 page, kebijakan privasi, dan PWA icon multi-ukuran. **Belum pernah dites langsung sama kamu di Supabase produksi — disarankan berhenti nambah fitur dulu dan fokus testing manual.**
- **Sesi fitur "Alokasi Budget (%)" (Plus)**: Nambah fitur baru — user Plus bisa bikin kategori custom (envelope) dengan jatah persen dari total pemasukan bulan itu (mis. 50% Kebutuhan, 30% Dana Darurat, 20% Tabungan), lalu assign pengeluaran tetap/tidak tetap yang sudah ada ke tiap envelope lewat dropdown. Sistem otomatis hitung pagu (nominal) & pemakaian per envelope, dengan progress bar. **Fitur lama sama sekali tidak diubah** — user gratis melihat halaman Budget persis seperti sebelumnya (kolom "Alokasi" di tabel cuma muncul kalau Plus & sudah ada envelope-nya).
  - Tabel baru `budget_envelopes` + kolom nullable `envelope_id` di `fixed_expenses` & `variable_expenses` — lihat `supabase/migration_budget_envelopes.sql` (jalankan file ini saja di Supabase, JANGAN re-run `schema.sql` penuh).
  - Gating premium pakai `profiles.is_plus`, pola yang sama seperti Scan Struk AI.
  - **Belum dites di Supabase produksi asli** — sebelum lanjut, jalankan migration-nya dulu terus tes alur: upgrade `is_plus` manual di DB → buka halaman Budget → tambah envelope → assign kategori → cek pagu/terpakai kehitung bener.
