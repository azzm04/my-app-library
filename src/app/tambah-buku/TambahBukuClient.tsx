"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Loader2, Upload, Image as ImageIcon, 
  CheckCircle2, Link as LinkIcon, Check, AlertCircle,
  Save, RotateCcw, AlertTriangle, X
} from "lucide-react";

interface FormData {
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: string;
  deskripsi: string;
  category_name: string;
  link_eksternal: string;
}

const DRAFT_KEY = "draft_tambah_buku";

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
    link_eksternal: "",
  });

  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string>("");
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // State untuk Modal Reset
  const [showResetModal, setShowResetModal] = useState(false);

  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftNotification, setShowDraftNotification] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOAD DRAFT SAAT COMPONENT MOUNT ---
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setCoverUrl(draft.coverUrl || "");
        setCoverPreview(draft.coverPreview || "");
        setHasDraft(true);
        setShowDraftNotification(true);
        
        // Auto-hide notifikasi setelah 5 detik
        setTimeout(() => setShowDraftNotification(false), 5000);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // --- AUTO-SAVE DRAFT SETIAP KALI ADA PERUBAHAN ---
  useEffect(() => {
    // Jangan save jika semua field kosong
    const hasContent = formData.judul || formData.penulis || formData.penerbit || formData.deskripsi || formData.link_eksternal || coverUrl;
    
    if (hasContent) {
      const draft = {
        formData,
        coverUrl,
        coverPreview,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHasDraft(true);
    }
  }, [formData, coverUrl, coverPreview]);

  // --- HAPUS DRAFT ---
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setShowDraftNotification(false);
  };

  // --- RESET FORM LOGIC ---
  // 1. Trigger buka modal
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  // 2. Eksekusi reset data
  const confirmReset = () => {
    setFormData({
      judul: "",
      penulis: "",
      penerbit: "",
      tahun: new Date().getFullYear().toString(),
      deskripsi: "",
      category_name: "Fiksi",
      link_eksternal: "",
    });
    setCoverUrl("");
    setCoverPreview("");
    clearDraft();
    
    // Tutup modal setelah reset
    setShowResetModal(false);
  };

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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
      setCoverPreview("");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.judul || !formData.penulis || !formData.penerbit || !formData.tahun) {
        setError("Mohon lengkapi semua field bertanda bintang (*)");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        tahun: parseInt(formData.tahun),
        cover: coverUrl,
        link_eksternal: formData.link_eksternal,
      };

      const response = await fetch("/api/buku", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menambahkan buku");
      }

      // Hapus draft setelah berhasil submit
      clearDraft();
      setShowSuccessModal(true);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan buku");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessRedirect = () => {
    router.refresh();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      
      {/* --- DRAFT NOTIFICATION --- */}
      {showDraftNotification && (
        <div className="fixed top-20 right-4 z-50 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 max-w-sm">
          <div className="flex items-start gap-3">
            <Save className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Draft Ditemukan!</p>
              <p className="text-xs mt-1">Data form Anda telah dipulihkan dari draft terakhir.</p>
            </div>
            <button 
              onClick={() => setShowDraftNotification(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* --- RESET CONFIRMATION MODAL (MODERN) --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button (X) */}
            <button 
              onClick={() => setShowResetModal(false)} 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              {/* Icon Peringatan */}
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Reset Data?</h3>
                <p className="text-muted-foreground text-sm">
                  Apakah Anda yakin ingin menghapus semua data yang telah diisi? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm border border-border bg-background hover:bg-muted text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ya, Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full animate-bounce duration-1000">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Berhasil Ditambahkan!</h3>
              <p className="text-muted-foreground text-sm">
                Buku <span className="font-semibold text-foreground">"{formData.judul}"</span> telah berhasil ditambahkan ke koleksi Anda.
              </p>
            </div>

            <button
              onClick={handleSuccessRedirect}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold transition-all duration-200 shadow-sm mt-2"
            >
              OK, Kembali ke Beranda
            </button>
          </div>
        </div>
      )}

      {/* Header Nav */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          {/* Auto-Save Indicator */}
          {hasDraft && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Save className="w-3 h-3" />
              <span>Draft tersimpan otomatis</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        
        {/* Title Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Tambah Buku Baru
            </h1>
            <p className="text-muted-foreground">
              Bagikan buku favoritmu dengan komunitas
            </p>
          </div>

          {/* Reset Button (Opens Modal) */}
          {hasDraft && (
            <button
              onClick={handleResetClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-red-600 border border-border hover:border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Reset Form"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10" />
          
          <div className="flex items-center gap-2 bg-background pr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${coverUrl ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
              {coverUrl ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className="text-sm font-medium text-foreground">Upload Cover</span>
          </div>

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

          {/* Cover Upload Section */}
          {!coverUrl ? (
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
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload Cover Buku"
          />

          {/* Form Fields */}
          <div className="space-y-5 pt-2">
            
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