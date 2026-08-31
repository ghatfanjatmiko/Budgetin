"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { useToast } from "@/components/Toast";
import LoadingState from "@/components/LoadingState";
import type { SubscriptionDebt } from "@/lib/types";
import { Plus, Bell, AlertTriangle } from "lucide-react";

/** Status jatuh tempo berdasarkan tanggal hari ini vs due_day (asumsi bulan berjalan). */
function dueStatus(due_day: number | null, status: string): { label: string; tone: "danger" | "warn" | null } {
  if (status === "Lunas" || !due_day) return { label: "", tone: null };
  const today = new Date().getDate();
  const diff = due_day - today;
  if (diff < 0) return { label: `Telat ${Math.abs(diff)} hari`, tone: "danger" };
  if (diff <= 3) return { label: diff === 0 ? "Jatuh tempo hari ini" : `${diff} hari lagi`, tone: "warn" };
  return { label: "", tone: null };
}

export default function TagihanPage() {
  const supabase = createClient();
  const { showToast } = useToast();
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
    showToast(`${tab} baru ditambahkan.`, "success");
    load();
  }

  async function updateItem(id: string, field: string, value: any) {
    await supabase.from("subscriptions_debts").update({ [field]: value }).eq("id", id);
    load();
  }

  async function removeItem(id: string, name: string) {
    if (!confirm(`Hapus "${name}"?`)) return;
    await supabase.from("subscriptions_debts").delete().eq("id", id);
    showToast("Dihapus.", "success");
    load();
  }

  const filtered = items.filter((i) => i.type === tab);
  const overdueCount = items.filter((i) => dueStatus(i.due_day, i.status).tone === "danger").length;

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title">Tagihan &amp; Hutang</h1>
        <div className="relative">
          <Bell size={18} className="text-gray-400" />
          {overdueCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
              {overdueCount}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm">
        {(["Langganan", "Hutang"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === t ? "bg-ledger text-white shadow-sm" : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="app-card py-8 text-center text-xs text-gray-400">
            Belum ada {tab.toLowerCase()}.
          </p>
        )}
        {filtered.map((item) => {
          const due = dueStatus(item.due_day, item.status);
          return (
            <div
              key={item.id}
              className={`app-card p-4 ${
                due.tone === "danger" ? "ring-2 ring-danger/40" : due.tone === "warn" ? "ring-2 ring-coin/50" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <input
                  defaultValue={item.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v) { e.target.value = item.name; return; }
                    if (v !== item.name) updateItem(item.id, "name", v);
                  }}
                  className="font-semibold text-sm text-ink bg-transparent focus:outline-none flex-1"
                />
                <select
                  defaultValue={item.status}
                  onChange={(e) => updateItem(item.id, "status", e.target.value)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                    item.status === "Lunas" ? "bg-leaf/10 text-leaf" : "bg-coin/20 text-ledger"
                  }`}
                >
                  <option>Belum Bayar</option>
                  <option>Lunas</option>
                </select>
              </div>

              {due.label && (
                <div
                  className={`mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                    due.tone === "danger" ? "bg-danger/10 text-danger" : "bg-coin/20 text-ledger"
                  }`}
                >
                  <AlertTriangle size={12} /> {due.label}
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Jatuh tempo tanggal{" "}
                  <input
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={item.due_day ?? 1}
                    onBlur={(e) => {
                      const n = Math.min(31, Math.max(1, Number(e.target.value) || 1));
                      e.target.value = String(n);
                      updateItem(item.id, "due_day", n);
                    }}
                    className="w-10 bg-transparent border-b border-line text-center"
                  />
                </span>
                <input
                  type="number"
                  min={0}
                  defaultValue={item.amount}
                  onBlur={(e) => {
                    const n = Math.max(0, Number(e.target.value) || 0);
                    e.target.value = String(n);
                    if (n !== item.amount) updateItem(item.id, "amount", n);
                  }}
                  className="font-semibold text-ink bg-transparent text-right w-28 focus:outline-none"
                />
              </div>
              <button
                onClick={() => removeItem(item.id, item.name)}
                className="mt-2 text-[11px] text-danger"
              >
                Hapus
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={addItem}
        className="app-card mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-ledger"
      >
        <Plus size={16} /> Tambah {tab}
      </button>

      {items.reduce((s, r) => s + Number(r.amount), 0) > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-[22px] bg-ledger p-4 text-white">
          <span className="text-sm">Total {tab.toLowerCase()}</span>
          <span className="font-bold">{rupiah(filtered.reduce((s, r) => s + Number(r.amount), 0))}</span>
        </div>
      )}
    </div>
  );
}
