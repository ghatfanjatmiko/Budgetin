import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Budgetin' — Pencatatan Keuangan Bulanan",
    short_name: "Budgetin'",
    description: "Aplikasi pencatatan keuangan bulanan untuk mahasiswa & pekerja muda.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#182338",
    icons: [
      {
        src: "/logo.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
