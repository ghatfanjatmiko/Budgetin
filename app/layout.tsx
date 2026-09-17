import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { QueryProvider } from "@/components/QueryProvider";

const title = "Budgetin' — Pencatatan Keuangan Bulanan";
const description =
  "Aplikasi pencatatan keuangan untuk mahasiswa & pekerja muda Indonesia. Tracker jajan & nongkrong, split tagihan, prediksi boncos, scan struk AI, dan benchmark komunitas kampus.";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "id_ID",
    images: [{ url: "/logo.png", width: 1254, height: 1254, alt: "Budgetin' logo" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.png"],
  },
};

const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem('budgetin-theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Set tema sebelum React render, biar nggak ada kedipan warna terang sekilas */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
