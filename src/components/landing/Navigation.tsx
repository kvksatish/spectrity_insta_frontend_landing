"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { NavigationConfig } from "@/types/landing-page";

interface NavigationProps {
  config: NavigationConfig;
}

export function Navigation({ config }: NavigationProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-12 items-center justify-between relative">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-base font-semibold tracking-tight">
              {config.logo.text}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              // Show Dashboard button if user is authenticated
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              // Show Sign In and Get Started buttons if not authenticated
              <>
                <Button variant="ghost" size="sm" asChild>
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
        </div>
      </div>
    </header>
  );
}
