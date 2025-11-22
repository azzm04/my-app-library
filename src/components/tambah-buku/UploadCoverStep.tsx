// components/tambah-buku/UploadCoverStep.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

interface UploadCoverStepProps {
  onSuccess: (url: string, file: File) => void;
}

export default function UploadCoverStep({ onSuccess }: UploadCoverStepProps) {
  const [preview, setPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak valid. Gunakan JPEG, PNG, atau WebP.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      console.log('🚀 Uploading file to /api/upload...');

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log('📡 Response status:', response.status);

      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);

      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. API endpoint might not exist.');
      }

      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupload gambar");
      }

      console.log('✅ Upload successful:', result.data.publicUrl);
      onSuccess(result.data.publicUrl, selectedFile);
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || "Terjadi kesalahan saat upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Upload Foto Cover Buku
        </h2>
        <p className="text-sm text-muted-foreground">
          Cover harus diupload terlebih dahulu sebelum mengisi form
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Pilih gambar cover buku"
        />

        {preview ? (
          <div className="space-y-4 text-center">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-sm text-primary font-medium">
              ✓ Gambar berhasil dipilih
            </p>
            <p className="text-xs text-muted-foreground">
              Klik untuk mengganti gambar
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                Klik untuk pilih foto
              </p>
              <p className="text-sm text-muted-foreground">
                Maksimal 5MB (.jpg, .jpeg, .png, .webp)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Mengupload...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Lanjutkan
            </>
          )}
        </button>
      )}
    </div>
  );
}