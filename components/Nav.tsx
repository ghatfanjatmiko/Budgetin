"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/dashboard", label: "Budget" },
  { href: "/tracker", label: "Tracker" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto px-5 pt-7">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Budgetin' logo"
            className="w-9 h-9 rounded-lg object-cover"
          />
          <h1 className="font-bold text-xl text-ledger tracking-tight">
            Budgetin&apos;
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-gray-400 hover:text-danger"
        >
          Keluar
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              pathname === t.href
                ? "bg-ledger text-white"
                : "bg-white text-gray-500 border border-line"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
