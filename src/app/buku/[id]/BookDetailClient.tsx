"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Edit2, Trash2, AlertTriangle, X, CheckCircle2, BookOpenText } from "lucide-react";
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
  
  // State untuk modal konfirmasi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const bookIsFavorited = isFavorite(buku.id);

  const toggleFavorite = () => {
    if (bookIsFavorited) {
      removeFavorite(buku.id);
    } else {
      addFavorite(buku);
    }
  };

  // Fungsi untuk memunculkan modal
  const initiateDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/buku/${buku.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteSuccess(true);
        setTimeout(() => {
          router.refresh(); 
          router.push("/"); 
        }, 1500);
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus buku"); 
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Terjadi kesalahan saat menghapus buku");
      setIsDeleting(false);
      setShowDeleteModal(false);
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
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!"); 
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      
      {/* --- CUSTOM MODAL DELETE --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            {!isDeleting && !deleteSuccess && (
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {!deleteSuccess ? (
              <>
                <div className="flex flex-col items-center text-center gap-4 pt-2">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full shadow-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Hapus Buku Ini?</h3>
                    <p className="text-muted-foreground text-sm">
                      Apakah Anda yakin ingin menghapus <span className="font-semibold text-foreground">"{buku.judul}"</span>? 
                      <br/>Tindakan ini permanen dan tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm border border-border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Hapus Permanen
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Berhasil Dihapus!</h3>
                <p className="text-muted-foreground text-sm">
                  Mengalihkan Anda kembali ke beranda...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

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
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border bg-muted aspect-3/4 md:max-w-sm max-w-xs mx-auto md:mx-0">
                <img
                  src={buku.cover || "/placeholder.svg"}
                  alt={buku.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* --- Action buttons for MOBILE --- */}
              <div className="flex flex-col gap-3 mt-6 md:hidden">
                
                {/* 1. Baca Sekarang (Full Width) */}
                {buku.link_eksternal && (
                  <a
                    href={buku.link_eksternal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-3 rounded-lg font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <BookOpenText className="w-5 h-5" />
                    Baca Sekarang
                  </a>
                )}

                {/* 2. Row: Bagikan & Simpan */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm bg-muted text-foreground hover:bg-muted/80 border border-border transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Bagikan
                  </button>

                  <button
                    onClick={toggleFavorite}
                    className={`flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2 ${
                      bookIsFavorited
                        ? "bg-red-500 text-white hover:bg-red-600 border border-red-500"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        bookIsFavorited ? "fill-current" : ""
                      }`}
                    />
                    {bookIsFavorited ? "Disimpan" : "Simpan"}
                  </button>
                </div>
                
                {/* 3. Row: Edit & Hapus (Khusus Admin/Pemilik) */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/edit-buku/${buku.id}`)}
                    className="flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={initiateDelete}
                    className="flex-1 px-3 py-2.5 rounded-lg font-semibold text-sm bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
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
              <p className="text-foreground/80 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-wrap">
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
                  <p className="font-semibold text-sm sm:text-base text-foreground font-mono truncate">
                    {buku.id}
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

            {/* --- Action buttons for DESKTOP (RAPID LAYOUT) --- */}
            <div className="hidden md:flex flex-wrap items-center gap-4 sm:gap-5 pt-4 sm:pt-6">
              
              {/* Group 1: Aksi Pembaca (Kiri) */}
              {buku.link_eksternal && (
                <a
                  href={buku.link_eksternal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <BookOpenText className="w-5 h-5" />
                  Baca Sekarang
                </a>
              )}

              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-lg font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors inline-flex items-center gap-2 border border-border"
              >
                <Share2 className="w-5 h-5" />
                Bagikan
              </button>

              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 border ${
                  bookIsFavorited
                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    : "bg-background text-foreground hover:bg-muted border-border"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    bookIsFavorited ? "fill-current" : ""
                  }`}
                />
                {bookIsFavorited ? "Disimpan" : "Simpan"}
              </button>

              {/* Spacer jika ingin memisahkan grup admin ke kanan, atau biarkan mengalir */}
              {/* <div className="flex-1" /> */}

              {/* Group 2: Aksi Admin (Kanan/Lanjut) */}
              <div className="flex items-center gap-4 sm:gap-5 ml-auto sm:ml-0">
                <button
                  onClick={() => router.push(`/edit-buku/${buku.id}`)}
                  className="px-6 py-3 rounded-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit
                </button>

                <button
                  onClick={initiateDelete}
                  className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Trash2 className="w-5 h-5" />
                  Hapus
                </button>
              </div>

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