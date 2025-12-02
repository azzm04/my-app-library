"use client";

import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Book,
  User,
  Heart,
  Plus,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DesktopNavbarProps {
  currentPage: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: LinkProps<any>["href"];
}

export default function DesktopNavbar({ currentPage }: DesktopNavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Fetch user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(profile?.role || null);
      }
      setIsLoading(false);
    };

    fetchUser();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }: any) => setUserRole(data?.role || null));
        } else {
          setUserRole(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  };

  const navItems: NavItem[] = [
    { id: "home", label: "Beranda", icon: Home, href: "/" },
    { id: "fiksi", label: "Fiksi", icon: BookOpen, href: "/fiksi" },
    { id: "nonfiksi", label: "Non-Fiksi", icon: Book, href: "/nonfiksi" },
    { id: "favorites", label: "Favorit", icon: Heart, href: "/favorites" },
  ];

  return (
    <nav className="hidden md:block bg-card shadow-md sticky top-0 z-40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Book Shelf Management
            </span>
          </Link>

          {/* Navigation Items + Buttons */}
          <div className="flex items-center gap-2">
            {/* Navigation Links */}
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

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
                );
              })}
            </div>

            {/* Tambah Buku Button - Hanya untuk ADMIN */}
            {userRole === "ADMIN" && (
              <Link
                href="/tambah-buku"
                className="flex items-center space-x-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg font-semibold ml-2"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Buku</span>
              </Link>
            )}

            {/* User Menu / Login Button */}
            {isLoading ? (
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse ml-2" />
            ) : user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 border border-border"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-foreground">
                      {user.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userRole === "ADMIN" ? "👑 Admin" : "👤 User"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                      <div className="p-3 border-b border-border bg-muted/30">
                        <p className="font-semibold text-foreground truncate">
                          {user.user_metadata?.name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Tentang Pembuat
                          </span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg font-semibold ml-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
