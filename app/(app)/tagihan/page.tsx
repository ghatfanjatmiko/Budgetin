"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import type { SubscriptionDebt } from "@/lib/types";
import { Plus, Bell } from "lucide-react";

export default function TagihanPage() {
  const supabase = createClient();
  const [items, setItems] = useState<SubscriptionDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"Langganan" | "Hutang">("Langganan");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions_debts")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function currentUserId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user!.id;
  }

  async function addItem() {
    await supabase.from("subscriptions_debts").insert({
      user_id: await currentUserId(),
      type: tab,
      name: tab === "Langganan" ? "Langganan Baru" : "Hutang Baru",
      due_day: 1,
      amount: 0,
      status: "Belum Bayar",
    });
    load();
  }

  async function updateItem(id: string, field: string, value: any) {
    await supabase.from("subscriptions_debts").update({ [field]: value }).eq("id", id);
    load();
  }

  async function removeItem(id: string) {
    await supabase.from("subscriptions_debts").delete().eq("id", id);
    load();
  }

  const filtered = items.filter((i) => i.type === tab);

  if (loading) return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-ledger">Tagihan &amp; Hutang</h1>
        <Bell size={18} className="text-gray-400" />
      </div>

      <div className="flex gap-2 mb-4">
        {(["Langganan", "Hutang"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === t ? "bg-ledger text-white" : "bg-white text-gray-500 border border-line"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8 bg-white rounded-2xl shadow-sm">
            Belum ada {tab.toLowerCase()}.
          </p>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <input
                defaultValue={item.name}
                onBlur={(e) => e.target.value !== item.name && updateItem(item.id, "name", e.target.value)}
                className="font-semibold text-sm text-ink bg-transparent focus:outline-none flex-1"
              />
              <select
                defaultValue={item.status}
                onChange={(e) => updateItem(item.id, "status", e.target.value)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  item.status === "Lunas" ? "bg-leaf/10 text-leaf" : "bg-coin/20 text-ledger"
                }`}
              >
                <option>Belum Bayar</option>
                <option>Lunas</option>
              </select>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Jatuh tempo tanggal{" "}
                <input
                  type="number"
                  defaultValue={item.due_day ?? 1}
                  onBlur={(e) => updateItem(item.id, "due_day", Number(e.target.value))}
                  className="w-10 bg-transparent border-b border-line text-center"
                />
              </span>
              <input
                type="number"
                defaultValue={item.amount}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (n !== item.amount) updateItem(item.id, "amount", n);
                }}
                className="font-semibold text-ink bg-transparent text-right w-28 focus:outline-none"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="mt-2 text-[11px] text-danger"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-line text-sm font-medium text-ledger rounded-full py-3"
      >
        <Plus size={16} /> Tambah {tab}
      </button>

      {items.reduce((s, r) => s + Number(r.amount), 0) > 0 && (
        <div className="mt-4 bg-ledger text-white rounded-2xl p-4 flex justify-between items-center">
          <span className="text-sm">Total {tab.toLowerCase()}</span>
          <span className="font-bold">{rupiah(filtered.reduce((s, r) => s + Number(r.amount), 0))}</span>
        </div>
      )}
    </div>
  );
}
