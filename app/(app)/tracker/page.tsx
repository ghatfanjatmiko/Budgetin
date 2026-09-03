"use client";

import { useEffect, useState, Suspense} from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { monthEndExclusive, useBudgetMonth } from "@/lib/month";
import { useToast } from "@/components/Toast";
import LoadingState from "@/components/LoadingState";
import MonthPicker from "@/components/MonthPicker";
import type { Transaction } from "@/lib/types";
import { ChevronRight, Search, SlidersHorizontal, Users, Copy, Check, X } from "lucide-react";
import Fab from "@/components/Fab";

function groupLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Hari ini";
  if (dateStr === yesterday) return "Kemarin";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TrackerPageInner() {
  const supabase = createClient();
  const { showToast } = useToast();
  const month = useBudgetMonth();
  const monthEnd = monthEndExclusive(month);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"Semua" | "Jajan" | "Nongkrong">("Semua");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [splitTx, setSplitTx] = useState<Transaction | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", month)
      .lt("date", monthEnd)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500); // batas aman — kalau kepentok, riwayat terlama di bulan itu nggak ikut kebawa
    setTransactions(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function removeTransaction(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    showToast("Transaksi dihapus.", "success");
    load();
  }

  if (loading) return <LoadingState />;

  const filtered = transactions.filter((t) => {
    const matchesKind = filter === "Semua" || t.kind === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || t.name.toLowerCase().includes(needle) || t.kind.toLowerCase().includes(needle);
    return matchesKind && matchesQuery;
  });
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => {
    const label = groupLabel(t.date);
    grouped[label] = grouped[label] || [];
    grouped[label].push(t);
  });

  const total = transactions.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="page-title leading-tight">Tracker</h1>
            <MonthPicker compact />
          </div>
        </div>
        <button onClick={() => setShowFilters((visible) => !visible)} aria-label="Buka filter" className={`grid h-10 w-10 place-items-center rounded-xl ${showFilters ? "bg-ledger text-white" : "bg-white text-gray-500 shadow-sm"}`}><SlidersHorizontal size={18} /></button>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-line/60 bg-white px-3 py-2 shadow-sm">
        <Search size={17} className="text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari transaksi atau kategori" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        {query && <button onClick={() => setQuery("")} aria-label="Hapus pencarian" className="text-gray-400"><X size={16} /></button>}
      </div>

      {showFilters && <div className="mb-4 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm">
        {(["Semua", "Jajan", "Nongkrong"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === f ? "bg-ledger text-white shadow-sm" : "text-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>}

      {Object.keys(grouped).length === 0 ? (
        <div className="app-card py-10 text-center text-sm text-gray-400">
          Belum ada transaksi. Catat jajan atau nongkrong pertamamu lewat tombol + 👇
        </div>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="mb-4">
            <p className="text-xs text-gray-400 mb-2 px-1">{label}</p>
            <div className="app-card divide-y divide-line overflow-hidden">
              {items.map((t) => (
                <div key={t.id}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                        t.kind === "Jajan" ? "bg-coin/20" : "bg-leaf/10"
                      }`}
                    >
                      {t.kind === "Jajan" ? "🍿" : "☕"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.kind}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      {rupiah(Number(t.qty) * Number(t.price))}
                    </p>
                    <button onClick={() => removeTransaction(t.id)} className="px-1 text-[10px] text-danger">Hapus</button>
                  </div>
                </div>
                {t.kind === "Nongkrong" && (
                  <button onClick={() => setSplitTx(t)} className="mx-4 mb-3 flex items-center gap-1.5 rounded-lg bg-coin/15 px-2.5 py-1.5 text-[11px] font-semibold text-ledger"><Users size={13} /> Split Nongkrong</button>
                )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="mb-24 mt-3 flex items-center justify-between rounded-[22px] bg-ledger p-5 text-white shadow-sm md:mb-4">
        <div>
          <p className="text-xs text-white/70">Total Bulan Ini</p>
          <p className="text-xl font-bold">{rupiah(total)}</p>
          <p className="text-[11px] text-white/60">{transactions.length} transaksi</p>
        </div>
        <ChevronRight size={20} className="text-white/60" />
      </div>

      <Fab href="/tracker/add" />
      {splitTx && <SplitSheet transaction={splitTx} onClose={() => setSplitTx(null)} />}
    </div>
  );
}

function SplitSheet({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const [people, setPeople] = useState(2);
  const [copied, setCopied] = useState(false);
  const total = Number(transaction.qty) * Number(transaction.price);
  const perPerson = Math.ceil(total / Math.max(people, 1));
  const message = `Halo semua! Untuk ${transaction.name}, totalnya ${rupiah(total)}. Kalau dibagi ${people} orang, masing-masing ${rupiah(perPerson)} ya 🙌`;

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ledger/35 p-0 md:items-center md:justify-center md:p-6">
      <div className="w-full rounded-t-[28px] bg-[#f8f6f1] p-5 shadow-2xl md:max-w-md md:rounded-[28px]">
        <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold text-coin">SPLIT NONGKRONG</p><h2 className="mt-1 text-xl font-bold tracking-tight text-ledger">{transaction.name}</h2><p className="mt-1 text-sm text-gray-500">Total {rupiah(total)}</p></div><button onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-full bg-white text-gray-500"><X size={18} /></button></div>
        <div className="app-card p-4"><p className="text-sm font-semibold text-ledger">Berapa orang yang ikut?</p><p className="mt-1 text-xs text-gray-400">Termasuk kamu yang membayar duluan.</p><div className="mt-4 flex items-center justify-between"><button onClick={() => setPeople((count) => Math.max(1, count - 1))} className="grid h-11 w-11 place-items-center rounded-xl bg-paper text-xl font-bold">−</button><div className="text-center"><p className="text-3xl font-bold tracking-tight text-ledger">{people}</p><p className="text-xs text-gray-400">orang</p></div><button onClick={() => setPeople((count) => count + 1)} className="grid h-11 w-11 place-items-center rounded-xl bg-ledger text-xl font-bold text-white">+</button></div></div>
        <div className="mt-3 rounded-2xl bg-ledger p-4 text-white"><p className="text-xs text-white/65">Bagian per orang</p><p className="mt-1 text-2xl font-bold tracking-tight">{rupiah(perPerson)}</p><p className="mt-1 text-[11px] text-white/60">Pembulatan ke atas; total dibayar dahulu oleh kamu.</p></div>
        <div className="mt-3 rounded-2xl bg-white p-3 text-xs leading-relaxed text-gray-600">{message}</div>
        <button onClick={copyMessage} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-coin py-3 text-sm font-bold text-ledger">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Pesan tersalin" : "Salin pesan untuk WhatsApp"}</button>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TrackerPageInner />
    </Suspense>
  );
}
