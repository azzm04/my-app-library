// app/tambah-buku/TambahBukuClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import UploadCoverStep from "@/components/tambah-buku/UploadCoverStep";
import FormDetailStep from "@/components/tambah-buku/FormDetailStep";

export default function TambahBukuClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleCoverUploadSuccess = (url: string, file: File) => {
    setCoverUrl(url);
    setCoverFile(file);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>

            {currentStep === 2 && (
              <button
                type="submit"
                form="book-form"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Simpan Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Tambah Buku Baru
          </h1>
          <p className="text-muted-foreground">
            Bagikan buku favoritmu dengan komunitas
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                currentStep >= 1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Upload Cover
            </span>
          </div>

          {/* Divider */}
          <div
            className={`flex-1 h-1 rounded-full ${
              currentStep >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                currentStep >= 2 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Isi Form
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg border border-border p-6 md:p-8">
          {currentStep === 1 && (
            <UploadCoverStep onSuccess={handleCoverUploadSuccess} />
          )}

          {currentStep === 2 && (
            <FormDetailStep
              coverUrl={coverUrl}
              coverFile={coverFile}
              onChangeImage={() => setCurrentStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}