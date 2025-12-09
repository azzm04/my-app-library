"use client"

import { useState, useEffect, useRef } from "react"
import { Home, BookOpen, Book, User, Heart, Plus, LogOut, LogIn, ChevronDown, Info, Sparkles } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface DesktopNavbarProps {
  currentPage: string
}

interface NavItem {
  id: string
  label: string
  icon: any
  href: LinkProps<any>["href"]
}

export default function DesktopNavbar({ currentPage }: DesktopNavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        setUserRole(profile?.role?.toLowerCase() || null)
      }
      setIsLoading(false)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }: any) => setUserRole(data?.role?.toLowerCase() || null))
      } else {
        setUserRole(null)
      }
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      authListener.subscription.unsubscribe()
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowUserMenu(false)
    router.push("/")
    router.refresh()
  }

  const navItems: NavItem[] = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    { id: "fiksi", label: "Fiksi", icon: BookOpen, href: "/fiksi" },
    { id: "nonfiksi", label: "Non-Fiksi", icon: Book, href: "/nonfiksi" },
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
  ]

  return (
    <nav className="hidden md:block bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-2 md:p-2.5 rounded-xl group-hover:border-primary/40 transition-all duration-300">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="hidden lg:block text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Book Shelf Management
              </span>
              <span className="block lg:hidden text-sm md:text-base font-bold text-foreground">BookShelf</span>
            </div>
          </Link>

          {/* Navigation Items + Buttons */}
          <div className="flex items-center gap-1 md:gap-2 xl:gap-3">
            {/* Navigation Links */}
            <div className="flex items-center bg-muted/30 rounded-lg md:rounded-xl p-0.5 md:p-1 border border-border/50">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative flex items-center gap-1 md:gap-2 px-2 md:px-3 xl:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="hidden lg:inline font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full lg:hidden" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Tambah Buku Button - Hanya untuk ADMIN */}
            {userRole === "admin" && (
              <Link
                href="/tambah-buku"
                className="group relative flex items-center gap-1 md:gap-2 px-2.5 md:px-4 xl:px-5 py-1.5 md:py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                <span className="hidden lg:inline text-sm">Tambah Buku</span>
              </Link>
            )}

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg md:rounded-xl animate-pulse" />
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all duration-300 border ${
                    showUserMenu
                      ? "border-primary/50 bg-primary/5 shadow-md"
                      : "border-border/50 hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center transition-colors ${
                      user ? "bg-gradient-to-br from-primary/20 to-primary/10" : "bg-muted"
                    }`}
                  >
                    <User className={`w-3 h-3 md:w-4 md:h-4 ${user ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  <div className="text-left hidden xl:block min-w-[80px]">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {user ? user.user_metadata?.name || "User" : "Tamu"}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {user ? (userRole === "admin" ? "Admin" : "Member") : "Belum Login"}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-3 h-3 md:w-4 md:h-4 text-muted-foreground transition-transform duration-300 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-border/60 bg-gradient-to-br from-muted/50 to-muted/30">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            user
                              ? "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                              : "bg-muted border border-border"
                          }`}
                        >
                          <User className={`w-6 h-6 ${user ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {user ? user.user_metadata?.name || "Pengguna" : "Halo, Tamu!"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user ? user.email : "Silakan login untuk akses penuh"}
                          </p>
                          {user && (
                            <span
                              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                userRole === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {userRole === "admin" ? "ADMIN" : "MEMBER"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/80 text-foreground transition-all duration-200 group"
                      >
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                          <Info className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tentang Pembuat</p>
                          <p className="text-[11px] text-muted-foreground">Informasi pengembang</p>
                        </div>
                      </Link>

                      <div className="h-px bg-border/60 mx-2 my-2" />

                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Keluar Akun</span>
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <LogIn className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold">Login Sekarang</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
