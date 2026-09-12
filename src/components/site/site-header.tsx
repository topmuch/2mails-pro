"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n";
import { NAV_LINKS } from "@/lib/site-data";

const NAV_LABEL_KEYS: Record<string, string> = {
  "/": "nav.home",
  "/a-propos": "nav.about",
  "/services": "nav.services",
  "/atouts": "nav.atouts",
  "/partenaires": "nav.partners",
  "/contact": "nav.contact",
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : isHome
            ? "bg-gradient-to-b from-[#0c1f4a]/85 via-[#0c1f4a]/45 to-transparent"
            : "bg-background border-b border-border"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="2mails.pro">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-lg overflow-hidden bg-white p-1.5 ring-1 ring-border">
              <img
                src="/logo-2mails-transparent.png"
                alt="Logo 2mails.pro"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    scrolled || !isHome
                      ? `text-foreground/80 hover:bg-secondary hover:text-foreground ${
                          active ? "text-accent" : ""
                        }`
                      : `text-white/90 hover:bg-white/10 ${
                          active ? "text-accent" : ""
                        }`
                  }`}
                >
                  {t(NAV_LABEL_KEYS[link.href] || "nav.home")}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
            >
              <Link href="/contact">
                {t("header.getQuote")}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className={`hidden sm:inline-flex border ${
                scrolled || !isHome
                  ? "bg-background border-border text-foreground hover:bg-secondary"
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              }`}
            >
              <Link href="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                {t("header.login")}
              </Link>
            </Button>

            <LanguageToggle variant={scrolled || !isHome ? "light-header" : "dark-header"} />
            <ThemeToggle variant={scrolled || !isHome ? "light-header" : "dark-header"} />

            <button
              onClick={() => setOpen((v) => !v)}
              className={`lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md transition-colors ${
                scrolled || !isHome
                  ? "text-foreground hover:bg-secondary"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-background border-b border-border"
          >
            <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      active
                        ? "bg-secondary text-accent"
                        : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {t(NAV_LABEL_KEYS[link.href] || "nav.home")}
                  </Link>
                );
              })}
              <Button
                asChild
                className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/contact">
                  {t("header.getQuote")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  {t("header.login")}
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
