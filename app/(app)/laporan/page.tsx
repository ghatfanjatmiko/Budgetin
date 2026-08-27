"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, currentMonthStart } from "@/lib/format";
import { FileText, Download } from "lucide-react";

export default function LaporanPage() {
  const supabase = createClient();
  const [from, setFrom] = useState(currentMonthStart());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function downloadCsv() {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("date, kind, name, qty, price")
      .gte("date", from)
      .lte("date", to)
      .order("date");

    setLoading(false);

    if (error) {
      alert("Gagal mengambil data: " + error.message);
      return;
    }
    if (!data || data.length === 0) {
      alert("Tidak ada transaksi di rentang tanggal ini.");
      return;
    }

    const header = ["Tanggal", "Jenis", "Nama", "Qty", "Harga Satuan", "Total"];
    const rows = data.map((t) => [
      t.date,
      t.kind,
      t.name,
      t.qty,
      t.price,
      Number(t.qty) * Number(t.price),
    ]);
    const total = rows.reduce((s, r) => s + Number(r[5]), 0);
    rows.push(["", "", "", "", "TOTAL", total]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-budgetin-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title mb-1">Unduh Laporan</h1>

      <div className="app-card flex flex-col items-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-coin/20 flex items-center justify-center mb-3">
          <FileText size={28} className="text-coin" />
        </div>
        <p className="font-semibold text-sm text-ink mb-1">Laporan Keuangan</p>
        <p className="text-xs text-gray-400">
          Unduh ringkasan transaksi jajan &amp; nongkrong dalam format CSV (bisa dibuka di Excel/Google Sheets).
        </p>
      </div>

      <div className="app-card space-y-4 p-5">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="field-control"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="field-control"
          />
        </div>
      </div>

      <button
        onClick={downloadCsv}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ledger py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
      >
        <Download size={16} />
        {loading ? "Menyiapkan..." : "Unduh Laporan (CSV)"}
      </button>
      <p className="text-[11px] text-gray-400 text-center">
        Format Excel (.xlsx) dan PDF belum tersedia di versi ini — CSV bisa langsung
        dibuka di Excel/Google Sheets.
      </p>
    </div>
  );
}
