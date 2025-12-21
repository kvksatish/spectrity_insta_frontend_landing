"use client";

// @ts-expect-error - lucide icons don't have individual type exports
import Github from "lucide-react/dist/esm/icons/github";
// @ts-expect-error - lucide icons don't have individual type exports
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
// @ts-expect-error - lucide icons don't have individual type exports
import Twitter from "lucide-react/dist/esm/icons/twitter";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import type { FooterSection } from "@/types/landing-page";

interface FooterProps {
  config: FooterSection;
}

const socialIconMap = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
};

export function Footer({ config }: FooterProps) {
  return (
    <footer className="border-t border-border/30 bg-background/50 backdrop-blur">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        <div className="grid gap-8 sm:gap-10 md:gap-12 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {/* Logo and Description - Full width on mobile */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-base sm:text-lg font-bold tracking-tight">
                {config.logo.text}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground/70 mb-6 leading-relaxed max-w-xs">
              {config.description}
            </p>
            {config.socialLinks && (
              <div className="flex gap-2.5 sm:gap-3">
                {config.socialLinks.map((social, index) => {
                  const Icon =
                    socialIconMap[social.icon as keyof typeof socialIconMap];
                  return Icon ? (
                    <Link
                      key={index}
                      href={social.href}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:border-border transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="sr-only">{social.platform}</span>
                    </Link>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Footer Columns - 2 per row on mobile */}
          {config.columns.map((column, index) => (
            <div key={index} className="col-span-1">
              <h3 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 tracking-tight">
                {column.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground/70 hover:text-foreground transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8 sm:my-10 bg-border/30" />
        <div className="text-center text-xs sm:text-sm text-muted-foreground/60">
          {config.copyright}
        </div>
      </div>
    </footer>
  );
}
