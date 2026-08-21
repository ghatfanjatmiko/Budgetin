"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, currentMonthStart } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { ChevronRight, Filter } from "lucide-react";
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

export default function TrackerPage() {
  const supabase = createClient();
  const month = currentMonthStart();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"Semua" | "Jajan" | "Nongkrong">("Semua");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", month)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setTransactions(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function removeTransaction(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    load();
  }

  if (loading) return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;

  const filtered = transactions.filter((t) => filter === "Semua" || t.kind === filter);
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((t) => {
    const label = groupLabel(t.date);
    grouped[label] = grouped[label] || [];
    grouped[label].push(t);
  });

  const total = transactions.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-ledger leading-tight">Tracker</h1>
            <p className="text-[11px] text-gray-400 capitalize">
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Filter size={18} className="text-gray-400" />
      </div>

      <div className="flex gap-2 mb-4">
        {(["Semua", "Jajan", "Nongkrong"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === f ? "bg-ledger text-white" : "bg-white text-gray-500 border border-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-10 text-sm text-gray-400">
          Belum ada transaksi. Catat jajan atau nongkrong pertamamu lewat tombol + 👇
        </div>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="mb-4">
            <p className="text-xs text-gray-400 mb-2 px-1">{label}</p>
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-line overflow-hidden">
              {items.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
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
                    <button
                      onClick={() => removeTransaction(t.id)}
                      className="text-[10px] text-danger px-1"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="bg-ledger text-white rounded-2xl p-4 flex items-center justify-between mt-2 mb-24 md:mb-4">
        <div>
          <p className="text-xs text-white/70">Total Bulan Ini</p>
          <p className="text-xl font-bold">{rupiah(total)}</p>
          <p className="text-[11px] text-white/60">{transactions.length} transaksi</p>
        </div>
        <ChevronRight size={20} className="text-white/60" />
      </div>

      <Fab href="/tracker/add" />
    </div>
  );
}
