// app/edit-buku/[id]/not-found.tsx
import Link from "next/link";
import { ArrowLeft, BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-0">
      <div className="text-center space-y-6 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted border border-border">
          <BookX className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Buku Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Maaf, buku yang ingin Anda edit tidak ditemukan atau mungkin telah dihapus.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}