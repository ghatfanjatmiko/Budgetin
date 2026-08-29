import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EXTRACTION_PROMPT = `Kamu membaca foto struk belanja Indonesia. Kembalikan HANYA JSON valid, tanpa teks lain, tanpa markdown fences, dengan bentuk persis:

{
  "merchant": "nama toko/warung dari struk",
  "kind": "Jajan" atau "Nongkrong" (pilih "Nongkrong" kalau ini kafe/restoran/tempat makan duduk, "Jajan" kalau ini minimarket/jajanan/gerai cepat),
  "items": [
    { "name": "nama item", "qty": angka, "price": harga satuan dalam Rupiah tanpa titik/koma }
  ]
}

Kalau struk tidak jelas terbaca, tetap kembalikan JSON dengan tebakan terbaikmu. Jangan menyertakan penjelasan apapun di luar JSON.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY belum di-set di .env.local. Lihat README bagian 'Setup Scan Struk AI'.",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { imageBase64, mediaType } = body as { imageBase64: string; mediaType: string };

  if (!imageBase64) {
    return NextResponse.json({ error: "Tidak ada gambar yang dikirim." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: EXTRACTION_PROMPT },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `AI API error (${res.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "AI tidak mengembalikan hasil teks." }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Gagal parsing hasil AI. Coba foto ulang dengan pencahayaan lebih jelas." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan." }, { status: 500 });
  }
}
