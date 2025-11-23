"use client";

import { useState } from "react";
import { Home, BookOpen, Book, User, Heart, Plus, Library, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavbarProps {
  currentPage?: string;
}

export default function MobileNavbar({ currentPage }: MobileNavbarProps) {
  const pathname = usePathname();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Tentukan apakah menu koleksi sedang aktif (jika user di halaman fiksi atau nonfiksi)
  const isCollectionActive = pathname === "/fiksi" || pathname === "/nonfiksi" || currentPage === "fiksi" || currentPage === "nonfiksi";

  const navItems = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    // Menu ini spesial: Action Button (bukan Link langsung)
    { 
      id: "collection", 
      label: "Koleksi", 
      icon: Library, 
      action: () => setShowCategoryModal(true), 
      isActive: isCollectionActive 
    },
    { id: "tambah", label: "Tambah", icon: Plus, href: "/tambah-buku", isSpecial: true },
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
    { id: "profile", label: "Profil", icon: User, href: "/profile" },
  ];

  return (
    <>
      {/* --- KATEGORI MODAL POPUP --- */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCategoryModal(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-card w-full max-w-sm mx-4 mb-24 sm:mb-0 rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-foreground">Pilih Kategori Buku</h3>
              <button 
                onClick={() => setShowCategoryModal(false)} 
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Options */}
            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Pilihan Fiksi */}
              <Link 
                href="/fiksi" 
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group active:scale-95"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm text-foreground">Fiksi</span>
              </Link>

              {/* Pilihan Non-Fiksi */}
              <Link 
                href="/nonfiksi" 
                onClick={() => setShowCategoryModal(false)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all group active:scale-95"
              >
                <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-300 group-hover:scale-110 transition-transform shadow-sm">
                  <Book className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm text-foreground">Non-Fiksi</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 safe-area-bottom pb-safe">
        <div className="grid grid-cols-5 h-16 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Cek active state: bisa dari props 'currentPage' atau logika 'isCollectionActive' atau 'pathname'
            const isActive = item.isActive || currentPage === item.id || pathname === item.href;

            // --- 1. Render Tombol Tambah (Special Floating) ---
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

            // --- 2. Render Tombol dengan Action (Koleksi) ---
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
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            // --- 3. Render Tombol Link Biasa ---
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
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
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