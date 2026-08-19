"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Budgetin' logo" className="w-12 h-12 rounded-xl mb-4" />
        <h1 className="font-bold text-2xl text-ledger mb-1">Budgetin&apos;</h1>
        <p className="text-sm text-gray-400 mb-6">Masuk ke akunmu</p>

        {sent ? (
          <p className="text-sm text-ledger leading-relaxed">
            Link login sudah dikirim ke <b>{email}</b>. Cek inbox (atau folder
            spam) kamu, lalu klik link-nya untuk masuk.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-line px-4 py-2.5 text-sm bg-paper focus:outline-none focus:border-mint"
                placeholder="kamu@email.com"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ledger text-white text-sm font-medium rounded-full py-3 disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Link Login"}
            </button>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Tidak perlu password — kamu akan menerima link login lewat
              email (magic link).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
