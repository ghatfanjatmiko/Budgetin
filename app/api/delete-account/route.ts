import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Kamu harus login." }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    // Selalu hapus akun milik SENDIRI (user.id dari sesi yang lagi login),
    // tidak pernah menerima ID dari body request — supaya tidak bisa
    // dipakai buat hapus akun orang lain.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menghapus akun." }, { status: 500 });
  }
}
