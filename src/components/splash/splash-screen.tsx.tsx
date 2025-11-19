"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setFadeOut(true)
          setTimeout(onComplete, 600)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 text-center space-y-6 sm:space-y-8 px-4">
        <div className="inline-flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-accent/20">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-accent animate-bounce" />
            </div>
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-balance">
            Book Shelf Management
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-300">Koleksi Buku Favoritmu</p>
        </div>

        <div className="w-56 sm:w-64 space-y-3">
          <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">Memuat... {Math.floor(progress)}%</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-500 text-xs sm:text-sm">Powered by PWA Technology</div>
    </div>
  )
}
