"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Mail, Clock, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";

type MaintenanceData = {
  enabled: boolean;
  messageFr: string;
  messageEn: string;
  endTime: string | null;
  updatedAt?: string;
};

const DEFAULT_DATA: MaintenanceData = {
  enabled: true,
  messageFr: "Site en maintenance. Nous serons de retour très bientôt.",
  messageEn: "Site under maintenance. We will be back very soon.",
  endTime: null,
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeTimeLeft(endTime: string, now: number): TimeLeft | null {
  const diff = new Date(endTime).getTime() - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function MaintenancePage() {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<MaintenanceData>(DEFAULT_DATA);
  // `now` ticks every second so the countdown re-renders; timeLeft is derived
  // from `data.endTime` + `now` directly during render (no setState-in-effect).
  const [now, setNow] = useState<number>(() => Date.now());

  // Fetch maintenance settings on mount
  useEffect(() => {
    let active = true;
    fetch("/api/maintenance", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (active && json?.ok && json.data) {
          setData({
            enabled: json.data.enabled,
            messageFr: json.data.messageFr || DEFAULT_DATA.messageFr,
            messageEn: json.data.messageEn || DEFAULT_DATA.messageEn,
            endTime: json.data.endTime || null,
            updatedAt: json.data.updatedAt,
          });
        }
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      active = false;
    };
  }, []);

  // Tick `now` every second — only when an endTime is configured.
  useEffect(() => {
    if (!data.endTime) return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [data.endTime]);

  const message = lang === "fr" ? data.messageFr : data.messageEn;
  const title = lang === "fr" ? "Maintenance en cours" : "Maintenance in progress";
  const backLabel = lang === "fr" ? "Nous sommes de retour !" : "We are back!";
  const contactLabel = lang === "fr" ? "Contactez-nous" : "Contact us";

  // Derive countdown values from `now` and `endTime` (no extra state).
  const timeLeft = data.endTime ? computeTimeLeft(data.endTime, now) : null;
  const done =
    !!timeLeft &&
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  const cards = timeLeft
    ? [
        { value: timeLeft.days, label: t("maintenance.days") },
        { value: timeLeft.hours, label: t("maintenance.hours") },
        { value: timeLeft.minutes, label: t("maintenance.minutes") },
        { value: timeLeft.seconds, label: t("maintenance.seconds") },
      ]
    : [];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0c1f4a] via-[#14306e] to-[#0c1f4a] text-white">
      {/* Decorative blur orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl"
      />

      {/* Top-right controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <div className="glass-card rounded-full">
          <LanguageToggle />
        </div>
        <div className="glass-card rounded-full">
          <ThemeToggle variant="dark-header" />
        </div>
      </div>

      {/* Subtle language hint chip (top-left) */}
      <div className="absolute top-5 left-5 z-20 hidden sm:flex glass-card rounded-full px-3 py-1.5 items-center gap-1.5 text-xs text-white/80">
        <Globe className="h-3.5 w-3.5 text-amber-300" />
        {lang === "fr" ? "Français" : "English"}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-white/40">
            <img
              src="/logo-2mails-transparent.png"
              alt="2mails.pro"
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle / message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-4 max-w-xl text-center text-base sm:text-lg text-white/80 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Countdown */}
        {data.endTime && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-10 w-full max-w-2xl"
          >
            {done ? (
              <div className="glass-card rounded-2xl px-6 py-8 text-center ring-1 ring-amber-300/40">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/20 ring-1 ring-amber-300/50">
                  <Clock className="h-6 w-6 text-amber-300" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-200">
                  {backLabel}
                </div>
              </div>
            ) : timeLeft ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {cards.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.35 + i * 0.08,
                      ease: "easeOut",
                    }}
                    className="glass-card rounded-2xl px-3 py-5 text-center ring-1 ring-amber-300/30"
                  >
                    <div
                      className="text-3xl sm:text-4xl md:text-5xl font-extrabold tabular-nums"
                      style={{
                        background:
                          "linear-gradient(180deg, #ffffff 0%, #fcd34d 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {String(c.value).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/70">
                      {c.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Contact + Login buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            asChild
            variant="outline"
            className="gap-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <a href="mailto:contact@2mails.pro">
              <Mail className="h-4 w-4" />
              {contactLabel}
            </a>
          </Button>
          <Button
            asChild
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md shadow-accent/20"
          >
            <a href="/login">
              <LogIn className="h-4 w-4" />
              {lang === "fr" ? "Connexion" : "Login"}
            </a>
          </Button>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-xs text-white/50"
        >
          2mails.pro — Dakar, Sénégal
        </motion.div>
      </div>
    </main>
  );
}
