// app/fiksi/FiksiClientPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Search } from "lucide-react";
import BookCard from "@/components/buku/BookCard";
import type { Buku } from "@/types/buku";

interface FiksiClientPageProps {
  initialBuku: Buku[];
}

export default function FiksiClientPage({ initialBuku }: FiksiClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allBuku] = useState<Buku[]>(initialBuku);

  // Memoized filtered books untuk performa lebih baik
  const filteredBuku = useMemo(() => {
    if (searchQuery.trim() === "") {
      return allBuku;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    return allBuku.filter(
      (buku) =>
        buku.judul.toLowerCase().includes(lowercasedQuery) ||
        buku.penulis.toLowerCase().includes(lowercasedQuery) ||
        buku.penerbit.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, allBuku]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="space-y-8">
            {/* Header with Icon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative bg-primary/10 border border-primary/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Koleksi Buku Fiksi
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {filteredBuku.length} dari {allBuku.length} buku tersedia
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau penerbit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-muted-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
        {filteredBuku.length > 0 ? (
          <>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredBuku.map((buku) => (
                <div key={buku.id} className="h-full">
                  <BookCard buku={buku} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
            <p className="text-foreground text-sm sm:text-base md:text-lg font-semibold mt-4">
              {searchQuery
                ? "Tidak ada buku yang ditemukan"
                : "Belum ada buku fiksi"}
            </p>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? "Coba kata kunci pencarian yang berbeda"
                : "Buku fiksi akan segera ditambahkan"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Hapus Filter
              </button>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl px-8 md:px-16 py-16 md:py-24 text-center shadow-2xl border border-primary/20">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-balance leading-tight">
              Temukan Cerita Terbaik Anda
            </h3>
            <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Jelajahi dunia imajinasi melalui koleksi buku fiksi terbaik kami.
              Dari petualangan epik hingga kisah cinta yang mengharukan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
