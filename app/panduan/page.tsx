"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Receipt,
  CreditCard,
  BarChart3,
  Camera,
  Users,
  Flame,
  GraduationCap,
} from "lucide-react";

const sections = [
  {
    icon: Wallet,
    title: "Budget",
    desc: "Isi Pendapatan, Nabung, Pengeluaran Tetap (kos, internet, dll), dan rencana Pengeluaran Tidak Tetap di awal bulan. Kategori \"Jajan & Nongkrong\" otomatis terisi dari Tracker — tidak perlu diisi manual.",
  },
  {
    icon: Receipt,
    title: "Tracker",
    desc: "Catat jajan/nongkrong harian lewat tombol + . Klik tombol Split di transaksi Nongkrong untuk bagi tagihan sama teman dan dapat pesan siap kirim ke WA.",
  },
  {
    icon: Camera,
    title: "Scan Struk",
    desc: "Di halaman tambah transaksi, pilih tab \"Foto Struk\" — AI akan otomatis baca nama item, harga, dan total dari fotomu. Fitur Plus.",
  },
  {
    icon: CreditCard,
    title: "Tagihan & Hutang",
    desc: "Catat langganan bulanan dan hutang. Kartu akan otomatis dikasih tanda kuning kalau jatuh tempo ≤3 hari lagi, atau merah kalau sudah telat.",
  },
  {
    icon: BarChart3,
    title: "Insights",
    desc: "Lihat prediksi pengeluaranmu sampai akhir bulan (dihitung dari pola nyata, bukan tebakan), kategori paling boros, dan performa dibanding bulan lalu.",
  },
  {
    icon: GraduationCap,
    title: "Benchmark Kampus",
    desc: "Isi nama kampus di Profil, lalu bandingkan pengeluaranmu dengan rata-rata mahasiswa lain di kampus yang sama (anonim, minimal 3 orang biar privasi tetap terjaga).",
  },
  {
    icon: Flame,
    title: "Streak & Badge",
    desc: "Catat transaksi tiap hari untuk menjaga streak-mu tetap nyala. Dapat badge Bronze (7 hari), Silver (14 hari), Gold (30 hari).",
  },
  {
    icon: Users,
    title: "Salin dari Bulan Lalu",
    desc: "Di halaman Budget, tekan tombol \"Salin dari Bulan Lalu\" supaya tidak perlu mengetik ulang Pendapatan & Pengeluaran Tetap tiap bulan.",
  },
];

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/profile" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Cara Menggunakan</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Panduan singkat tiap fitur di Budgetin&apos;.
      </p>

      <div className="space-y-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="app-card p-4 flex gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-coin/20">
                <Icon size={18} className="text-ledger" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ledger mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="app-card mt-4 p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          Masih bingung atau nemu masalah? Kirim masukan lewat halaman Profil
          → Kirim Masukan.
        </p>
      </div>
    </div>
  );
}
