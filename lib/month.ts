"use client";

import { useSearchParams } from "next/navigation";

const MONTH_PATTERN = /^\d{4}-\d{2}-01$/;

export function currentMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function monthEndExclusive(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(year, monthNumber, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
}

export function previousMonthStart(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const previous = new Date(year, monthNumber - 2, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-01`;
}

export function isValidBudgetMonth(value: string | null) {
  return Boolean(value && MONTH_PATTERN.test(value));
}

export function useBudgetMonth() {
  const params = useSearchParams();
  const selected = params.get("month");
  return isValidBudgetMonth(selected) ? selected! : currentMonthStart();
}
