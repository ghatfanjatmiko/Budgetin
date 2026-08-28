"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/set-password` },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        // "Confirm email" mati -> langsung ada sesi, langsung masuk
        router.push("/dashboard");
        router.refresh();
      } else {
        // "Confirm email" nyala -> perlu klik link konfirmasi di email dulu
        setInfo(
          `Cek email ${email} buat konfirmasi akun sebelum bisa login.`
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email atau password salah."
            : error.message
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${location.origin}/set-password`,
    });
    setForgotLoading(false);
    if (error) {
      setForgotError(error.message);
      return;
    }
    setForgotSent(true);
  }

  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Budgetin' logo" className="w-12 h-12 rounded-xl mb-4" />
          <h1 className="font-bold text-2xl text-ledger mb-1">Lupa Password</h1>
          <p className="text-sm text-gray-400 mb-6">
            Masukkan email akunmu, link reset password akan dikirim.
          </p>

          {forgotSent ? (
            <p className="text-sm text-ledger leading-relaxed">
              Kalau <b>{forgotEmail}</b> terdaftar, link reset password sudah
              dikirim. Cek inbox (atau folder spam), lalu klik link-nya.
            </p>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-full border border-line px-4 py-2.5 text-sm bg-paper focus:outline-none focus:border-mint"
                placeholder="kamu@email.com"
              />
              {forgotError && <p className="text-sm text-danger">{forgotError}</p>}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-ledger text-white text-sm font-medium rounded-full py-3 disabled:opacity-50"
              >
                {forgotLoading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
          )}

          <button
            onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(""); }}
            className="mt-4 text-xs text-gray-400 hover:text-ledger"
          >
            ← Kembali ke halaman masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Budgetin' logo" className="w-12 h-12 rounded-xl mb-4" />
        <h1 className="font-bold text-2xl text-ledger mb-1">Budgetin&apos;</h1>
        <p className="text-sm text-gray-400 mb-6">
          {mode === "login" ? "Masuk ke akunmu" : "Buat akun baru"}
        </p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setMode("login"); setError(""); setInfo(""); }}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${
              mode === "login" ? "bg-ledger text-white" : "bg-paper text-gray-500"
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            className={`flex-1 py-2 rounded-full text-sm font-medium ${
              mode === "signup" ? "bg-ledger text-white" : "bg-paper text-gray-500"
            }`}
          >
            Daftar
          </button>
        </div>

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
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-line px-4 py-2.5 text-sm bg-paper focus:outline-none focus:border-mint"
              placeholder="minimal 6 karakter"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-leaf">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger text-white text-sm font-medium rounded-full py-3 disabled:opacity-50"
          >
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        {mode === "login" && (
          <button
            onClick={() => setShowForgot(true)}
            className="mt-4 text-xs text-gray-400 hover:text-ledger"
          >
            Lupa password?
          </button>
        )}
      </div>
    </div>
  );
}
