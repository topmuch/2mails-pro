"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  ArrowLeft,
  Menu,
  X,
  BarChart3,
  CalendarDays,
  Bell,
  Inbox,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu, LogoutButton } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/equipe", label: "Équipe", icon: Users },
  { href: "/dashboard/messages", label: "Messages", icon: Mail },
  { href: "/dashboard/messagerie", label: "Messagerie", icon: Inbox },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/dashboard/email", label: "Email & Notifications", icon: Bell },
  { href: "/dashboard/seo", label: "Paramètres SEO", icon: Settings },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Users;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/70 hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: "1.125rem", height: "1.125rem" }} />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-background">
        <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-lg overflow-hidden bg-white p-1 ring-1 ring-border shrink-0">
              { }
              <img
                src="/logo-2mails-transparent.png"
                alt="Logo 2mails.pro"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-none min-w-0">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Administration
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href, item.exact)}
            />
          ))}

          {/* Séparateur */}
          <div className="my-2 border-t border-border" />

          {/* Retour au site & Déconnexion — sous Paramètres SEO */}
          <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au site
            </Link>
          </Button>
          <LogoutButton />
        </nav>

        <div className="border-t border-border">
          <UserMenu />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white p-1 ring-1 ring-border">
            { }
            <img
              src="/logo-2mails-transparent.png"
              alt="Logo 2mails.pro"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-secondary"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-background border-r border-border flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg overflow-hidden bg-white p-1 ring-1 ring-border">
                    { }
                    <img
                      src="/logo-2mails-transparent.png"
                      alt="Logo 2mails.pro"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Administration
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-secondary"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(item.href, item.exact)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}

                {/* Séparateur */}
                <div className="my-2 border-t border-border" />

                {/* Retour au site & Déconnexion — sous Paramètres SEO */}
                <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au site
                  </Link>
                </Button>
                <LogoutButton />
              </nav>
              <div className="border-t border-border">
                <UserMenu />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
