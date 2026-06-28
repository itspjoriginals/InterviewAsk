"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Moon, Sun, Menu, X, PenSquare, LogOut, User, LayoutDashboard, Compass } from "lucide-react";
import { ROLE_CONFIG } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = (session?.user as any)?.role as UserRole | undefined;
  const roleInfo = role ? ROLE_CONFIG[role] : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-xl text-foreground flex-shrink-0">
          Interview<span className="text-primary">Ask</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/explore" className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            Explore
          </Link>
          {session && (
            <>
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Dashboard
              </Link>
              <Link href="/post/new" className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <PenSquare size={15} /> Share
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            <Sun size={18} className="hidden dark:block" />
            <Moon size={18} className="dark:hidden" />
          </button>

          {session ? (
            <div className="hidden md:flex items-center gap-2">
              {roleInfo && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors">
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || ""} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm font-medium text-foreground truncate">{session.user?.name}</div>
                    <div className="px-3 pb-2 text-xs text-muted-foreground truncate">{session.user?.email}</div>
                    <div className="border-t border-border my-1" />
                    <Link href={`/profile/${(session.user as any).id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                      <User size={14} /> Profile
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          <Link href="/explore" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted">
            <Compass size={16} /> Explore
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link href={`/profile/${(session.user as any).id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted">
                <User size={16} /> Profile
              </Link>
              <Link href="/post/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-muted">
                <PenSquare size={16} /> Share Post
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10">
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted">Sign in</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-muted">Create Account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
