"use client";

import { useState, useEffect } from "react";
import { 
  Home, BookOpen, Book, User, Heart, Plus, Library, X, 
  LogOut, LogIn, Info 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { createClient } from "@/lib/supabase/client";

interface MobileNavbarProps {
  currentPage?: string;
}

export default function MobileNavbar({ currentPage }: MobileNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Custom Hook Admin
  const { isAdmin } = useAdmin();

  // --- FETCH USER DATA ---
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- HANDLER LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileModal(false);
    router.refresh();
    router.push("/"); // Redirect ke home setelah logout
  };

  const isCollectionActive = 
    pathname === "/fiksi" || 
    pathname === "/nonfiksi" || 
    currentPage === "fiksi" || 
    currentPage === "nonfiksi";

  // --- DEFINISI NAV ITEMS ---
  const navItems = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    
    // Menu Koleksi (Pop-up)
    { 
      id: "collection", 
      label: "Koleksi", 
      icon: Library, 
      action: () => setShowCategoryModal(true), 
      isActive: isCollectionActive 
    },

    // Tombol Tambah (Hanya Admin)
    ...(isAdmin ? [{ id: "tambah", label: "Tambah", icon: Plus, href: "/tambah-buku", isSpecial: true }] : []),
    
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
    
    // Menu Profil (Pop-up Akun)
    { 
      id: "profile", 
      label: user ? "Akun" : "Masuk", 
      icon: user ? User : LogIn, 
      action: () => setShowProfileModal(true), // Selalu buka modal, baik login atau belum
      isActive: pathname === "/profile"
    },
  ];

  const gridCols = isAdmin ? "grid-cols-5" : "grid-cols-4";

  return (
    <>
      {/* --- 1. MODAL KATEGORI --- */}
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
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Library className="w-4 h-4 text-primary" />
                Pilih Kategori
              </h3>
              <button onClick={() => setShowCategoryModal(false)} aria-label="Close category modal" className="p-1 hover:bg-muted rounded-full">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <Link 
                href="/fiksi" 
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-all active:scale-95"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600"><BookOpen className="w-6 h-6" /></div>
                <span className="font-medium text-sm">Fiksi</span>
              </Link>
              <Link 
                href="/nonfiksi" 
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 transition-all active:scale-95"
              >
                <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600"><Book className="w-6 h-6" /></div>
                <span className="font-medium text-sm">Non-Fiksi</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL PROFIL (AKUN) --- */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-card w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header Profil */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-border ${user ? 'bg-primary/10' : 'bg-muted'}`}>
                  <User className={`w-8 h-8 ${user ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-foreground truncate">
                    {user ? (user.user_metadata?.name || "Pengguna") : "Halo, Tamu!"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user ? user.email : "Silakan login untuk akses penuh."}
                  </p>
                  {user && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isAdmin ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {isAdmin ? "👑 ADMIN" : "👤 MEMBER"}
                    </span>
                  )}
                </div>
                <button onClick={() => setShowProfileModal(false)} aria-label="Close profile modal" className="p-1 hover:bg-muted rounded-full self-start">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div className="p-4 space-y-2">
              {/* Menu: Tentang Pembuat (Selalu Muncul) */}
              <Link
                href="/profile"
                onClick={() => setShowProfileModal(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Tentang Pembuat</p>
                  <p className="text-xs text-muted-foreground">Informasi pengembang aplikasi</p>
                </div>
              </Link>

              <div className="h-px bg-border my-2" />

              {/* Action Button: Login / Logout */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 border border-transparent hover:border-red-100 transition-colors"
                >
                  <div className="p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">Keluar Akun</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Login Sekarang</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 3. NAVBAR BOTTOM --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 safe-area-bottom pb-safe">
        <div className={`grid ${gridCols} h-16 relative`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive || currentPage === item.id || pathname === item.href;

            // Render Tombol Floating (Tambah)
            if (item.isSpecial) {
              return (
                <Link
                  key={item.id}
                  href={item.href || "#"}
                  className="flex flex-col items-center justify-center relative group"
                >
                  <div className="absolute -top-6 flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg shadow-primary/30 hover:shadow-xl transition-all duration-200 active:scale-95 ring-4 ring-background">
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full pt-1">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            }

            // Render Tombol Action (Modal)
            if (item.action) {
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`relative ${isActive ? "transform -translate-y-0.5" : ""}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                    {isActive && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            // Render Link Biasa
            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`relative ${isActive ? "transform -translate-y-0.5" : ""}`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                  {isActive && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
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