// app/buku/[id]/BookDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Download, Share2, Edit2 } from "lucide-react";
import { useFavorites } from "@/app/context/FavoritesContext";
import type { Buku } from "@/types/buku";

interface BookDetailClientProps {
  buku: Buku;
  relatedBooks: Buku[];
}

export default function BookDetailClient({
  buku,
  relatedBooks,
}: BookDetailClientProps) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const bookIsFavorited = isFavorite(buku.id);

  const toggleFavorite = () => {
    if (bookIsFavorited) {
      removeFavorite(buku.id);
    } else {
      addFavorite(buku);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: buku.judul,
          text: `Lihat buku ${buku.judul} oleh ${buku.penulis}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-card border-b border-border/40 backdrop-blur-sm md:relative md:top-auto md:border-b-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Left - Book Cover */}
          <div className="flex justify-center md:sticky md:top-24 md:h-fit">
            <div className="w-full md:w-auto">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border bg-muted aspect-3/4 md:max-w-sm max-w-xs">
                <img
                  src={buku.cover || "/placeholder.svg"}
                  alt={buku.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Action buttons for mobile */}
              <div className="flex gap-3 mt-6 md:hidden">
                <button
                  onClick={toggleFavorite}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2 ${
                    bookIsFavorited
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      bookIsFavorited ? "fill-current" : ""
                    }`}
                  />
                  {bookIsFavorited ? "Disimpan" : "Simpan"}
                </button>
                <button
                  onClick={() => router.push(`/edit-buku/${buku.id}`)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Right - Book Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Title and Author */}
            <div className="space-y-4">
              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {buku.judul}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  oleh {buku.penulis}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 sm:gap-5 pt-4 sm:pt-5 border-t border-border/60">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Penerbit
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {buku.penerbit}
                  </p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tahun Terbit
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {buku.tahun}
                  </p>
                </div>
                {buku.category && (
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Kategori
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {buku.category.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Deskripsi
              </h2>
              <p className="text-foreground/80 leading-relaxed text-sm sm:text-base md:text-lg">
                {buku.deskripsi || "Deskripsi tidak tersedia."}
              </p>
            </div>

            {/* Additional Info Sections */}
            <div className="space-y-4 sm:space-y-5">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Informasi Tambahan
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div className="bg-muted/50 rounded-lg p-4 sm:p-5 border border-border/60">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    ID Buku
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-foreground font-mono">
                    {buku.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 sm:p-5 border border-border/60">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Status
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-accent">
                    Tersedia
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons for desktop */}
            <div className="hidden md:flex gap-4 sm:gap-5 pt-4 sm:pt-6">
              <button
                onClick={toggleFavorite}
                className={`px-8 sm:px-9 py-2.5 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 inline-flex items-center gap-2 border ${
                  bookIsFavorited
                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    : "bg-background text-foreground hover:bg-muted border-border"
                }`}
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    bookIsFavorited ? "fill-current" : ""
                  }`}
                />
                {bookIsFavorited ? "Disimpan" : "Simpan"}
              </button>
              <button
                onClick={() => router.push(`/edit-buku/${buku.id}`)}
                className="px-8 sm:px-9 py-2.5 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Buku
              </button>
              <button
                onClick={handleShare}
                className="px-8 sm:px-9 py-2.5 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base bg-muted text-foreground hover:bg-muted/80 transition-colors inline-flex items-center gap-2 border border-border"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/40">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 sm:mb-8">
              Buku Lainnya dari {buku.penulis}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => router.push(`/buku/${book.id}`)}
                  className="group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all duration-300"
                >
                  <div className="aspect-3/4 overflow-hidden bg-muted">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-card">
                    <h3 className="font-bold text-xs sm:text-sm line-clamp-2 text-foreground">
                      {book.judul}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {book.penulis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
