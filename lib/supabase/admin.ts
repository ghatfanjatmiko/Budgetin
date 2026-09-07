import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dengan hak akses admin (service_role) — cuma boleh dipakai di
 * server (route handler), TIDAK PERNAH di client/browser. Dipakai untuk
 * hal-hal yang butuh bypass RLS, misalnya hapus akun pengguna.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum di-set di .env.local. Lihat README bagian 'Setup Hapus Akun'."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
