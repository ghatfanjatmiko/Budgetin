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

## 🔴 Prioritas Tinggi

- [x] Favicon (pakai `app/icon.png`, otomatis kedeteksi Next.js — nggak perlu kode tambahan)
- [x] Landing page publik di `/` sebelum halaman login (sebelumnya auto-redirect ke /dashboard, sekarang halaman promosi beneran)
- [ ] Automated testing (baru sebatas `npm run build`, belum ada tes fungsional)
- [ ] Belum pernah dites end-to-end pakai Supabase produksi asli (semua build test pakai placeholder key)

## 🟡 Prioritas Sedang

- [ ] Split Nongkrong custom per orang (sekarang baru bagi rata)
- [ ] Grafik tren multi-bulan di Insights (baru bandingin vs bulan lalu doang)
- [ ] Rate limit di API route `/api/scan-receipt` (rawan disalahgunakan kalau link kesebar)
- [ ] Hapus akun permanen (sekarang cuma bisa reset data bulan aktif)
- [ ] Setup PWA (Add to Home Screen)

## 🟢 Prioritas Rendah

- [ ] Dark mode
- [ ] Caching data (React Query/SWR) biar pindah halaman nggak fetch ulang total
- [ ] Meta tags & og:image buat preview link yang bagus pas di-share
- [ ] Admin dashboard (statistik pengguna, sesuai "Metrik Keberhasilan" PRD bagian 9)

## ⚫ Sengaja Ditunda (bukan kelupaan)

- **Bot WhatsApp/Telegram** — butuh proyek infrastruktur terpisah (WA Business API/Twilio + webhook server), bukan sekadar nambah kode di app ini.
- **Payment gateway otomatis** (Midtrans/Xendit dll) — masih manual approval via WhatsApp, cukup buat skala testing/kuliah.
- **Multi-akun keluarga, integrasi bank/e-wallet, aplikasi mobile native** — eksplisit di luar scope MVP menurut PRD sendiri (bagian 4.2).

---

## Catatan Riwayat Sesi

_(Opsional — tambahin baris singkat tiap sesi kalau mau jejak riwayatnya jelas)_

- **Riwayat awal**: PRD dibuat, prototype HTML, lalu full rebuild ke Next.js + Supabase sesuai mockup UI (Home/Budget/Tracker/Tagihan/Profil + Insights + Scan). Auth sempat beberapa kali ganti pendekatan (OTP → invite-only → Gmail SMTP terbuka) sebelum settle di email+password terbuka. Model AI scan struk pindah dari Claude ke Gemini (gratis). Ditutup dengan optimasi UX + paywall minimal + menu Profil lengkap.
