"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { upgradeWhatsAppLink, feedbackWhatsAppLink } from "@/lib/whatsapp";
import { useToast } from "@/components/Toast";
import { Crown, User, Shield, FileDown, Database, HelpCircle, MessageSquare, ChevronRight, LogOut, GraduationCap, Check } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");
  const [isPlus, setIsPlus] = useState(false);
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
      const { data } = await supabase.from("profiles").select("campus, is_plus").eq("user_id", user.id).maybeSingle();
      setCampus(data?.campus ?? "");
      setIsPlus(data?.is_plus ?? false);
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

  function handleUpgrade() {
    const link = upgradeWhatsAppLink(email);
    if (!link) {
      showToast(
        "Nomor WA admin belum di-set (env NEXT_PUBLIC_ADMIN_WHATSAPP).",
        "error"
      );
      return;
    }
    window.open(link, "_blank");
  }

  function handleFeedback() {
    const link = feedbackWhatsAppLink(email);
    if (!link) {
      showToast(
        "Nomor WA admin belum di-set (env NEXT_PUBLIC_ADMIN_WHATSAPP).",
        "error"
      );
      return;
    }
    window.open(link, "_blank");
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
        {isPlus ? (
          <div className="flex items-center gap-2 text-sm text-coin">
            <Check size={16} /> Kamu sudah Plus — semua fitur premium aktif.
          </div>
        ) : (
          <>
            <p className="text-xs text-white/70 mb-3">
              Buka Scan Struk AI dan export laporan Excel/PDF.
            </p>
            <button
              onClick={handleUpgrade}
              className="bg-coin text-ledger text-sm font-semibold rounded-full px-4 py-2"
            >
              Upgrade Sekarang
            </button>
            <p className="mt-2 text-[10px] text-white/50">
              Upgrade diproses manual lewat WhatsApp, bukan otomatis.
            </p>
          </>
        )}
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
        <Link href="/profile/akun">
          <ProfileRow icon={User} label="Informasi Akun" />
        </Link>
        <Link href="/profile/keamanan">
          <ProfileRow icon={Shield} label="Keamanan" />
        </Link>
      </ProfileSection>

      <ProfileSection title="Data & Laporan">
        <Link href="/laporan">
          <ProfileRow icon={FileDown} label="Unduh Laporan" />
        </Link>
        <Link href="/profile/kelola-data">
          <ProfileRow icon={Database} label="Kelola Data" />
        </Link>
      </ProfileSection>

      <ProfileSection title="Bantuan">
        <Link href="/panduan">
          <ProfileRow icon={HelpCircle} label="Pusat Bantuan" />
        </Link>
        <div onClick={handleFeedback}>
          <ProfileRow icon={MessageSquare} label="Kirim Masukan" />
        </div>
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
