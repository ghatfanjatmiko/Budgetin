"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Crown, User, Shield, Sliders, FileDown, Database, HelpCircle, MessageSquare, ChevronRight, LogOut, GraduationCap } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");
  const [savingCampus, setSavingCampus] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setEmail(user?.email ?? "");
    if (user) {
      const { data } = await supabase.from("profiles").select("campus").eq("user_id", user.id).maybeSingle();
      setCampus(data?.campus ?? "");
    }
  }

  async function saveCampus() {
    setSavingCampus(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("profiles").upsert({ user_id: user!.id, campus, updated_at: new Date().toISOString() });
    setSavingCampus(false);
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title mb-1">Profil</h1>

      {/* User card */}
      <div className="app-card flex items-center gap-3 p-5">
        <div className="w-12 h-12 rounded-full bg-ledger text-white flex items-center justify-center font-semibold">
          {email.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-sm text-ink">{email.split("@")[0] || "Pengguna"}</p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
      </div>

      {/* Plus banner */}
      <div className="rounded-[22px] bg-ledger p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={16} className="text-coin" />
          <p className="font-semibold text-sm">Budgetin&apos; Plus</p>
        </div>
        <p className="text-xs text-white/70 mb-3">
          Upgrade untuk fitur premium dan insight lebih lengkap.
        </p>
        <button className="bg-coin text-ledger text-sm font-semibold rounded-full px-4 py-2">
          Upgrade Sekarang
        </button>
      </div>

      {/* Kampus — dipakai untuk Benchmark Komunitas Kampus */}
      <div className="app-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={16} className="text-ledger" />
          <p className="font-semibold text-sm text-ledger">Kampus Kamu</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Diisi supaya kamu bisa lihat perbandingan pengeluaran dengan mahasiswa lain di kampus yang sama (anonim &amp; agregat) di halaman Insights.
        </p>
        <div className="flex gap-2">
          <input
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            placeholder="mis. IKBIS"
            className="field-control flex-1"
          />
          <button
            onClick={saveCampus}
            disabled={savingCampus}
            className="bg-ledger text-white text-sm font-medium rounded-xl px-4 disabled:opacity-50"
          >
            {savedTick ? "Tersimpan ✓" : savingCampus ? "..." : "Simpan"}
          </button>
        </div>
      </div>

      <ProfileSection title="Akun">
        <ProfileRow icon={User} label="Informasi Akun" />
        <ProfileRow icon={Shield} label="Keamanan" />
        <ProfileRow icon={Sliders} label="Preferensi" />
      </ProfileSection>

      <ProfileSection title="Data & Laporan">
        <Link href="/laporan">
          <ProfileRow icon={FileDown} label="Unduh Laporan" />
        </Link>
        <ProfileRow icon={Database} label="Kelola Data" />
      </ProfileSection>

      <ProfileSection title="Bantuan">
        <ProfileRow icon={HelpCircle} label="Pusat Bantuan" />
        <ProfileRow icon={MessageSquare} label="Kirim Masukan" />
      </ProfileSection>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm py-3 text-sm font-medium text-danger"
      >
        <LogOut size={16} /> Keluar
      </button>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 px-1">{title}</p>
      <div className="app-card divide-y divide-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-paper">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-gray-400" />
        <span className="text-sm text-ink">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </div>
  );
}
