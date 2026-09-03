"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { currentMonthStart } from "@/lib/format";
import { ArrowLeft, Trash2, FileDown } from "lucide-react";

export default function KelolaDataPage() {
  const supabase = createClient();
  const { showToast } = useToast();
  const [resetting, setResetting] = useState(false);
  const month = currentMonthStart();

  async function handleReset() {
    const step1 = confirm(
      `Ini akan menghapus SEMUA data bulan berjalan (Pendapatan, Nabung, Pengeluaran, Transaksi Tracker). Data bulan lain tidak akan disentuh. Lanjutkan?`
    );
    if (!step1) return;
    const step2 = confirm("Yakin? Tindakan ini TIDAK BISA dibatalkan.");
    if (!step2) return;

    setResetting(true);
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthEnd = nextMonth.toISOString().slice(0, 10);

    await Promise.all([
      supabase.from("income").delete().eq("month", month),
      supabase.from("savings").delete().eq("month", month),
      supabase.from("fixed_expenses").delete().eq("month", month),
      supabase.from("variable_expenses").delete().eq("month", month),
      supabase.from("transactions").delete().gte("date", month).lt("date", monthEnd),
    ]);

    setResetting(false);
    showToast("Data bulan ini sudah direset.", "success");
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/profile" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Kelola Data</h1>
      </div>

      <Link href="/laporan" className="app-card mb-3 flex items-center gap-3 p-4">
        <FileDown size={18} className="text-ledger" />
        <div>
          <p className="text-sm font-semibold text-ink">Unduh Data Kamu</p>
          <p className="text-xs text-gray-400">Export ke CSV/Excel/PDF lewat halaman Laporan.</p>
        </div>
      </Link>

      <div className="app-card p-4">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 size={18} className="text-danger" />
          <p className="text-sm font-semibold text-ink">Reset Data Bulan Ini</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Menghapus semua Pendapatan, Nabung, Pengeluaran, dan Transaksi
          Tracker di bulan yang sedang aktif. Bulan-bulan lain tidak
          terpengaruh. Tindakan ini tidak bisa dibatalkan.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-full rounded-full border border-danger py-2.5 text-sm font-semibold text-danger disabled:opacity-50"
        >
          {resetting ? "Menghapus..." : "Reset Data Bulan Ini"}
        </button>
      </div>
    </div>
  );
}
