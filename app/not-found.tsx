import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Budgetin' logo" className="mb-6 h-12 w-12 rounded-xl" />
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-coin/20">
        <Compass size={26} className="text-coin" />
      </div>
      <p className="text-2xl font-bold text-ledger">404</p>
      <p className="mt-1 max-w-xs text-sm text-gray-400">
        Halaman yang kamu cari nggak ketemu, atau udah dipindah.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-full bg-ledger px-6 py-2.5 text-sm font-semibold text-white"
      >
        Ke Home
      </Link>
    </div>
  );
}
