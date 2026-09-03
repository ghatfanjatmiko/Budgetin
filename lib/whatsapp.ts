export function upgradeWhatsAppLink(email: string): string {
  const number = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";
  const text = encodeURIComponent(
    `Halo, saya mau upgrade ke Budgetin' Plus.\nEmail akun: ${email}`
  );
  if (!number) return "";
  return `https://wa.me/${number}?text=${text}`;
}

export function feedbackWhatsAppLink(email: string): string {
  const number = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";
  const text = encodeURIComponent(
    `Halo, saya mau kasih masukan soal Budgetin'.\nEmail akun: ${email}\n\nMasukan saya: `
  );
  if (!number) return "";
  return `https://wa.me/${number}?text=${text}`;
}
