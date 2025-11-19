"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  Calendar,
  School,
  BookOpen,
} from "lucide-react"

export default function ProfilePage() {
  const profileData = {
    nama: "Azzam Syaiful Islam",
    nim: "21120123120035",
    kelompok: "24",
    email: "azzamsyaifulislam@students.undip.ac.id",
    phone: "+62 813-3143-7810",
    prodi: "Teknik Komputer",
    fakultas: "Fakultas Teknik",
    angkatan: "2023",
    alamat: "Semarang, Jawa Tengah",
  }

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // 🔹 Ambil foto profil GitHub
  useEffect(() => {
    fetch("https://api.github.com/users/azzm04")
      .then((res) => res.json())
      .then((data) => setAvatarUrl(data.avatar_url))
      .catch((err) => console.error("Gagal memuat avatar GitHub:", err))
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-linear-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl w-32 h-32" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-1 rounded-full w-32 h-32">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="GitHub Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-16 h-16 text-primary animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {profileData.nama}
              </h1>
              <p className="text-lg text-primary font-semibold">
                NIM: {profileData.nim}
              </p>
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-accent" />
                <p className="text-accent font-medium">
                  Kelompok {profileData.kelompok} Praktikan PPB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informasi Profil */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Card */}
          <ProfileCard
            icon={<Mail className="w-6 h-6 text-primary" />}
            label="Email"
            value={profileData.email}
            color="primary"
          />

          {/* Phone Card */}
          <ProfileCard
            icon={<Phone className="w-6 h-6 text-accent" />}
            label="Telepon"
            value={profileData.phone}
            color="accent"
          />

          {/* Location Card */}
          <ProfileCard
            icon={<MapPin className="w-6 h-6 text-primary" />}
            label="Alamat"
            value={profileData.alamat}
            color="primary"
          />

          {/* Program Studi Card */}
          <ProfileCard
            icon={<Award className="w-6 h-6 text-accent" />}
            label="Program Studi"
            value={profileData.prodi}
            color="accent"
          />

          {/* Fakultas Card */}
          <ProfileCard
            icon={<School className="w-6 h-6 text-primary" />}
            label="Fakultas"
            value={profileData.fakultas}
            color="primary"
          />

          {/* Angkatan Card */}
          <ProfileCard
            icon={<Calendar className="w-6 h-6 text-accent" />}
            label="Angkatan"
            value={profileData.angkatan}
            color="accent"
          />
        </div>
      </section>

      {/* Tentang Aplikasi */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        <div className="group bg-card border border-border/60 rounded-xl p-8 md:p-12 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Tentang Aplikasi
            </h2>
          </div>

          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Book Shelf Management</strong> adalah aplikasi Progressive Web App
              (PWA) yang dibuat sebagai tugas praktikum Pemrograman Berbasis Platform. Aplikasi ini menampilkan koleksi
              buku fiksi dan non-fiksi Indonesia dengan fitur offline yang dapat diinstall di perangkat Anda.
            </p>
            <p>
              Aplikasi ini dibangun menggunakan teknologi modern seperti
              React.js, Next.js, dan Tailwind CSS dengan implementasi Service
              Worker untuk mendukung fungsionalitas offline.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            {[
              "React.js",
              "Next.js",
              "PWA",
              "Tailwind CSS",
              "Service Worker",
              "TypeScript",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-full font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProfileCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: "primary" | "accent"
}) {
  const colorClass =
    color === "primary"
      ? "bg-primary/10 border-primary/20 group-hover:bg-primary/15"
      : "bg-accent/10 border-accent/20 group-hover:bg-accent/15"

  return (
    <div className="group bg-card border border-border/60 rounded-xl p-8 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg border ${colorClass} transition-colors`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {label}
          </p>
          <p className="font-semibold text-foreground break-all">{value}</p>
        </div>
      </div>
    </div>
  )
}
