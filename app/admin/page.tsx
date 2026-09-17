"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import LoadingState from "@/components/LoadingState";
import { Users, Crown, Receipt, UserPlus, Wallet, ShieldAlert } from "lucide-react";

type Stats = {
  total_users: number;
  total_plus_users: number;
  total_transactions: number;
  new_users_7d: number;
  total_income_this_month: number;
};

export default function AdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      if (error || !data || data.length === 0) {
        setDenied(true);
        setLoading(false);
        return;
      }
      setStats(data[0]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper px-5 py-6">
        <LoadingState />
      </div>
    );
  }

  if (denied || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
        <ShieldAlert size={32} className="mb-3 text-danger" />
        <p className="text-sm font-semibold text-ink">Akses ditolak</p>
        <p className="mt-1 text-xs text-gray-400">
          Halaman ini cuma buat admin. Kalau ini seharusnya akun kamu,
          tambahkan user_id kamu ke tabel <code>admins</code> lewat SQL
          Editor Supabase.
        </p>
      </div>
    );
  }

  const cards = [
    { icon: Users, label: "Total Pengguna", value: stats.total_users, color: "text-ledger", bg: "bg-ledger/10" },
    { icon: Crown, label: "Pengguna Plus", value: stats.total_plus_users, color: "text-coin", bg: "bg-coin/20" },
    { icon: Receipt, label: "Total Transaksi", value: stats.total_transactions, color: "text-leaf", bg: "bg-leaf/10" },
    { icon: UserPlus, label: "Pengguna Baru (7 hari)", value: stats.new_users_7d, color: "text-danger", bg: "bg-danger/10" },
  ];

  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-2xl mx-auto">
      <h1 className="page-title mb-1">Admin Dashboard</h1>
      <p className="text-xs text-gray-400 mb-5">
        Statistik agregat — sesuai "Metrik Keberhasilan" di PRD.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="app-card p-4">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>
                <Icon size={17} className={c.color} />
              </div>
              <p className="text-xl font-bold text-ink">{c.value}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="app-card p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-leaf/10">
          <Wallet size={17} className="text-leaf" />
        </div>
        <p className="text-xl font-bold text-ink">{rupiah(stats.total_income_this_month)}</p>
        <p className="text-xs text-gray-400">Total pendapatan tercatat semua pengguna (bulan ini)</p>
      </div>
    </div>
  );
}
