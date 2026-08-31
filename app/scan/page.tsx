"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rupiah } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Loader2 } from "lucide-react";

type Item = { name: string; qty: number; price: number };
type ScanResult = { merchant: string; kind: "Jajan" | "Nongkrong"; items: Item[] };

export default function ScanPage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [saving, setSaving] = useState(false);

  function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mediaType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setStatus("scanning");
    setError("");
    setResult(null);

    try {
      const { base64, mediaType } = await fileToBase64(file);
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memindai struk.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
      setStatus("error");
    }
  }

  function updateItem(idx: number, field: keyof Item, value: any) {
    if (!result) return;
    const items = [...result.items];
    items[idx] = { ...items[idx], [field]: value };
    setResult({ ...result, items });
  }

  const total = result?.items.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0) ?? 0;

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("transactions").insert({
      user_id: user!.id,
      date: new Date().toISOString().slice(0, 10),
      kind: result.kind,
      name: result.merchant,
      qty: 1,
      price: total,
    });
    setSaving(false);
    showToast("Transaksi dari struk tersimpan.", "success");
    router.push("/tracker");
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/tracker/add" className="text-gray-400">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-ledger">
          {status === "done" ? "Detail Transaksi" : "Scan Struk"}
        </h1>
      </div>

      {status === "idle" && (
        <label className="block bg-white rounded-2xl shadow-sm p-8 text-center cursor-pointer">
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          <div className="w-16 h-16 rounded-2xl bg-coin/20 flex items-center justify-center mx-auto mb-3">
            📷
          </div>
          <p className="font-semibold text-sm text-ink mb-1">Ambil / unggah foto struk</p>
          <p className="text-xs text-gray-400">
            Pastikan struk terlihat jelas, hindari bayangan dan pantulan.
          </p>
        </label>
      )}

      {preview && status !== "idle" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview struk" className="w-full rounded-2xl shadow-sm mb-4 max-h-80 object-cover" />
      )}

      {status === "scanning" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
          <Loader2 className="animate-spin text-coin mb-2" size={28} />
          <p className="text-sm text-gray-500">AI sedang membaca struk...</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-danger/10 text-danger rounded-2xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {status === "error" && (
        <label className="block bg-white border border-line rounded-full text-center py-3 text-sm font-medium text-ledger cursor-pointer">
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          Coba Foto Lain
        </label>
      )}

      {status === "done" && result && (
        <div className="space-y-4">
          <div className="bg-leaf/10 text-leaf text-xs rounded-xl px-3 py-2 text-center">
            ✨ Berhasil dipindai — periksa dan konfirmasi hasilnya
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nama Toko / Tempat</label>
              <input
                value={result.merchant}
                onChange={(e) => setResult({ ...result, merchant: e.target.value })}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-paper"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
              <div className="flex gap-2">
                {(["Jajan", "Nongkrong"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setResult({ ...result, kind: k })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                      result.kind === k ? "bg-ledger text-white" : "bg-paper text-gray-500"
                    }`}
                  >
                    {k === "Jajan" ? "🍿 Jajan" : "☕ Nongkrong"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-2">Item Terdeteksi</p>
            <div className="space-y-2">
              {result.items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="flex-1 border-b border-line text-sm px-1 py-1 bg-transparent"
                  />
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                    className="w-12 border-b border-line text-sm px-1 py-1 text-center bg-transparent"
                  />
                  <input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                    className="w-24 border-b border-line text-sm px-1 py-1 text-right bg-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-line">
              <span className="text-sm text-gray-500">Total</span>
              <span className="font-bold text-ledger">{rupiah(total)}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-ledger text-white text-sm font-semibold rounded-full py-3 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      )}
    </div>
  );
}
