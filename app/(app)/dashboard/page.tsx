"use client";

import LoadingState from "@/components/LoadingState";
import { useEffect, useState, Suspense} from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { monthEndExclusive, previousMonthStart, useBudgetMonth } from "@/lib/month";
import MonthPicker from "@/components/MonthPicker";
import { Wallet, TrendingDown, PiggyBank, ChevronRight, ShieldCheck, Bell, ArrowUpRight, Flame } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
} from "recharts";

type Tx = { id: string; date: string; kind: "Jajan" | "Nongkrong"; name: string; price: number; qty: number };

function computeStreak(dates: string[]): number {
  const uniqueSorted = Array.from(new Set(dates)).sort().reverse(); // terbaru dulu
  if (uniqueSorted.length === 0) return 0;
  let streak = 1;
  for (let i = 0; i < uniqueSorted.length - 1; i++) {
    const cur = new Date(uniqueSorted[i]);
    const next = new Date(uniqueSorted[i + 1]);
    const diffDays = Math.round((cur.getTime() - next.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  // kalau transaksi terakhir bukan hari ini/kemarin, streak-nya sudah putus
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (uniqueSorted[0] !== today && uniqueSorted[0] !== yesterday) return 0;
  return streak;
}

function streakBadge(streak: number): { label: string; emoji: string } | null {
  if (streak >= 30) return { label: "Gold Streaker", emoji: "🏆" };
  if (streak >= 14) return { label: "Silver Streaker", emoji: "🥈" };
  if (streak >= 7) return { label: "Bronze Streaker", emoji: "🥉" };
  return null;
}

function HomePageInner() {
  const supabase = createClient();
  const month = useBudgetMonth();
  const monthEnd = monthEndExclusive(month);

  const [loading, setLoading] = useState(true);
  const [greetingName, setGreetingName] = useState("");
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [fixedTotal, setFixedTotal] = useState(0);
  const [planTotal, setPlanTotal] = useState(0);
  const [actualTotal, setActualTotal] = useState(0);
  const [recentTx, setRecentTx] = useState<Tx[]>([]);
  const [chartData, setChartData] = useState<{ day: string; total: number }[]>([]);
  const [lastMonthActual, setLastMonthActual] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    setGreetingName(user?.email?.split("@")[0] ?? "");

    const lastMonthStart = previousMonthStart(month);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

    const [i, s, f, v, tx, txLast, txStreak] = await Promise.all([
      supabase.from("income").select("amount").eq("month", month),
      supabase.from("savings").select("amount").eq("month", month),
      supabase.from("fixed_expenses").select("amount").eq("month", month),
      supabase.from("variable_expenses").select("plan_amount").eq("month", month),
      supabase.from("transactions").select("*").gte("date", month).lt("date", monthEnd).order("date", { ascending: false }),
      supabase
        .from("transactions")
        .select("qty, price")
        .gte("date", lastMonthStart)
        .lt("date", month),
      supabase.from("transactions").select("date").gte("date", sixtyDaysAgo),
    ]);

    const inc = (i.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
    const sav = (s.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
    const fix = (f.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
    const plan = (v.data ?? []).reduce((s, r: any) => s + Number(r.plan_amount), 0);
    const txData = (tx.data ?? []) as Tx[];
    const actual = txData.reduce((s, r) => s + Number(r.qty) * Number(r.price), 0);
    const lastActual = (txLast.data ?? []).reduce(
      (s: number, r: any) => s + Number(r.qty) * Number(r.price),
      0
    );

    setIncomeTotal(inc);
    setSavingsTotal(sav);
    setFixedTotal(fix);
    setPlanTotal(plan + fix);
    setActualTotal(actual);
    setLastMonthActual(lastActual);
    setRecentTx(txData.slice(0, 5));

    const streakDates = ((txStreak.data ?? []) as { date: string }[]).map((r) => r.date);
    setStreak(computeStreak(streakDates));

    // group by day for the mini chart
    const byDay: Record<string, number> = {};
    txData.forEach((t) => {
      const d = t.date.slice(8, 10);
      byDay[d] = (byDay[d] || 0) + Number(t.qty) * Number(t.price);
    });
    setChartData(
      Object.entries(byDay)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, total]) => ({ day, total }))
    );

    setLoading(false);
  }

  const totalExpense = fixedTotal + actualTotal;
  const sisa = incomeTotal - savingsTotal - totalExpense;
  const budgetPct = planTotal > 0 ? Math.max(0, Math.min(100, ((planTotal - totalExpense) / planTotal) * 100)) : 100;
  const pctVsLastMonth =
    lastMonthActual > 0 ? (((lastMonthActual - actualTotal) / lastMonthActual) * 100).toFixed(1) : null;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-3.5">
      {/* Greeting */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Budgetin' logo" className="w-11 h-11 rounded-xl" />
        <div>
          <p className="text-sm text-gray-500">
            Good morning, <span className="font-semibold text-ledger">{greetingName || "kamu"}</span> 👋
          </p>
          <MonthPicker compact />
        </div>
        </div>
        <button aria-label="Notifikasi" className="grid h-10 w-10 place-items-center rounded-full bg-white text-ledger shadow-sm"><Bell size={19} /></button>
      </div>

      {/* Balance card */}
      <div className="app-card relative overflow-hidden p-5">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-coin/10" />
        <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Sisa uang bulan ini</p>
          <p className={`text-[30px] font-bold tracking-[-0.045em] ${sisa < 0 ? "text-danger" : "text-ledger"}`}>
            {rupiah(sisa)}
          </p>
          {pctVsLastMonth && (
            <p className={`text-xs mt-1 ${Number(pctVsLastMonth) >= 0 ? "text-leaf" : "text-danger"}`}>
              <ArrowUpRight size={14} className="mr-1 inline" />{Math.abs(Number(pctVsLastMonth))}% dari bulan lalu
            </p>
          )}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coin/20">
          <Wallet className="text-coin" size={26} />
        </div>
        </div>
      </div>

      {/* Budget health */}
      <div className="app-card p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-sm text-ledger">Budget Health</p>
          <p className="text-xs text-gray-500">{budgetPct.toFixed(0)}% budget tersisa</p>
        </div>
        <div className="h-2.5 bg-line rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full ${budgetPct < 20 ? "bg-danger" : "bg-leaf"}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>
            Aktual <b className="text-ink">{rupiah(totalExpense)}</b>
          </span>
          <span>
            Rencana <b className="text-ink">{rupiah(planTotal)}</b>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#f7f6f0] px-3 py-2.5 text-xs text-leaf">
          <ShieldCheck size={14} />
          {budgetPct > 20 ? "Kamu masih dalam batas aman bulan ini." : "Hati-hati, budgetmu hampir habis."}
        </div>
      </div>

      {/* Streak */}
      <div className="app-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-coin/20 flex items-center justify-center">
            <Flame className="text-coin" size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ledger">{streak} hari streak nyatet</p>
            <p className="text-xs text-gray-400">
              {streak === 0
                ? "Catat hari ini biar streak-mu mulai jalan!"
                : "Konsisten nyatet bikin kamu makin sadar pola jajanmu."}
            </p>
          </div>
        </div>
        {streakBadge(streak) && (
          <span className="text-xs font-semibold bg-coin/20 text-ledger rounded-full px-3 py-1.5 whitespace-nowrap">
            {streakBadge(streak)!.emoji} {streakBadge(streak)!.label}
          </span>
        )}
      </div>

      {/* 3-stat grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard icon={Wallet} label="Pendapatan" value={rupiah(incomeTotal)} color="text-leaf" bg="bg-leaf/10" />
        <StatCard icon={TrendingDown} label="Pengeluaran" value={rupiah(totalExpense)} color="text-danger" bg="bg-danger/10" />
        <StatCard icon={PiggyBank} label="Tabungan" value={rupiah(savingsTotal)} color="text-leaf" bg="bg-leaf/10" />
      </div>

      {/* Jajan & Nongkrong mini chart */}
      <div className="app-card p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">Jajan &amp; Nongkrong</p>
            <p className="text-xl font-bold text-ledger">{rupiah(actualTotal)}</p>
            <p className="text-xs text-gray-400">{recentTx.length > 0 ? `${chartData.length} hari tercatat` : "Belum ada transaksi"}</p>
          </div>
          <Link href="/insights" className="text-xs text-ledger flex items-center gap-1">
            Lihat detail <ChevronRight size={14} />
          </Link>
        </div>
        {chartData.length > 0 && (
          <div className="h-24 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Bar dataKey="total" fill="#D9A94A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="app-card p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-sm text-ledger">Transaksi Terakhir</p>
          <Link href="/tracker" className="text-xs text-ledger flex items-center gap-1">
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Belum ada transaksi bulan ini.</p>
        ) : (
          <div className="space-y-3">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.kind === "Jajan" ? "bg-coin/20" : "bg-leaf/10"}`}>
                    {t.kind === "Jajan" ? "🍿" : "☕"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.kind}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-ink">{rupiah(Number(t.qty) * Number(t.price))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="app-card flex flex-col items-start gap-2 p-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg}`}>
        <Icon size={15} className={color} />
      </div>
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className={`text-sm font-semibold tracking-[-0.035em] ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HomePageInner />
    </Suspense>
  );
}
