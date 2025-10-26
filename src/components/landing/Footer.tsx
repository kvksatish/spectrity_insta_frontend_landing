"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import type { FooterSection } from "@/types/landing-page";
import { Github, Linkedin, Twitter } from "lucide-react";

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
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-lg font-semibold tracking-tight">{config.logo.text}</span>
            </Link>
            <p className="text-sm text-muted-foreground/70 mb-6 leading-relaxed max-w-xs">
              {config.description}
            </p>
            {config.socialLinks && (
              <div className="flex gap-3">
                {config.socialLinks.map((social, index) => {
                  const Icon =
                    socialIconMap[social.icon as keyof typeof socialIconMap];
                  return Icon ? (
                    <Link
                      key={index}
                      href={social.href}
                      className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:border-border transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="sr-only">{social.platform}</span>
                    </Link>
                  ) : null;
                })}
              </div>
            )}
          </div>
          {config.columns.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold text-sm mb-4 tracking-tight">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-10 bg-border/30" />
        <div className="text-center text-sm text-muted-foreground/60">
          {config.copyright}
        </div>
      </div>
    </footer>
  );
}
