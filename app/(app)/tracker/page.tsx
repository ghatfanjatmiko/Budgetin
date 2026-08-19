"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export default function TrackerPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [kind, setKind] = useState<"Jajan" | "Nongkrong">("Jajan");
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | "">("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setTransactions(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      alert("Isi nama item dan harga satuan ya.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("transactions").insert({
      user_id: user!.id,
      date: new Date().toISOString().slice(0, 10),
      kind,
      name,
      qty,
      price,
    });

    setName("");
    setQty(1);
    setPrice("");
    load();
  }

  async function removeTransaction(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    load();
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;
  }

  return (
    <div>
      <form
        onSubmit={addTransaction}
        className="flex flex-wrap gap-2 bg-white rounded-2xl shadow-sm p-3 mb-6"
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as "Jajan" | "Nongkrong")}
          className="rounded-full border border-line px-3 py-2 text-sm bg-paper"
        >
          <option value="Jajan">🍿 Jajan</option>
          <option value="Nongkrong">☕ Nongkrong</option>
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama item / tempat"
          className="flex-1 min-w-[140px] rounded-full border border-line px-3 py-2 text-sm bg-paper"
        />
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          min={1}
          className="w-20 rounded-full border border-line px-3 py-2 text-sm bg-paper"
        />
        <input
          type="number"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Harga satuan"
          className="w-32 rounded-full border border-line px-3 py-2 text-sm bg-paper"
        />
        <button
          type="submit"
          className="bg-ledger text-white text-sm font-medium rounded-full px-5 py-2"
        >
          + Catat
        </button>
      </form>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-ledger">
          Transaksi Bulan Ini
        </h2>
        <span className="text-xs text-gray-400">
          {transactions.length} transaksi
        </span>
      </div>

      <table className="w-full text-sm bg-white rounded-2xl shadow-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-line">
            <th className="text-left py-2 px-2 font-normal">Tanggal</th>
            <th className="text-left py-2 px-2 font-normal">Jenis</th>
            <th className="text-left py-2 px-2 font-normal">Item / Tempat</th>
            <th className="text-right py-2 px-2 font-normal">Qty</th>
            <th className="text-right py-2 px-2 font-normal">Harga Satuan</th>
            <th className="text-right py-2 px-2 font-normal">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-dashed border-line">
              <td className="p-2">{t.date}</td>
              <td className="p-2">
                {t.kind === "Jajan" ? "🍿 Jajan" : "☕ Nongkrong"}
              </td>
              <td className="p-2">{t.name}</td>
              <td className="p-2 text-right">{t.qty}</td>
              <td className="p-2 text-right">{rupiah(t.price)}</td>
              <td className="p-2 text-right">{rupiah(t.qty * t.price)}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => removeTransaction(t.id)}
                  className="text-xs text-danger rounded-full px-2.5 py-1 hover:bg-danger hover:text-white transition"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-xs text-gray-400 py-8">
                Belum ada transaksi. Catat jajan atau nongkrong pertamamu di
                atas 👆
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
