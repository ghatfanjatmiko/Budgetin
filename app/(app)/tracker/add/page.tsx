"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Camera } from "lucide-react";

export default function AddTransactionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"Manual" | "Foto Struk">("Manual");
  const [kind, setKind] = useState<"Jajan" | "Nongkrong">("Jajan");
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      alert("Isi nama item dan harga satuan ya.");
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("transactions").insert({
      user_id: user!.id,
      date: new Date().toISOString().slice(0, 10),
      kind,
      name,
      qty,
      price,
    });
    setSaving(false);
    router.push("/tracker");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link href="/tracker" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-ledger">Catat Pengeluaran</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {(["Manual", "Foto Struk"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              mode === m ? "bg-ledger text-white" : "bg-white text-gray-500 border border-line"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Manual" ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jenis</label>
            <div className="flex gap-2">
              {(["Jajan", "Nongkrong"] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                    kind === k ? "bg-ledger text-white" : "bg-paper text-gray-500"
                  }`}
                >
                  {k === "Jajan" ? "🍿 Jajan" : "☕ Nongkrong"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nama item / tempat</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Kopi Kenangan"
              className="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-paper"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Qty</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-paper"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Harga satuan</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm bg-paper"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ledger text-white text-sm font-semibold rounded-full py-3 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-coin/20 flex items-center justify-center mb-3">
            <Camera size={28} className="text-coin" />
          </div>
          <p className="font-semibold text-sm text-ink mb-1">Scan Struk</p>
          <p className="text-xs text-gray-400 mb-4">
            Foto struk akan dipindai otomatis menggunakan AI untuk mengambil detail transaksi.
          </p>
          <Link
            href="/scan"
            className="w-full bg-ledger text-white text-sm font-semibold rounded-full py-3"
          >
            Ambil Foto Struk
          </Link>
        </div>
      )}
    </div>
  );
}
