"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { ArrowLeft } from "lucide-react";

export default function KeamananPage() {
  const supabase = createClient();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      showToast("Password minimal 6 karakter.", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Konfirmasi password tidak sama.", "error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Password berhasil diganti.", "success");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/profile" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Keamanan</h1>
      </div>

      <form onSubmit={handleSubmit} className="app-card space-y-4 p-5">
        <p className="text-xs text-gray-400">Ganti password akunmu.</p>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Password Baru</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-control"
            placeholder="minimal 6 karakter"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Konfirmasi Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field-control"
            placeholder="ulangi password baru"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ledger py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Ganti Password"}
        </button>
      </form>
    </div>
  );
}
