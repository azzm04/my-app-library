import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function checkAdminRole(authHeader: string | null) {
  if (!authHeader) {
    return { isAdmin: false, error: "Missing Authorization header" };
  }

  // 1. Buat client Supabase dengan konteks user (menggunakan token dari frontend)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  // 2. Dapatkan User ID dari token
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isAdmin: false, error: "Invalid token or user not found" };
  }

  // 3. Cek Role di tabel profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { isAdmin: false, error: "Profile not found" };
  }

  // 4. Return true jika role adalah admin (case-insensitive)
  return {
    isAdmin: profile?.role?.toLowerCase() === "admin",
    user: user,
    error: null,
  };
}
