// components/tambah-buku/FormDetailStep.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { Loader2, CheckCircle, Edit2 } from "lucide-react";

interface FormDetailStepProps {
  coverUrl: string;
  coverFile: File | null;
  onChangeImage: () => void;
}

interface FormData {
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: string;
  deskripsi: string;
  category_name: string;
}

export default function FormDetailStep({
  coverUrl,
  coverFile,
  onChangeImage,
}: FormDetailStepProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    judul: "",
    penulis: "",
    penerbit: "",
    tahun: "",
    deskripsi: "",
    category_name: "Fiksi",
  })
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isAutoSave, setIsAutoSave] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Simulate auto-save indicator
    setIsAutoSave(true);
    setTimeout(() => setIsAutoSave(false), 1000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
        // Validate required fields    
      if (
        !formData.judul ||
        !formData.penulis ||
        !formData.penerbit ||
        !formData.tahun
      ) {
        setError("Mohon lengkapi semua field yang wajib diisi");
        setIsSubmitting(false);
        return;
      }

      // Create book
      const bookData = {
        ...formData,
        tahun: parseInt(formData.tahun),
        cover: coverUrl,
      };

      const response = await fetch("/api/buku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menambahkan buku");
      }

      const result = await response.json();

      // Show success message
      setShowSuccessToast(true);

      // Redirect after 1 second
      setTimeout(() => {
        router.push(`/buku/${result.data.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <form id="book-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-save indicator */}
      {isAutoSave && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Auto-save aktif</span>
        </div>
      )}

      {/* Cover Preview */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <img
            src={coverUrl}
            alt="Cover"
            className="w-20 h-28 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cover berhasil diupload
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Silakan isi form di bawah untuk melengkapi detail buku
                </p>
              </div>
              <button
                type="button"
                onClick={onChangeImage}
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Ganti Cover
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Judul */}
        <div>
          <label
            htmlFor="judul"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Judul Buku <span className="text-red-500">*</span>
          </label>
          <input
            id="judul"
            name="judul"
            type="text"
            value={formData.judul}
            onChange={handleInputChange}
            required
            placeholder="Contoh: Laskar Pelangi"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Penulis */}
        <div>
          <label
            htmlFor="penulis"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Penulis <span className="text-red-500">*</span>
          </label>
          <input
            id="penulis"
            name="penulis"
            type="text"
            value={formData.penulis}
            onChange={handleInputChange}
            required
            placeholder="Contoh: Andrea Hirata"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Penerbit */}
        <div>
          <label
            htmlFor="penerbit"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Penerbit <span className="text-red-500">*</span>
          </label>
          <input
            id="penerbit"
            name="penerbit"
            type="text"
            value={formData.penerbit}
            onChange={handleInputChange}
            required
            placeholder="Contoh: Bentang Pustaka"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Tahun & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tahun */}
          <div>
            <label
              htmlFor="tahun"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Tahun Terbit <span className="text-red-500">*</span>
            </label>
            <input
              id="tahun"
              name="tahun"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.tahun}
              onChange={handleInputChange}
              required
              placeholder="2024"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Kategori */}
          <div>
            <label
              htmlFor="category_name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category_name"
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
            >
              <option value="Fiksi">Fiksi</option>
              <option value="Non-Fiksi">Non-Fiksi</option>
            </select>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label
            htmlFor="deskripsi"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleInputChange}
            rows={5}
            placeholder="Ceritakan tentang buku ini..."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-foreground placeholder-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.deskripsi.length} karakter
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan Buku...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Tambahkan Buku
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Dengan menambahkan buku, Anda menyetujui untuk berbagi dengan komunitas
        </p>
      </div>
    </form>
    {showSuccessToast && (
        <Toast
          message="Buku berhasil ditambahkan!"
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
}