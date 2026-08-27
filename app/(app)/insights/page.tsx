"use client";

import { useEffect, useState, Suspense} from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { monthEndExclusive, previousMonthStart, useBudgetMonth } from "@/lib/month";
import MonthPicker from "@/components/MonthPicker";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Tx = { date: string; kind: "Jajan" | "Nongkrong"; name: string; qty: number; price: number };

function InsightsPageInner() {
  const supabase = createClient();
  const month = useBudgetMonth();
  const monthEnd = monthEndExclusive(month);

  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<Tx[]>([]);
  const [lastMonthActual, setLastMonthActual] = useState(0);
  const [campus, setCampus] = useState<string | null>(null);
  const [benchmark, setBenchmark] = useState<{ user_count: number; avg_total: number } | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function load() {
    setLoading(true);
    const lastMonthStart = previousMonthStart(month);

    const [t, tLast] = await Promise.all([
      supabase.from("transactions").select("date, kind, name, qty, price").gte("date", month).lt("date", monthEnd).order("date"),
      supabase.from("transactions").select("qty, price").gte("date", lastMonthStart).lt("date", month),
    ]);
    setTx((t.data ?? []) as Tx[]);
    setLastMonthActual(
      (tLast.data ?? []).reduce((s: number, r: any) => s + Number(r.qty) * Number(r.price), 0)
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("campus")
        .eq("user_id", user.id)
        .maybeSingle();
      setCampus(profile?.campus ?? null);

      if (profile?.campus) {
        const { data: bench } = await supabase.rpc("get_campus_benchmark", { target_month: month });
        setBenchmark(bench && bench.length > 0 ? bench[0] : null);
      } else {
        setBenchmark(null);
      }
    }

    setLoading(false);
  }

  if (loading) return <p className="text-sm text-gray-400 py-10">Memuat data...</p>;

  // ---------- Prediksi akhir bulan (dihitung nyata dari data transaksi) ----------
  const now = new Date();
  const [selectedYear, selectedMonth] = month.split("-").map(Number);
  const isCurrentMonth = month === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const byDate: Record<string, number> = {};
  tx.forEach((t) => {
    byDate[t.date] = (byDate[t.date] || 0) + Number(t.qty) * Number(t.price);
  });
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth;
  const actualSoFar = tx.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0);
  const avgDaily = actualSoFar / elapsedDays;
  const remainingDays = isCurrentMonth ? Math.max(daysInMonth - elapsedDays, 0) : 0;
  const projectedTotal = actualSoFar + avgDaily * remainingDays;

  // cumulative running series for the chart, then project forward with a dashed continuation
  let running = 0;
  const historyPoints = Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => {
      running += amount;
      return { label: date.slice(8, 10), actual: running, projected: null as number | null };
    });
  const lastActualPoint = historyPoints[historyPoints.length - 1];
  const projectionPoints = [];
  if (lastActualPoint) {
    let projRunning = lastActualPoint.actual;
    const step = remainingDays > 0 ? avgDaily : 0;
    for (let d = elapsedDays + 1; d <= daysInMonth; d += Math.max(1, Math.floor(daysInMonth / 6))) {
      projRunning += step * Math.max(1, Math.floor(daysInMonth / 6));
      projectionPoints.push({ label: String(d).padStart(2, "0"), actual: null, projected: Math.round(projRunning) });
    }
  }
  const chartData = [...historyPoints, ...projectionPoints];

  // ---------- Kategori pengeluaran tertinggi ----------
  const byKind: Record<string, number> = {};
  tx.forEach((t) => {
    byKind[t.kind] = (byKind[t.kind] || 0) + Number(t.qty) * Number(t.price);
  });
  const topCategories = Object.entries(byKind)
    .sort((a, b) => b[1] - a[1])
    .map(([kind, total]) => ({ kind, total }));

  // ---------- Performa vs bulan lalu ----------
  const pct =
    lastMonthActual > 0
      ? (((lastMonthActual - actualSoFar) / lastMonthActual) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      <h1 className="page-title mb-1">Insights</h1>
      <MonthPicker />

      {/* Prediksi */}
      <div className="app-card p-5">
        <p className="text-sm text-gray-500 mb-1">Prediksi Akhir Bulan</p>
        <p className="text-xs text-gray-400 mb-3">
          Dengan pola pengeluaran saat ini, uangmu diperkirakan habis pada
        </p>
        {tx.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Belum ada transaksi bulan ini untuk dianalisis.
          </p>
        ) : (
          <>
            <p className="text-2xl font-bold text-ledger mb-3">
              {projectedTotal > 0 ? rupiah(projectedTotal) : "-"} {isCurrentMonth ? "pada akhir bulan" : "pada bulan tersebut"}
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => rupiah(Number(v))} />
                  <Line type="monotone" dataKey="actual" stroke="#182338" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#182338"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Rata-rata {rupiah(avgDaily)}/hari, dihitung dari {elapsedDays} hari transaksi tercatat.
              Garis putus-putus = proyeksi ke depan, bukan data asli.
            </p>
          </>
        )}
      </div>

      {/* Pengeluaran tertinggi */}
      <div className="app-card p-5">
        <p className="font-semibold text-sm text-ledger mb-3">Pengeluaran Tertinggi</p>
        <p className="text-xs text-gray-400 mb-3">Kategori dengan pengeluaran terbesar</p>
        {topCategories.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Belum ada data.</p>
        ) : (
          <div className="space-y-2">
            {topCategories.map((c, idx) => (
              <div key={c.kind} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-paper text-[11px] flex items-center justify-center font-semibold text-ledger">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-ink">{c.kind === "Jajan" ? "🍿 Jajan" : "☕ Nongkrong"}</span>
                </div>
                <span className="text-sm font-medium text-ink">{rupiah(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performa budget */}
      <div className="app-card p-5">
        <p className="font-semibold text-sm text-ledger mb-1">Performa Budget</p>
        {pct === null ? (
          <p className="text-xs text-gray-400">
            Belum ada data bulan lalu untuk dibandingkan.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-1">
              {Number(pct) >= 0
                ? "Kamu mengontrol pengeluaran lebih baik dari bulan lalu"
                : "Pengeluaranmu naik dibanding bulan lalu"}
            </p>
            <p className={`text-2xl font-bold ${Number(pct) >= 0 ? "text-leaf" : "text-danger"}`}>
              {Number(pct) >= 0 ? "+" : ""}
              {pct}%
            </p>
          </>
        )}
      </div>
      {/* Benchmark Komunitas Kampus */}
      <div className="app-card p-5">
        <p className="font-semibold text-sm text-ledger mb-1">Benchmark Komunitas Kampus</p>
        <p className="text-xs text-gray-400 mb-3">
          Bandingkan pengeluaran jajan &amp; nongkrong bulan ini dengan rata-rata mahasiswa lain di kampusmu (anonim &amp; agregat).
        </p>
        {!campus ? (
          <div className="rounded-xl bg-[#f7f6f0] px-3 py-3 text-xs text-gray-500">
            Isi nama kampusmu dulu di{" "}
            <Link href="/profile" className="text-ledger font-medium underline">
              halaman Profil
            </Link>{" "}
            supaya fitur ini bisa jalan.
          </div>
        ) : !benchmark ? (
          <div className="rounded-xl bg-[#f7f6f0] px-3 py-3 text-xs text-gray-500">
            Belum cukup pengguna lain dari <b>{campus}</b> yang tercatat bulan
            ini (minimal 3 orang) untuk perbandingan anonim.
          </div>
        ) : (
          <div className="space-y-3">
            <BenchmarkBar
              label="Kamu"
              value={tx.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0)}
              max={Math.max(
                tx.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0),
                benchmark.avg_total,
                1
              )}
              color="bg-leaf"
            />
            <BenchmarkBar
              label={`Rata-rata ${campus}`}
              value={benchmark.avg_total}
              max={Math.max(
                tx.reduce((s, t) => s + Number(t.qty) * Number(t.price), 0),
                benchmark.avg_total,
                1
              )}
              color="bg-coin"
            />
            <p className="text-[11px] text-gray-400">
              Dihitung dari {benchmark.user_count} pengguna anonim di kampus yang sama.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BenchmarkBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-ink">{rupiah(value)}</span>
      </div>
      <div className="h-2 bg-line rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400 py-10">Memuat data...</p>}>
      <InsightsPageInner />
    </Suspense>
  );
}
