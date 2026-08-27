"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { currentMonthStart, monthEndExclusive, useBudgetMonth } from "@/lib/month";

function moveMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const moved = new Date(year, monthNumber - 1 + offset, 1);
  return `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function MonthPicker({ compact = false }: { compact?: boolean }) {
  const month = useBudgetMonth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const isCurrent = month === currentMonthStart();

  function changeMonth(nextMonth: string) {
    const next = new URLSearchParams(params.toString());
    if (nextMonth === currentMonthStart()) next.delete("month");
    else next.set("month", nextMonth);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const label = new Date(`${month}T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "justify-between rounded-2xl bg-white p-1.5 shadow-sm"}`}>
      <button onClick={() => changeMonth(moveMonth(month, -1))} aria-label="Bulan sebelumnya" className="grid h-8 w-8 place-items-center rounded-xl text-gray-500 hover:bg-paper"><ChevronLeft size={18} /></button>
      <button onClick={() => changeMonth(currentMonthStart())} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold capitalize text-ledger hover:bg-paper" title={isCurrent ? "Bulan berjalan" : "Kembali ke bulan berjalan"}>
        <CalendarDays size={15} className="text-coin" /> {label}
      </button>
      <button onClick={() => changeMonth(moveMonth(month, 1))} disabled={monthEndExclusive(month) > monthEndExclusive(currentMonthStart())} aria-label="Bulan berikutnya" className="grid h-8 w-8 place-items-center rounded-xl text-gray-500 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={18} /></button>
    </div>
  );
}
