import Link from "next/link";
import {
  Wallet,
  Receipt,
  Camera,
  Users,
  Flame,
  BarChart3,
  GraduationCap,
  CreditCard,
} from "lucide-react";

const features = [
  { icon: Wallet, title: "Budget Terencana", desc: "Rencana vs aktual, jelas dari awal bulan." },
  { icon: Receipt, title: "Tracker Cepat", desc: "Catat jajan/nongkrong dalam hitungan detik." },
  { icon: Users, title: "Split Nongkrong", desc: "Bagi tagihan bareng teman, langsung ke WA." },
  { icon: Camera, title: "Scan Struk AI", desc: "Foto struk, otomatis kecatat rapi." },
  { icon: BarChart3, title: "Prediksi Boncos", desc: "Tau lebih awal sebelum dompet nangis." },
  { icon: Flame, title: "Streak & Badge", desc: "Konsisten nyatet, dapat pencapaian." },
  { icon: CreditCard, title: "Tagihan & Hutang", desc: "Nggak ada lagi lupa jatuh tempo." },
  { icon: GraduationCap, title: "Benchmark Kampus", desc: "Bandingin pengeluaran, anonim & seru." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Budgetin' logo" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold text-ledger">Budgetin&apos;</span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-ledger px-5 py-2 text-sm font-semibold text-white"
        >
          Masuk
        </Link>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center">
        <h1 className="text-3xl font-bold leading-tight text-ledger sm:text-5xl">
          Uang jajan bulanan,
          <br />
          <span className="text-coin">nggak lagi jadi misteri.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 sm:text-base">
          Aplikasi pencatatan keuangan yang dirancang khusus buat kebiasaan
          jajan &amp; nongkrong mahasiswa Indonesia — bukan aplikasi finance
          generik yang diperkecil.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-full bg-ledger px-8 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Mulai Gratis
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="app-card p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-coin/20">
                  <Icon size={17} className="text-ledger" />
                </div>
                <p className="text-sm font-semibold text-ink">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-xs text-gray-400">
        Budgetin&apos; — dibuat untuk mahasiswa &amp; pekerja muda Indonesia.
      </div>
    </div>
  );
}
