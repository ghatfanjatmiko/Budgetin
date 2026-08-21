"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) setError(error.message);
    else setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError("Kode salah atau sudah kedaluwarsa. Coba kirim ulang.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Budgetin' logo" className="w-12 h-12 rounded-xl mb-4" />
        <h1 className="font-bold text-2xl text-ledger mb-1">Budgetin&apos;</h1>
        <p className="text-sm text-gray-400 mb-6">Masuk ke akunmu</p>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
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
              {loading ? "Mengirim..." : "Kirim Kode Login"}
            </button>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Kamu akan menerima kode 6 digit lewat email — nggak perlu klik
              link, tinggal ketik kodenya di sini.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-ledger leading-relaxed">
              Kode dikirim ke <b>{email}</b>. Cek email (atau spam), lalu
              masukkan kode 6 digitnya di bawah ini.
            </p>
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Kode Verifikasi
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-line px-4 py-3 text-center text-2xl tracking-[0.5em] bg-paper focus:outline-none focus:border-mint"
                placeholder="------"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-ledger text-white text-sm font-medium rounded-full py-3 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              className="w-full text-xs text-gray-400"
            >
              Ganti email / kirim ulang kode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
