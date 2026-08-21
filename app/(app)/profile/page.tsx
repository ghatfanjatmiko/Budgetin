"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Crown, User, Shield, Sliders, FileDown, Database, HelpCircle, MessageSquare, ChevronRight, LogOut } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ledger mb-1">Profil</h1>

      {/* User card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-ledger text-white flex items-center justify-center font-semibold">
          {email.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-sm text-ink">{email.split("@")[0] || "Pengguna"}</p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
      </div>

      {/* Plus banner */}
      <div className="bg-ledger rounded-2xl p-5 text-white">
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
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-line overflow-hidden">
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
