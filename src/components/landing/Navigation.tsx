"use client";

import Link from "next/link";
import { useState } from "react";
// @ts-expect-error - lucide icons don't have individual type exports
import Menu from "lucide-react/dist/esm/icons/menu";
// @ts-expect-error - lucide icons don't have individual type exports
import X from "lucide-react/dist/esm/icons/x";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { NavigationConfig } from "@/types/landing-page";

interface NavigationProps {
  config: NavigationConfig;
}

export function Navigation({ config }: NavigationProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <span className="text-lg md:text-xl font-bold tracking-tight">
              {config.logo.text}
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
            {config.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button size="sm" asChild>
                <Link href="/essence">Essence</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                {config.cta && (
                  <Button size="sm" asChild>
                    <Link href={config.cta.href}>{config.cta.label}</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {config.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 px-2 rounded-md hover:bg-muted/50"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border/20 flex flex-col gap-2">
              {user ? (
                <Button size="sm" asChild className="w-full">
                  <Link href="/essence">Essence</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  {config.cta && (
                    <Button size="sm" asChild className="w-full">
                      <Link href={config.cta.href}>{config.cta.label}</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
