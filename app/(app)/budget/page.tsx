"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, currentMonthStart } from "@/lib/format";
import type {
  Income,
  Saving,
  FixedExpense,
  VariableExpense,
} from "@/lib/types";

export default function DashboardPage() {
  const supabase = createClient();
  const month = currentMonthStart();

  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState<Income[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [fixed, setFixed] = useState<FixedExpense[]>([]);
  const [variable, setVariable] = useState<VariableExpense[]>([]);
  const [autoActual, setAutoActual] = useState(0);

  async function loadAll() {
    setLoading(true);
    const [i, s, f, v, t] = await Promise.all([
      supabase.from("income").select("*").eq("month", month).order("created_at"),
      supabase.from("savings").select("*").eq("month", month).order("created_at"),
      supabase.from("fixed_expenses").select("*").eq("month", month).order("created_at"),
      supabase.from("variable_expenses").select("*").eq("month", month).order("created_at"),
      supabase.from("transactions").select("qty, price").gte("date", month),
    ]);
    setIncome(i.data ?? []);
    setSavings(s.data ?? []);
    setFixed(f.data ?? []);
    setVariable(v.data ?? []);
    const total = (t.data ?? []).reduce(
      (sum: number, r: any) => sum + Number(r.qty) * Number(r.price),
      0
    );
    setAutoActual(total);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const totalExpense = fixedTotal + autoActual;
  const sisa = incomeTotal - savingsTotal - totalExpense;

  if (loading) {
    return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-ledger mb-4">Halaman Budgeting</h1>

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
        <Table head={["Kategori", "Rencana", "Aktual", ""]}>
          {variable.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line">
              <Td>
                {row.is_auto ? (
                  <span>{row.category}</span>
                ) : (
                  <TextInput
                    value={row.category}
                    onCommit={(v) => updateVariable(row.id, "category", v)}
                  />
                )}
              </Td>
              <TdNum>
                <NumberInput
                  value={row.plan_amount}
                  onCommit={(v) => updateVariable(row.id, "plan_amount", v)}
                />
              </TdNum>
              <TdNum>
                {row.is_auto ? (
                  <span title="Otomatis dari Tracker">{rupiah(autoActual)} 🔗</span>
                ) : (
                  "—"
                )}
              </TdNum>
              <TdAction>
                {!row.is_auto && <DeleteButton onClick={() => removeVariable(row.id)} />}
              </TdAction>
            </tr>
          ))}
        </Table>
        <p className="text-[11px] text-gray-400 mt-2">
          Tambahkan baris dengan kategori &quot;Jajan &amp; Nongkrong&quot; dan
          set <code>is_auto = true</code> di Supabase supaya otomatis
          terhubung ke total transaksi Tracker.
        </p>
      </Section>

    </div>
  );
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
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div
        className={`font-bold text-xl ${
          negative ? "text-danger" : accent ? "text-leaf" : "text-ledger"
        }`}
      >
        {value}
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
    <div className="mb-6 bg-white rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-ledger">{title}</h2>
        {total && <span className="text-xs text-gray-400">total: {total}</span>}
      </div>
      {children}
      <button
        onClick={onAdd}
        className="mt-3 text-xs font-medium text-ledger bg-paper rounded-full px-4 py-2 hover:bg-line"
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
      className="w-full bg-transparent text-sm focus:outline-none focus:bg-paper"
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
      className="w-full bg-transparent text-sm text-right focus:outline-none focus:bg-paper"
    />
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-danger rounded-full px-2.5 py-1 hover:bg-danger hover:text-white transition"
    >
      Hapus
    </button>
  );
}
