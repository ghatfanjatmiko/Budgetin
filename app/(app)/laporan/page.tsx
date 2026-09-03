"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, currentMonthStart } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { FileText, Download, Crown } from "lucide-react";

type Row = { date: string; kind: string; name: string; qty: number; price: number };

export default function LaporanPage() {
  const supabase = createClient();
  const { showToast } = useToast();
  const [from, setFrom] = useState(currentMonthStart());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<"" | "csv" | "xlsx" | "pdf">("");
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("is_plus").eq("user_id", user.id).maybeSingle();
        setIsPlus(data?.is_plus ?? false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRows(): Promise<Row[] | null> {
    if (from > to) {
      showToast("Tanggal 'Dari' tidak boleh lebih besar dari 'Sampai'.", "error");
      return null;
    }
    const { data, error } = await supabase
      .from("transactions")
      .select("date, kind, name, qty, price")
      .gte("date", from)
      .lte("date", to)
      .order("date");

    if (error) {
      showToast("Gagal mengambil data: " + error.message, "error");
      return null;
    }
    if (!data || data.length === 0) {
      showToast("Tidak ada transaksi di rentang tanggal ini.", "error");
      return null;
    }
    return data as Row[];
  }

  function toTableRows(rows: Row[]) {
    const body = rows.map((t) => [
      t.date,
      t.kind,
      t.name,
      t.qty,
      t.price,
      Number(t.qty) * Number(t.price),
    ]);
    const total = body.reduce((s, r) => s + Number(r[5]), 0);
    return { header: ["Tanggal", "Jenis", "Nama", "Qty", "Harga Satuan", "Total"], body, total };
  }

  async function downloadCsv() {
    setLoading("csv");
    const rows = await fetchRows();
    setLoading("");
    if (!rows) return;

    const { header, body, total } = toTableRows(rows);
    const allRows = [header, ...body, ["", "", "", "", "TOTAL", total]];
    const csv = allRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-budgetin-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Laporan CSV berhasil diunduh.", "success");
  }

  async function downloadXlsx() {
    if (!isPlus) {
      showToast("Export Excel cuma buat pengguna Plus.", "error");
      return;
    }
    setLoading("xlsx");
    const rows = await fetchRows();
    if (!rows) {
      setLoading("");
      return;
    }
    const { header, body, total } = toTableRows(rows);
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, ["", "", "", "", "TOTAL", total]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `laporan-budgetin-${from}_${to}.xlsx`);
    setLoading("");
    showToast("Laporan Excel berhasil diunduh.", "success");
  }

  async function downloadPdf() {
    if (!isPlus) {
      showToast("Export PDF cuma buat pengguna Plus.", "error");
      return;
    }
    setLoading("pdf");
    const rows = await fetchRows();
    if (!rows) {
      setLoading("");
      return;
    }
    const { header, body, total } = toTableRows(rows);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan Keuangan - Budgetin'", 14, 16);
    doc.setFontSize(10);
    doc.text(`Periode: ${from} s/d ${to}`, 14, 23);

    autoTable(doc, {
      startY: 28,
      head: [header],
      body: body.map((r) => [r[0], r[1], r[2], String(r[3]), rupiah(Number(r[4])), rupiah(Number(r[5]))]),
      foot: [["", "", "", "", "TOTAL", rupiah(total)]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 35, 56] },
    });

    doc.save(`laporan-budgetin-${from}_${to}.pdf`);
    setLoading("");
    showToast("Laporan PDF berhasil diunduh.", "success");
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
          Unduh ringkasan transaksi jajan &amp; nongkrong dalam format CSV, Excel, atau PDF.
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
        disabled={loading !== ""}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ledger py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
      >
        <Download size={16} />
        {loading === "csv" ? "Menyiapkan..." : "Unduh CSV (Gratis)"}
      </button>

      <button
        onClick={downloadXlsx}
        disabled={loading !== ""}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ledger shadow-sm disabled:opacity-50"
      >
        {!isPlus && <Crown size={14} className="text-coin" />}
        {loading === "xlsx" ? "Menyiapkan..." : "Unduh Excel (.xlsx)"}
      </button>

      <button
        onClick={downloadPdf}
        disabled={loading !== ""}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ledger shadow-sm disabled:opacity-50"
      >
        {!isPlus && <Crown size={14} className="text-coin" />}
        {loading === "pdf" ? "Menyiapkan..." : "Unduh PDF"}
      </button>

      {!isPlus && (
        <p className="text-[11px] text-gray-400 text-center">
          Excel &amp; PDF cuma buat pengguna Plus — CSV tetap gratis selamanya.
        </p>
      )}
    </div>
  );
}
