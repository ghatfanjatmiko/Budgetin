"use client";

import { useEffect, useState, Suspense} from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { monthEndExclusive, useBudgetMonth } from "@/lib/month";
import MonthPicker from "@/components/MonthPicker";
import type {
  Income,
  Saving,
  FixedExpense,
  VariableExpense,
} from "@/lib/types";

function DashboardPageInner() {
  const supabase = createClient();
  const month = useBudgetMonth();
  const monthEnd = monthEndExclusive(month);

  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState<Income[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [fixed, setFixed] = useState<FixedExpense[]>([]);
  const [variable, setVariable] = useState<VariableExpense[]>([]);
  const [autoActual, setAutoActual] = useState(0);
  const [autoActualByKind, setAutoActualByKind] = useState({ Jajan: 0, Nongkrong: 0 });

  async function loadAll() {
    setLoading(true);
    const [i, s, f, v, t] = await Promise.all([
      supabase.from("income").select("*").eq("month", month).order("created_at"),
      supabase.from("savings").select("*").eq("month", month).order("created_at"),
      supabase.from("fixed_expenses").select("*").eq("month", month).order("created_at"),
      supabase.from("variable_expenses").select("*").eq("month", month).order("created_at"),
      supabase.from("transactions").select("kind, qty, price").gte("date", month).lt("date", monthEnd),
    ]);
    setIncome(i.data ?? []);
    setSavings(s.data ?? []);
    setFixed(f.data ?? []);
    setVariable(v.data ?? []);
    const total = (t.data ?? []).reduce(
      (sum: number, r: any) => sum + Number(r.qty) * Number(r.price),
      0
    );
    const byKind = (t.data ?? []).reduce(
      (sum: { Jajan: number; Nongkrong: number }, r: any) => {
        const kind = r.kind as "Jajan" | "Nongkrong";
        if (kind === "Jajan" || kind === "Nongkrong") sum[kind] += Number(r.qty) * Number(r.price);
        return sum;
      },
      { Jajan: 0, Nongkrong: 0 }
    );
    setAutoActual(total);
    setAutoActualByKind(byKind);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function currentUserId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user!.id;
  }

  // ---------- Income ----------
  async function addIncome() {
    await supabase.from("income").insert({
      user_id: await currentUserId(),
      month,
      source: "Sumber Baru",
      type: "Aktif",
      amount: 0,
    });
    loadAll();
  }
  async function updateIncome(id: string, field: string, value: any) {
    await supabase.from("income").update({ [field]: value }).eq("id", id);
    loadAll();
  }
  async function removeIncome(id: string) {
    await supabase.from("income").delete().eq("id", id);
    loadAll();
  }

  // ---------- Savings ----------
  async function addSaving() {
    await supabase.from("savings").insert({
      user_id: await currentUserId(),
      month,
      description: "Tujuan Baru",
      priority: "Sedang",
      amount: 0,
    });
    loadAll();
  }
  async function updateSaving(id: string, field: string, value: any) {
    await supabase.from("savings").update({ [field]: value }).eq("id", id);
    loadAll();
  }
  async function removeSaving(id: string) {
    await supabase.from("savings").delete().eq("id", id);
    loadAll();
  }

  // ---------- Fixed expenses ----------
  async function addFixed() {
    await supabase.from("fixed_expenses").insert({
      user_id: await currentUserId(),
      month,
      category: "Kategori Baru",
      amount: 0,
    });
    loadAll();
  }
  async function updateFixed(id: string, field: string, value: any) {
    await supabase.from("fixed_expenses").update({ [field]: value }).eq("id", id);
    loadAll();
  }
  async function removeFixed(id: string) {
    await supabase.from("fixed_expenses").delete().eq("id", id);
    loadAll();
  }

  // ---------- Variable expenses ----------
  async function addVariable() {
    await supabase.from("variable_expenses").insert({
      user_id: await currentUserId(),
      month,
      category: "Kategori Baru",
      plan_amount: 0,
      is_auto: false,
    });
    loadAll();
  }
  async function updateVariable(id: string, field: string, value: any) {
    await supabase.from("variable_expenses").update({ [field]: value }).eq("id", id);
    loadAll();
  }
  async function removeVariable(id: string) {
    await supabase.from("variable_expenses").delete().eq("id", id);
    loadAll();
  }


  const incomeTotal = income.reduce((s, r) => s + Number(r.amount), 0);
  const savingsTotal = savings.reduce((s, r) => s + Number(r.amount), 0);
  const fixedTotal = fixed.reduce((s, r) => s + Number(r.amount), 0);
  const plannedVariable = variable.reduce((s, r) => s + Number(r.plan_amount), 0);
  const totalExpense = fixedTotal + autoActual;
  const sisa = incomeTotal - savingsTotal - totalExpense;
  const budgetTotal = fixedTotal + plannedVariable;
  const remainingPct = budgetTotal > 0 ? Math.max(0, Math.min(100, ((budgetTotal - totalExpense) / budgetTotal) * 100)) : 100;

  if (loading) {
    return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3 pb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Budgetin' logo" className="h-11 w-11 rounded-xl" />
        <div>
          <h1 className="page-title">Budget</h1>
          <MonthPicker compact />
        </div>
      </div>

      <div className="soft-card flex items-center gap-3 px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-coin/15 text-lg">💡</span>
        <div className="flex-1"><p className="text-sm font-semibold">Atur rencana budget untuk bulan ini</p><p className="text-xs text-gray-400">Rencana membantu mengontrol pengeluaran.</p></div>
        <span className="text-lg">›</span>
      </div>

      <div>
        <p className="mb-2 px-1 text-sm font-bold text-ledger">Ringkasan Budget</p>
        <div className="app-card grid grid-cols-2 gap-y-4 p-4">
          <SummaryCard label="Pendapatan" value={rupiah(incomeTotal)} accent />
          <SummaryCard label="Tabungan" value={rupiah(savingsTotal)} accent />
          <SummaryCard label="Total Budget" value={rupiah(budgetTotal)} />
          <SummaryCard label="Total Aktual" value={rupiah(totalExpense)} negative />
        </div>
      </div>

      <div className="app-card p-4">
        <div className="flex items-end justify-between"><div><p className="text-xs text-gray-500">Sisa Budget</p><p className="mt-1 text-2xl font-bold tracking-tight text-ledger">{rupiah(sisa)}</p></div><p className="text-sm font-semibold text-leaf">{remainingPct.toFixed(0)}% tersisa</p></div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-leaf" style={{ width: `${remainingPct}%` }} /></div>
      </div>

      {/* Pendapatan */}
      <Section title="Pendapatan" total={rupiah(incomeTotal)} onAdd={addIncome}>
        <Table head={["Sumber", "Tipe", "Jumlah", ""]}>
          {income.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line">
              <Td>
                <TextInput
                  value={row.source}
                  onCommit={(v) => updateIncome(row.id, "source", v)}
                />
              </Td>
              <Td>
                <select
                  defaultValue={row.type}
                  onChange={(e) => updateIncome(row.id, "type", e.target.value)}
                  className="bg-transparent text-sm"
                >
                  <option>Aktif</option>
                  <option>Pasif</option>
                </select>
              </Td>
              <TdNum>
                <NumberInput
                  value={row.amount}
                  onCommit={(v) => updateIncome(row.id, "amount", v)}
                />
              </TdNum>
              <TdAction>
                <DeleteButton onClick={() => removeIncome(row.id)} />
              </TdAction>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Nabung */}
      <Section title="Nabung" total={rupiah(savingsTotal)} onAdd={addSaving}>
        <Table head={["Keterangan", "Prioritas", "Jumlah", ""]}>
          {savings.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line">
              <Td>
                <TextInput
                  value={row.description}
                  onCommit={(v) => updateSaving(row.id, "description", v)}
                />
              </Td>
              <Td>
                <TextInput
                  value={row.priority ?? ""}
                  onCommit={(v) => updateSaving(row.id, "priority", v)}
                />
              </Td>
              <TdNum>
                <NumberInput
                  value={row.amount}
                  onCommit={(v) => updateSaving(row.id, "amount", v)}
                />
              </TdNum>
              <TdAction>
                <DeleteButton onClick={() => removeSaving(row.id)} />
              </TdAction>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Pengeluaran Tetap */}
      <Section title="Pengeluaran Tetap" total={rupiah(fixedTotal)} onAdd={addFixed}>
        <Table head={["Kategori", "Jumlah", ""]}>
          {fixed.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line">
              <Td>
                <TextInput
                  value={row.category}
                  onCommit={(v) => updateFixed(row.id, "category", v)}
                />
              </Td>
              <TdNum>
                <NumberInput
                  value={row.amount}
                  onCommit={(v) => updateFixed(row.id, "amount", v)}
                />
              </TdNum>
              <TdAction>
                <DeleteButton onClick={() => removeFixed(row.id)} />
              </TdAction>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Pengeluaran Tidak Tetap */}
      <Section title="Pengeluaran Tidak Tetap" onAdd={addVariable}>
        <Table head={["Kategori", "Rencana", "Aktual", "Auto", ""]}>
          {variable.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line">
              <Td>
                <TextInput
                  value={row.category}
                  onCommit={(v) => updateVariable(row.id, "category", v)}
                />
              </Td>
              <TdNum>
                <NumberInput
                  value={row.plan_amount}
                  onCommit={(v) => updateVariable(row.id, "plan_amount", v)}
                />
              </TdNum>
              <TdNum>
                {row.is_auto ? (
                  <span title="Otomatis dari Tracker">{rupiah(linkedActual(row.category, autoActual, autoActualByKind))} 🔗</span>
                ) : (
                  "—"
                )}
              </TdNum>
              <Td>
                <button
                  onClick={() => updateVariable(row.id, "is_auto", !row.is_auto)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${row.is_auto ? "bg-leaf/10 text-leaf" : "bg-paper text-gray-400"}`}
                  title="Hubungkan aktual kategori ini ke Tracker"
                >
                  {row.is_auto ? "Aktif" : "Manual"}
                </button>
              </Td>
              <TdAction>
                {!row.is_auto && <DeleteButton onClick={() => removeVariable(row.id)} />}
              </TdAction>
            </tr>
          ))}
        </Table>
        <p className="text-[11px] text-gray-400 mt-2">
          Pilih <b>Auto</b> untuk menghubungkan kategori ke Tracker. Nama kategori
          &quot;Jajan&quot; atau &quot;Nongkrong&quot; akan mengambil total sesuai jenis transaksi.
        </p>
      </Section>

    </div>
  );
}

function linkedActual(category: string, total: number, byKind: { Jajan: number; Nongkrong: number }) {
  const normalized = category.toLowerCase();
  if (normalized.includes("jajan") && !normalized.includes("nongkrong")) return byKind.Jajan;
  if (normalized.includes("nongkrong") && !normalized.includes("jajan")) return byKind.Nongkrong;
  return total;
}

// ---------- Reusable bits ----------

function SummaryCard({
  label,
  value,
  accent,
  negative,
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-8 w-8 place-items-center rounded-full text-sm ${negative ? "bg-danger/10" : accent ? "bg-leaf/10" : "bg-paper"}`}>{negative ? "↓" : accent ? "↗" : "◫"}</span>
      <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className={`font-bold text-base tracking-tight ${
          negative ? "text-danger" : accent ? "text-leaf" : "text-ledger"
        }`}
      >
        {value}
      </div>
      </div>
    </div>
  );
}

function Section({
  title,
  total,
  onAdd,
  children,
}: {
  title: string;
  total?: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="app-card mb-3.5 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-ledger">{title}</h2>
        {total && <span className="text-xs font-semibold text-gray-500">{total}</span>}
      </div>
      {children}
      <button
        onClick={onAdd}
        className="mt-3 rounded-xl bg-paper px-3.5 py-2 text-xs font-semibold text-ledger hover:bg-line"
      >
        + Tambah
      </button>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 border-b border-line">
          {head.map((h, i) => (
            <th
              key={i}
              className={`py-2 px-2 font-normal ${
                i === 0 ? "text-left" : i === head.length - 1 ? "" : "text-right"
              }`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-2">{children}</td>;
}
function TdNum({ children }: { children: React.ReactNode }) {
  return <td className="p-2 text-right">{children}</td>;
}
function TdAction({ children }: { children: React.ReactNode }) {
  return <td className="p-2 text-right whitespace-nowrap">{children}</td>;
}

function TextInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  return (
    <input
      defaultValue={value}
      onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
      className="w-full rounded-lg bg-transparent px-1 py-1 text-sm focus:bg-paper focus:outline-none"
    />
  );
}

function NumberInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  return (
    <input
      type="number"
      defaultValue={value}
      onBlur={(e) => {
        const n = Number(e.target.value);
        if (n !== value) onCommit(n);
      }}
      className="w-full rounded-lg bg-transparent px-1 py-1 text-right text-sm focus:bg-paper focus:outline-none"
    />
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-2 py-1 text-xs text-danger transition hover:bg-danger hover:text-white"
    >
      Hapus
    </button>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400 py-10">Memuat data...</p>}>
      <DashboardPageInner />
    </Suspense>
  );
}
