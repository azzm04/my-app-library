"use client";

import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Book,
  User,
  Heart,
  Plus,
  Library,
  X,
  LogOut,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MobileNavbarProps {
  currentPage?: string;
}

export default function MobileNavbar({ currentPage }: MobileNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Fetch user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(profile?.role || null);
      }
      setIsLoading(false);
    };

    fetchUser();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }: any) => setUserRole(data?.role || null));
        } else {
          setUserRole(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileModal(false);
    router.push("/");
    router.refresh();
  };

  const isCollectionActive =
    pathname === "/fiksi" ||
    pathname === "/nonfiksi" ||
    currentPage === "fiksi" ||
    currentPage === "nonfiksi";

  const navItems = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    {
      id: "collection",
      label: "Koleksi",
      icon: Library,
      action: () => setShowCategoryModal(true),
      isActive: isCollectionActive,
    },
    // Hanya tampilkan tombol Tambah jika user adalah ADMIN
    ...(userRole === "ADMIN"
      ? [
          {
            id: "tambah",
            label: "Tambah",
            icon: Plus,
            href: "/tambah-buku",
            isSpecial: true,
          },
        ]
      : []),
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
    {
      id: "profile",
      label: user ? "Profil" : "Login",
      icon: user ? User : LogIn,
      action: () => {
        if (user) {
          setShowProfileModal(true);
        } else {
          router.push("/login");
        }
      },
    },
  ];

  return (
    <>
      {/* --- KATEGORI MODAL POPUP --- */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="bg-card w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-foreground">
                Pilih Kategori Buku
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <Link
                href="/fiksi"
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group active:scale-95"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm text-foreground">
                  Fiksi
                </span>
              </Link>

              <Link
                href="/nonfiksi"
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all group active:scale-95"
              >
                <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-300 group-hover:scale-110 transition-transform shadow-sm">
                  <Book className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm text-foreground">
                  Non-Fiksi
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFILE MODAL --- */}
      {showProfileModal && user && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-card w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {user.user_metadata?.name || user.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      userRole === "ADMIN"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {userRole === "ADMIN" ? "👑 Admin" : "👤 User"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <Link
                href="/profile"
                onClick={() => setShowProfileModal(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  Lihat Profil
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 safe-area-bottom pb-safe">
        <div
          className={`grid ${
            userRole === "ADMIN" ? "grid-cols-5" : "grid-cols-4"
          } h-16 relative`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.isActive ||
              currentPage === item.id ||
              pathname === item.href;

            // Render Tombol Tambah (Special Floating) - Hanya untuk ADMIN
            if (item.isSpecial) {
              return (
                <Link
                  key={item.id}
                  href={item.href || "#"}
                  className="flex flex-col items-center justify-center relative group"
                >
                  <div className="absolute -top-6 flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 active:scale-95 ring-4 ring-background">
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full pt-1">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            }

            // Render Tombol dengan Action
            if (item.action) {
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`relative ${
                      isActive ? "transform -translate-y-0.5" : ""
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        isActive ? "stroke-[2.5]" : "stroke-2"
                      }`}
                    />
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            // Render Tombol Link Biasa
            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative ${
                    isActive ? "transform -translate-y-0.5" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      isActive ? "stroke-[2.5]" : "stroke-2"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
