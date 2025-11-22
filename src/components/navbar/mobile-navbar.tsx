"use client"

import { Home, BookOpen, Book, User, Heart, Plus } from "lucide-react"
import Link, { LinkProps } from "next/link" // 1. Import LinkProps

interface MobileNavbarProps {
  currentPage: string
}

interface NavItem {
  id: string
  label: string
  icon: any
  href: LinkProps<any>['href']
  isSpecial?: boolean
}

export default function MobileNavbar({ currentPage }: MobileNavbarProps) {
  const navItems: NavItem[] = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    { id: "fiksi", label: "Fiksi", icon: BookOpen, href: "/fiksi" },
    { id: "tambah", label: "Tambah", icon: Plus, href: "/tambah-buku", isSpecial: true },
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
    { id: "profile", label: "Profil", icon: User, href: "/profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 shadow-lg z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16 relative">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          if (item.isSpecial) {
            return (
              <Link
                key={item.id}
                href={item.href} 
                className="flex flex-col items-center justify-center relative"
              >
                <div className="absolute -top-6 flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-semibold text-primary mt-1">
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${isActive ? "transform -translate-y-0.5" : ""}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}