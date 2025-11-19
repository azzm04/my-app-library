"use client"

import { Home, BookOpen, Book, User, Heart } from "lucide-react"
import Link from "next/link"

interface DesktopNavbarProps {
  currentPage: string
}

export default function DesktopNavbar({ currentPage }: DesktopNavbarProps) {
  const navItems = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    { id: "fiksi", label: "Fiksi", icon: BookOpen, href: "/fiksi" },
    { id: "nonfiksi", label: "Non-Fiksi", icon: Book, href: "/nonfiksi" },
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
    { id: "profile", label: "Profil", icon: User, href: "/profile" },
  ]

  return (
    <nav className="hidden md:block bg-card shadow-md sticky top-0 z-40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Book Shelf Management</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
