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
        <h1 className="page-title">Catat Pengeluaran</h1>
      </div>

      <div className="mb-4 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm">
        {(["Manual", "Foto Struk"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              mode === m ? "bg-ledger text-white shadow-sm" : "text-gray-500"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "Manual" ? (
        <form onSubmit={handleSave} className="app-card space-y-4 p-5">
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
              className="field-control"
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
                className="field-control"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Harga satuan</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
                className="field-control"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-ledger py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>
      ) : (
        <div className="app-card flex flex-col items-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-coin/20 flex items-center justify-center mb-3">
            <Camera size={28} className="text-coin" />
          </div>
          <p className="font-semibold text-sm text-ink mb-1">Scan Struk</p>
          <p className="text-xs text-gray-400 mb-4">
            Foto struk akan dipindai otomatis menggunakan AI untuk mengambil detail transaksi.
          </p>
          <Link
            href="/scan"
            className="w-full rounded-xl bg-ledger py-3 text-sm font-semibold text-white shadow-sm"
          >
            Ambil Foto Struk
          </Link>
        </div>
      )}
    </div>
  );
}
