"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, ReceiptText, FileClock, UserRound, Plus } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/tracker", label: "Tracker", icon: ReceiptText },
  { href: "/tagihan", label: "Tagihan", icon: FileClock },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-[272px] md:flex-col md:border-r md:border-line/70 md:bg-white md:px-6 md:py-8">
        <div className="mb-10 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Budgetin' logo" className="w-9 h-9 rounded-lg" />
          <span className="text-xl font-bold tracking-[-0.04em] text-ledger">Budgetin&apos;</span>
        </div>
        <nav className="flex flex-col gap-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? "bg-ledger text-white shadow-sm" : "text-gray-500 hover:bg-paper"
                }`}
              >
                <Icon size={18} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/tracker"
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-coin py-3 text-sm font-bold text-ledger shadow-sm"
        >
          <Plus size={16} /> Catat Transaksi
        </Link>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line/70 bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                active ? "text-ledger" : "text-gray-400"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.6 : 1.8} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
