"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  Globe2,
  Clock,
  Users,
  Route,
  Ship,
  Plane,
  Truck,
  Sparkles,
  HandshakeIcon,
  Star,
  Quote,
  MapPin,
  Phone,
  Anchor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  STATS,
  SERVICES,
  SERVICE_HIGHLIGHTS,
  COUNTRIES,
} from "@/lib/site-data";
import { useLanguage } from "@/lib/i18n";

const TRUST_ITEMS = [
  "Transit & Commissionnaire en Douane agréé",
  "Transport Aérien • Maritime • Routier • Multimodal",
  "Entreposage sous douane",
  "Door-to-door vers l'Afrique de l'Ouest",
];

const WHY_CHOOSE = [
  {
    icon: Sparkles,
    title: "Approche proactive",
    desc: "Une solution sur mesure à chaque client, de l'origine jusqu'à la destination finale.",
  },
  {
    icon: ShieldCheck,
    title: "Agréé en douane",
    desc: "Établissement de Transit et commissionnaire en Douane agréé, conformité garantie.",
  },
  {
    icon: Users,
    title: "Équipes confirmées",
    desc: "Des collaborateurs qualifiés capitalisant entre 5 et 20 ans d'expérience.",
  },
  {
    icon: HandshakeIcon,
    title: "Sous-traitants agréés",
    desc: "Partenaires validés selon des cahiers des charges avec obligations de part et d'autre.",
  },
];

const PROCESS_STEPS = [
  { num: "01", title: "Prise en charge", desc: "Analyse & solution sur mesure" },
  { num: "02", title: "Transit & Dédouanement", desc: "Formalités douanières agréées" },
  { num: "03", title: "Transport & Manutention", desc: "Acheminement multimodal" },
  { num: "04", title: "Livraison finale", desc: "Door-to-door confirmé" },
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  return (
    <>
      {/* ============ HERO PREMIUM ============ */}
      <section
        id="accueil"
        className="relative min-h-[72vh] sm:min-h-[640px] flex items-center overflow-hidden"
      >
        {/* Background image + overlays */}
        <div className="absolute inset-0">
          { }
          <img
            src="/hero-port.jpg"
            alt="Port de Dakar — logistique et transport maritime"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 bg-grid-navy opacity-20" />
        </div>

        {/* Decorative floating orb */}
        <div className="absolute top-1/4 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-float hidden lg:block" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium text-white shimmer">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                {t("hero.badge")}
                <span className="mx-1 h-1 w-1 rounded-full bg-accent" />
                {t("hero.badge.location")}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight"
            >
              {t("hero.title1")}
              <br />
              {t("hero.title2")}
              <br />
              {t("hero.title3")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl"
            >
              {t("hero.desc")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 glow-gold text-base h-12 px-7"
              >
                <Link href="/services">
                  {t("hero.cta1")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="glass-card text-white border-white/20 hover:bg-white/15 hover:text-white text-base h-12 px-7"
              >
                <Link href="/contact">
                  {t("hero.cta2")}
                </Link>
              </Button>
            </motion.div>

            {/* Premium stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl"
            >
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="glass-card rounded-xl p-3 sm:p-4 text-center"
                >
                  <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto mb-1.5" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-xs text-white/70 leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="relative border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
            {TRUST_ITEMS.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {t(`trust.${idx + 1}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT PREMIUM ============ */}
      <section className="relative py-24 sm:py-32 bg-background overflow-hidden">
        <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Visual side */}
            <Reveal>
              <div className="relative">
                {/* Main image */}
                <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border">
                  { }
                  <img
                    src="/warehouse.jpg"
                    alt="Entreposage et logistique 2mails.pro"
                    className="w-full h-[360px] sm:h-[500px] object-cover"
                  />
                </div>
                {/* Floating badge top-left */}
                <div className="absolute -top-5 -left-5 bg-background rounded-2xl shadow-xl ring-1 ring-border p-4 flex items-center gap-3 animate-float">
                  <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Depuis</div>
                    <div className="text-base font-bold text-foreground">Janvier 2019</div>
                  </div>
                </div>
                {/* Floating badge bottom-right */}
                <div className="absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-2xl shadow-xl p-5 max-w-[200px] animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe2 className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Couverture</span>
                  </div>
                  <div className="text-2xl font-extrabold">6 pays</div>
                  <div className="text-xs text-white/70 mt-0.5">Afrique de l&apos;Ouest</div>
                </div>
              </div>
            </Reveal>

            {/* Text side */}
            <div>
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {t("about.badge")}
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {t("about.title1")}
                  <span className="text-gradient-gold">{t("about.title2")}</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t("about.desc1.pre")}
                  <strong className="text-foreground">
                    2mails.pro
                  </strong>
                  {t("about.desc1.post")}
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t("about.desc2")}
                </p>
              </Reveal>

              {/* Mini stats */}
              <Reveal delay={0.2}>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="border-l-2 border-accent pl-3">
                    <div className="text-2xl font-extrabold text-foreground">5–20</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("about.ministat1")}</div>
                  </div>
                  <div className="border-l-2 border-accent pl-3">
                    <div className="text-2xl font-extrabold text-foreground">11</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("about.ministat2")}</div>
                  </div>
                  <div className="border-l-2 border-accent pl-3">
                    <div className="text-2xl font-extrabold text-foreground">100%</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("about.ministat3")}</div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-8">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/a-propos">
                      {t("about.cta")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES PREMIUM ============ */}
      <section className="relative py-24 sm:py-32 bg-secondary/40 overflow-hidden">
        <div className="absolute inset-0 bg-grid-navy opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* Section header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <Reveal>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                {t("section.services")}
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                {t("section.servicesTitle1")}
                <span className="text-gradient-gold">{t("section.servicesTitle2")}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground">
                {t("section.servicesDesc")}
              </p>
            </Reveal>
          </div>

          {/* Services grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.slice(0, 4).map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <Link href={`/services/${s.slug}`} className="group block h-full">
                  <Card className="group h-full overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 border-border/60 hover:border-accent/50 p-0 cursor-pointer bg-card">
                    <div className="relative h-44 overflow-hidden">
                      { }
                      <img
                        src={s.image}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f4a] via-[#0c1f4a]/40 to-transparent" />
                      {/* Floating icon */}
                      <div className="absolute top-3 right-3 h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-accent group-hover:scale-110 transition-all">
                        <s.icon className="h-5 w-5 text-primary group-hover:text-accent-foreground transition-colors" />
                      </div>
                    </div>
                    <CardHeader className="pt-5">
                      <CardTitle className="text-lg group-hover:text-accent transition-colors">{s.title}</CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed line-clamp-3">
                        {s.desc}
                      </CardDescription>
                      <div className="pt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        En savoir plus
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Image highlights (3 large) */}
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {SERVICE_HIGHLIGHTS.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <Link href="/services" className="group relative block overflow-hidden rounded-3xl ring-1 ring-border h-64 hover:ring-accent/50 transition-all">
                  { }
                  <img
                    src={c.img}
                    alt={c.title}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f4a] via-[#0c1f4a]/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                      {c.sub}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {c.title}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent transition-colors">
                    <ArrowUpRight className="h-4 w-4 text-white group-hover:text-accent-foreground transition-colors" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-gold text-base h-12 px-7">
              <Link href="/services">
                {t("section.servicesCta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ PROCESS PREMIUM ============ */}
      <section className="relative py-24 sm:py-32 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-dot-gold opacity-30" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <Reveal>
              <Badge className="mb-4 bg-white/10 text-white border border-white/20 hover:bg-white/15">
                {t("section.process")}
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {t("section.processTitle")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed">
                {t("section.processDesc")}
              </p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.08}>
                <div className="relative glass-card rounded-2xl p-6 hover:bg-white/15 transition-all h-full group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-5xl font-extrabold text-accent/80 group-hover:text-accent transition-colors">
                      {p.num}
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-white/30 hidden lg:block" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {t(`process.${i + 1}`)}
                  </h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    {t(`process.${i + 1}.desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: sticky title */}
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                  {t("section.whyUs")}
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {t("section.whyUsTitle1")}
                  <span className="text-gradient-gold">{t("section.whyUsTitle2")}</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t("section.whyUsDesc")}
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-7">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/atouts">
                      {t("section.whyUsCta")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Right: cards grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {WHY_CHOOSE.map((w, i) => (
                <Reveal key={w.title} delay={i * 0.06}>
                  <Card className="h-full border-border/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-accent/40">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                        <w.icon className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {t(`whyus.${i}.title`)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {t(`whyus.${i}.desc`)}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ COUNTRIES ============ */}
      <section className="py-20 sm:py-24 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Reveal>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                <Globe2 className="mr-1.5 h-3.5 w-3.5" />
                {t("section.coverage")}
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {t("section.coverageTitle")}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {COUNTRIES.map((c) => (
                <div
                  key={c.name}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium ring-1 transition-all hover:scale-105 ${
                    c.base
                      ? "bg-accent text-accent-foreground ring-accent/40 shadow-md"
                      : "bg-background text-foreground/80 ring-border hover:ring-accent/40"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {c.name}
                    {c.base && <span className="text-[10px] uppercase tracking-wide opacity-80">{t("country.base")}</span>}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA PREMIUM ============ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f4a] via-[#0c1f4a] to-[#1a2f5a]" />
        <div className="absolute inset-0 bg-dot-gold opacity-25" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium text-white mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Devis gratuit sous 24h ouvrées
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t("section.ctaTitle1")}
              <br />
              {t("section.ctaTitle2")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              {t("section.ctaDesc")}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg glow-gold text-base h-12 px-8">
                <Link href="/contact">
                  {t("section.ctaBtn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="glass-card text-white border-white/20 hover:bg-white/15 hover:text-white text-base h-12 px-8">
                <a href="tel:+221338211131">
                  <Phone className="mr-2 h-4 w-4" />
                  {t("section.ctaCall")}: +221 33 821 11 31
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
