"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  LayoutDashboard,
  LogIn,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { NAV_LINKS, SERVICES, COMPANY } from "@/lib/site-data";
import { useLanguage } from "@/lib/i18n";

const SITE_URL = "https://2mails.pro/";

const NAV_LABEL_KEYS: Record<string, string> = {
  "/": "nav.home",
  "/a-propos": "nav.about",
  "/services": "nav.services",
  "/atouts": "nav.atouts",
  "/partenaires": "nav.partners",
  "/contact": "nav.contact",
};

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0c1f4a] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg overflow-hidden bg-white p-1.5 shrink-0">
                <img
                  src="/logo-2mails-transparent.png"
                  alt="Logo 2mails.pro"
                  className="h-16 w-auto sm:h-20 object-contain"
                />
              </div>
              <div className="text-xs text-white/60">
                {t("footer.brand")}
              </div>
            </div>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              {t("footer.nav")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    {t(NAV_LABEL_KEYS[l.href] || "nav.home")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              {t("footer.services")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              {t("footer.contact")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>
                  {COMPANY.addressLine1}<br />
                  {COMPANY.addressLine2}, {COMPANY.city}, {COMPANY.country}
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/70">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${COMPANY.phoneHref}`} className="hover:text-accent transition-colors">
                    {COMPANY.phone}
                  </a>
                  <a href={`tel:${COMPANY.phoneSecondaryHref}`} className="hover:text-accent transition-colors text-xs text-white/60">
                    {COMPANY.phoneSecondary}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/70">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-accent transition-colors"
                >
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>

          {/* QR Code (right) */}
          <div className="flex flex-col items-center lg:items-end">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/90 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-accent" />
              {t("footer.scan")}
            </h4>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 group block rounded-xl bg-white p-3 shadow-lg ring-1 ring-white/20 hover:ring-accent/50 transition-all hover:scale-105"
              aria-label="QR code 2mails.pro"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&color=0c1f4a&bgcolor=ffffff&data=${encodeURIComponent(SITE_URL)}`}
                alt="QR code vers 2mails.pro"
                width={120}
                height={120}
                className="h-[120px] w-[120px]"
                loading="lazy"
              />
            </a>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-accent transition-colors"
            >
              2mails.pro
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/55 text-center sm:text-left">
            © {new Date().getFullYear()} 2mails.pro. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs text-white/55 hover:text-accent transition-colors inline-flex items-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("header.login")}
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-white/55 hover:text-accent transition-colors inline-flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              {t("footer.dashboard")}
            </Link>
            <p className="text-xs text-white/55">
              {t("footer.since")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
