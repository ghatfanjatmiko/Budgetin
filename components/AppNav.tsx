"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Receipt, CreditCard, User, Plus } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/tracker", label: "Tracker", icon: Receipt },
  { href: "/tagihan", label: "Tagihan", icon: CreditCard },
  { href: "/profile", label: "Profil", icon: User },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 bg-white border-r border-line px-5 py-7">
        <div className="flex items-center gap-3 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Budgetin' logo" className="w-9 h-9 rounded-lg" />
          <span className="font-bold text-lg text-ledger">Budgetin&apos;</span>
        </div>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? "bg-ledger text-white" : "text-gray-500 hover:bg-paper"
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
          className="mt-auto flex items-center justify-center gap-2 bg-coin text-ledger font-semibold text-sm rounded-full py-3"
        >
          <Plus size={16} /> Catat Transaksi
        </Link>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-line px-2 py-2 flex justify-around">
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
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
