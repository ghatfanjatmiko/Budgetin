export function rupiah(n: number): string {
  return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

/** Tanggal 1 bulan berjalan, format YYYY-MM-DD, dipakai sebagai kunci "month" di tabel. */
export function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
