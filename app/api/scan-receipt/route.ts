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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY belum di-set di .env.local. Lihat README bagian 'Setup Scan Struk AI'.",
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: imageBase64,
                },
              },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `AI API error (${res.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const textBlock = data.content?.find((c: any) => c.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "AI tidak mengembalikan hasil teks." }, { status: 502 });
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
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
