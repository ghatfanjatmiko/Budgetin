"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Budgetin' logo" className="mb-6 h-12 w-12 rounded-xl" />
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertTriangle size={26} className="text-danger" />
      </div>
      <p className="text-sm font-semibold text-ink">Ada yang nggak beres</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">
        Terjadi kesalahan tak terduga. Coba muat ulang halaman ini — kalau
        masih terjadi, kabari lewat Profil → Kirim Masukan.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full bg-ledger px-5 py-2.5 text-sm font-semibold text-white"
        >
          <RotateCcw size={14} /> Coba Lagi
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Ke Home
        </Link>
      </div>
    </div>
  );
}
