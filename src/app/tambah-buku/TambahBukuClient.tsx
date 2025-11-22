"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Loader2, Upload, Image as ImageIcon, 
  CheckCircle2, Link as LinkIcon, Check, AlertCircle 
} from "lucide-react";

interface FormData {
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: string;
  deskripsi: string;
  category_name: string;
  link_eksternal: string; // Field Baru
}

export default function TambahBukuClient() {
  const router = useRouter();

  // --- STATE ---
  const [formData, setFormData] = useState<FormData>({
    judul: "",
    penulis: "",
    penerbit: "",
    tahun: new Date().getFullYear().toString(),
    deskripsi: "",
    category_name: "Fiksi",
    link_eksternal: "", // State Baru
  });

  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string>("");
  
  // State untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

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

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak valid. Gunakan JPEG, PNG, atau WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    // Preview lokal langsung
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload
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

      if (!uploadResponse.ok) throw new Error("Gagal upload cover");

      const uploadResult = await uploadResponse.json();
      setCoverUrl(uploadResult.data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Gagal mengupload cover");
      setCoverPreview(""); // Reset preview jika gagal
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validasi Dasar
      if (!formData.judul || !formData.penulis || !formData.penerbit || !formData.tahun) {
        setError("Mohon lengkapi semua field bertanda bintang (*)");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        tahun: parseInt(formData.tahun),
        cover: coverUrl, // Bisa string kosong jika user tidak upload
        link_eksternal: formData.link_eksternal, // Kirim link ke API
      };

      // Kirim ke API POST (Create)
      const response = await fetch("/api/buku", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menambahkan buku");
      }

      // Tampilkan Modal Sukses (Ganti alert)
      setShowSuccessModal(true);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan buku");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi navigasi setelah sukses
  const handleSuccessRedirect = () => {
    router.refresh();
    router.push("/"); // Kembali ke Home
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      
      {/* --- SUCCESS MODAL (MODERN POPUP) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            {/* Ikon Sukses Memantul */}
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full animate-bounce duration-1000">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            {/* Teks Informasi */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Berhasil Ditambahkan!</h3>
              <p className="text-muted-foreground text-sm">
                Buku <span className="font-semibold text-foreground">"{formData.judul}"</span> telah berhasil ditambahkan ke koleksi Anda.
              </p>
            </div>

            {/* Tombol OK */}
            <button
              onClick={handleSuccessRedirect}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold transition-all duration-200 shadow-sm mt-2"
            >
              OK, Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      {/* Header Nav */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Tambah Buku Baru
          </h1>
          <p className="text-muted-foreground">
            Bagikan buku favoritmu dengan komunitas
          </p>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10" />
          
          {/* Step 1 */}
          <div className="flex items-center gap-2 bg-background pr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${coverUrl ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
              {coverUrl ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className="text-sm font-medium text-foreground">Upload Cover</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2 bg-background pl-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm font-medium text-foreground">Isi Form</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* --- SECTION 1: COVER --- */}
          {!coverUrl ? (
            // Tampilan Belum Upload
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {isUploadingCover ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-foreground">Upload Cover Buku</h3>
              <p className="text-sm text-muted-foreground mt-1">Klik untuk memilih file (Max 5MB)</p>
            </div>
          ) : (
            // Tampilan SUKSES Upload
            <div className="bg-green-50/50 border border-green-200 rounded-lg p-4 flex items-start gap-4">
              <div className="w-16 h-24 bg-muted rounded overflow-hidden shrink-0 border border-border shadow-sm">
                <img src={coverPreview || coverUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-700 font-semibold flex items-center gap-2 text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Cover berhasil diupload
                </h3>
                <p className="text-green-600/80 text-xs">
                  Silakan isi form di bawah untuk melengkapi detail buku
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> Ganti Cover
              </button>
            </div>
          )}
          
          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload Cover Buku"
          />

          {/* --- SECTION 2: FORM FIELDS --- */}
          <div className="space-y-5 pt-2">
            
            {/* Judul */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Judul Buku <span className="text-red-500">*</span>
              </label>
              <input
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                placeholder="Contoh: Laskar Pelangi"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Penulis */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Penulis <span className="text-red-500">*</span>
              </label>
              <input
                name="penulis"
                value={formData.penulis}
                onChange={handleInputChange}
                placeholder="Nama penulis buku"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Penerbit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Penerbit <span className="text-red-500">*</span>
              </label>
              <input
                name="penerbit"
                value={formData.penerbit}
                onChange={handleInputChange}
                placeholder="Nama penerbit"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Grid Tahun & Kategori */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tahun Terbit <span className="text-red-500">*</span>
                </label>
                <input
                  name="tahun"
                  type="number"
                  value={formData.tahun}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  aria-label="Tahun Terbit"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  aria-label="Kategori"
                >
                  <option value="Fiksi">Fiksi</option>
                  <option value="Non-Fiksi">Non-Fiksi</option>
                </select>
              </div>
            </div>

            {/* --- FIELD BARU: Link Eksternal --- */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Link Baca / Sumber Buku
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  name="link_eksternal"
                  type="url"
                  value={formData.link_eksternal}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full pl-10 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Opsional: Masukkan link ke Google Books atau sumber online lainnya.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                rows={4}
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Sinopsis singkat buku..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
              />
              <div className="text-right text-xs text-muted-foreground">
                {formData.deskripsi.length} karakter
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploadingCover}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan Buku...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Tambahkan Buku
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}