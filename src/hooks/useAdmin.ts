import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkAdmin = async () => {
      try {
        setLoading(true);

        // 1. Cek session user saat ini
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("🔐 useAdmin: Session check", {
          hasSession: !!session,
          userId: session?.user?.id,
        });

        if (!session?.user) {
          console.log("❌ useAdmin: No session found");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // 2. Cek role di tabel profiles berdasarkan ID user
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        console.log("👤 useAdmin: Profile check", {
          profile,
          error: error?.message,
        });

        if (error) {
          console.error("❌ Error fetching profile:", error);
          setIsAdmin(false);
        } else {
          // 3. Set true jika role adalah 'admin'
          const adminStatus = profile?.role?.toLowerCase() === "admin";
          console.log("✅ useAdmin: Admin status =", adminStatus, "| Role =", profile?.role);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("❌ Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkAdmin();

    // 🔥 PENTING: Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 useAdmin: Auth state changed", event);
      
      // Re-check admin status ketika auth state berubah
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        checkAdmin();
      } else if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
}