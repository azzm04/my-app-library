"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    // Validasi panjang password
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: "USER", // Default role
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Registrasi Berhasil!
          </h2>
          <p className="text-muted-foreground">
            Akun Anda telah dibuat. Silakan cek email untuk verifikasi (jika
            diperlukan). Redirecting ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-primary/10 border border-primary/20 backdrop-blur-sm p-4 rounded-2xl">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-muted-foreground">
            Daftar untuk mulai menggunakan Book Shelf
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
