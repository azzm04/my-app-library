    // app/edit-buku/[id]/EditBukuClient.tsx
"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, Upload, Image as ImageIcon } from "lucide-react";
import type { Buku } from "@/types/buku";

interface EditBukuClientProps {
  buku: Buku;
}

interface FormData {
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: string;
  deskripsi: string;
  category_name: string;
}

export default function EditBukuClient({ buku }: EditBukuClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    judul: buku.judul,
    penulis: buku.penulis,
    penerbit: buku.penerbit,
    tahun: buku.tahun.toString(),
    deskripsi: buku.deskripsi || "",
    category_name: buku.category?.name || "Fiksi",
  });

  const [coverUrl, setCoverUrl] = useState<string>(buku.cover || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak valid. Gunakan JPEG, PNG, atau WebP.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setCoverFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload cover
    await uploadCover(file);
  };

  const uploadCover = async (file: File) => {
    setIsUploadingCover(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Gagal mengupload cover");
      }

      const uploadResult = await uploadResponse.json();
      setCoverUrl(uploadResult.data.publicUrl);
      console.log("✅ Cover uploaded:", uploadResult.data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Gagal mengupload cover");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate
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

      // Update book
      const bookData = {
        ...formData,
        tahun: parseInt(formData.tahun),
        cover: coverUrl,
      };

      const response = await fetch(`/api/buku/${buku.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengupdate buku");
      }

      const result = await response.json();
      console.log("✅ Book updated:", result);

      // Show success and redirect
      alert("✅ Buku berhasil diupdate!");
      router.push(`/buku/${buku.id}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Edit Buku
          </h1>
          <p className="text-muted-foreground">
            Update informasi buku "{buku.judul}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Cover Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Cover Buku
            </label>
            <div className="flex items-start gap-4">
              {/* Current/Preview Cover */}
              <div className="w-32 h-44 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Current cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Pilih gambar cover buku"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors border border-border disabled:opacity-50"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ganti Cover
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Format: JPEG, PNG, WebP (Max. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-5">
            {/* Judul */}
            <div>
              <label htmlFor="judul" className="block text-sm font-medium text-foreground mb-2">
                Judul Buku <span className="text-red-500">*</span>
              </label>
              <input
                id="judul"
                name="judul"
                type="text"
                value={formData.judul}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              />
            </div>

            {/* Penulis */}
            <div>
              <label htmlFor="penulis" className="block text-sm font-medium text-foreground mb-2">
                Penulis <span className="text-red-500">*</span>
              </label>
              <input
                id="penulis"
                name="penulis"
                type="text"
                value={formData.penulis}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              />
            </div>

            {/* Penerbit */}
            <div>
              <label htmlFor="penerbit" className="block text-sm font-medium text-foreground mb-2">
                Penerbit <span className="text-red-500">*</span>
              </label>
              <input
                id="penerbit"
                name="penerbit"
                type="text"
                value={formData.penerbit}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              />
            </div>

            {/* Tahun & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tahun" className="block text-sm font-medium text-foreground mb-2">
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
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                />
              </div>

              <div>
                <label htmlFor="category_name" className="block text-sm font-medium text-foreground mb-2">
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
              <label htmlFor="deskripsi" className="block text-sm font-medium text-foreground mb-2">
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-foreground"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}