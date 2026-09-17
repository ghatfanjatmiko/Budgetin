import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — Budgetin'",
};

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-paper px-5 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/" className="text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">Kebijakan Privasi</h1>
        </div>

        <div className="app-card space-y-5 p-6 text-sm leading-relaxed text-ink">
          <p className="text-xs text-gray-400">Terakhir diperbarui: 2026</p>

          <section>
            <h2 className="mb-1 font-semibold text-ledger">Data apa yang kami simpan</h2>
            <p>
              Data pendapatan, tabungan, pengeluaran, transaksi jajan/nongkrong,
              tagihan, dan foto struk yang kamu unggah (diproses lalu tidak
              disimpan permanen di server kami). Semua data disimpan di
              database Supabase dan cuma bisa diakses oleh akunmu sendiri.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-ledger">Layanan pihak ketiga</h2>
            <p>
              Kami menggunakan <b>Supabase</b> untuk database &amp; autentikasi,
              dan <b>Google Gemini API</b> untuk membaca foto struk (fitur Scan
              Struk). Gambar struk yang kamu unggah dikirim ke Google untuk
              diproses sesuai kebijakan privasi mereka masing-masing.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-ledger">Benchmark Komunitas Kampus</h2>
            <p>
              Kalau kamu mengisi nama kampus, data pengeluaranmu ikut dihitung
              ke dalam rata-rata anonim kampus tersebut. Kami cuma
              menampilkan angka agregat (rata-rata + jumlah pengguna), tidak
              pernah data pengeluaran individu orang lain.
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-ledger">Hak kamu atas data</h2>
            <p>
              Kamu bisa mengunduh seluruh datamu (Profil → Kelola Data →
              Unduh Data) atau menghapus akun beserta semua data secara
              permanen kapan saja (Profil → Kelola Data → Hapus Akun
              Permanen).
            </p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-ledger">Kontak</h2>
            <p>
              Ada pertanyaan soal privasi datamu? Hubungi lewat menu Profil →
              Kirim Masukan di dalam aplikasi.
            </p>
          </section>

          <p className="text-xs text-gray-400">
            Budgetin&apos; adalah proyek independen, bukan produk komersial
            berskala besar. Kebijakan ini akan diperbarui seiring
            berkembangnya aplikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
