"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoadingState from "@/components/LoadingState";
import { ArrowLeft, Mail, Calendar, Crown, GraduationCap } from "lucide-react";

export default function InformasiAkunPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [campus, setCampus] = useState<string | null>(null);
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        setCreatedAt(
          user.created_at
            ? new Date(user.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-"
        );
        const { data } = await supabase
          .from("profiles")
          .select("campus, is_plus")
          .eq("user_id", user.id)
          .maybeSingle();
        setCampus(data?.campus ?? null);
        setIsPlus(data?.is_plus ?? false);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/profile" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Informasi Akun</h1>
      </div>

      <div className="app-card divide-y divide-line overflow-hidden">
        <InfoRow icon={Mail} label="Email" value={email} />
        <InfoRow icon={Calendar} label="Bergabung sejak" value={createdAt} />
        <InfoRow icon={GraduationCap} label="Kampus" value={campus || "Belum diisi"} />
        <InfoRow
          icon={Crown}
          label="Status"
          value={isPlus ? "Budgetin' Plus" : "Gratis"}
        />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon size={16} className="text-gray-400 flex-none" />
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm text-ink font-medium">{value}</p>
      </div>
    </div>
  );
}
