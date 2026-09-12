"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Mail,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Check,
  Building2,
  Globe2,
  Moon,
  Code2,
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

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const HERO_STATS = [
  { label: "Multi-tenant", icon: Building2 },
  { label: "FR / EN", icon: Globe2 },
  { label: "Dark mode", icon: Moon },
  { label: "API REST", icon: Code2 },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Pipeline de ventes",
    desc: "Tableau Kanban drag & drop pour suivre vos opportunités, de la prospection à la signature. Étapes personnalisables et prévisions de revenus.",
  },
  {
    icon: Users,
    title: "Gestion des clients",
    desc: "CRUD complet, fiche 360° avec timeline d'interactions, historique des échanges, pièces jointes et notes collaboratives.",
  },
  {
    icon: Mail,
    title: "Messagerie intégrée",
    desc: "Connexion IMAP / SMTP native. Réception, envoi et suivi des emails directement depuis le CRM — plus besoin de changer d'onglet.",
  },
  {
    icon: CheckSquare,
    title: "Tâches & rappels",
    desc: "Créez des tâches liées à un client ou un deal, fixez des échéances et recevez des rappels pour ne plus rien oublier.",
  },
  {
    icon: CalendarDays,
    title: "Calendrier & rendez-vous",
    desc: "Planifiez vos rendez-vous, visualisez votre agenda et synchronisez vos contacts clients en un coup d'œil.",
  },
  {
    icon: BarChart3,
    title: "Statistiques & analytics",
    desc: "Tableaux de bord en temps réel : taux de conversion, pipeline, activité email, performance commerciale par utilisateur.",
  },
];

const PRICING_PLANS = [
  {
    name: "Free",
    price: "0€",
    period: "/mois",
    description: "Pour découvrir 2mails.pro et tester le CRM.",
    features: [
      "1 organisation",
      "2 utilisateurs",
      "50 clients",
      "Pipeline de ventes",
      "Tâches & calendrier",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les petites équipes qui veulent passer à la vitesse supérieure.",
    features: [
      "1 organisation",
      "10 utilisateurs",
      "1 000 clients",
      "Messagerie IMAP / SMTP",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "99€",
    period: "/mois",
    description: "Pour les équipes structurées qui gèrent un volume important.",
    features: [
      "1 organisation",
      "50 utilisateurs",
      "Clients illimités",
      "Tout inclus",
      "API REST complète",
      "Support dédié",
    ],
    highlighted: false,
  },
];

/* -------------------------------------------------------------------------- */
/*  Reveal animation helper                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section
        id="accueil"
        className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#0c1f4a]"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-dot-gold opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1f4a] via-[#0c1f4a]/95 to-[#0c1f4a]" />

        {/* Floating decorative orbs */}
        <div className="absolute top-1/4 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-float hidden lg:block" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-accent/5 blur-3xl hidden md:block" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium text-white shimmer">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                CRM + Email Management SaaS
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Transformez votre gestion client avec{" "}
              <span className="text-gradient-gold">2mails.pro</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl"
            >
              CRM multi-tenant, messagerie intégrée, pipeline de ventes,
              tâches, calendrier et plus.
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
                <Link href="/register">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass-card text-white border-white/20 hover:bg-white/15 hover:text-white text-base h-12 px-7"
              >
                <a href="#tarifs">Voir les tarifs</a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl"
            >
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="glass-card rounded-lg px-4 py-3 flex items-center gap-2.5"
                >
                  <s.icon className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-medium text-white/90">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section
        id="fonctionnalites"
        className="relative py-20 sm:py-28 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-navy opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 border-accent/40 text-accent bg-accent/5"
            >
              Fonctionnalités
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient-navy">
              Tout ce qu'il faut pour gérer vos clients
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Une plateforme tout-en-un qui regroupe votre CRM, votre
              messagerie et vos outils commerciaux — pensée pour les équipes
              modernes.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <Card className="group h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-accent/40">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {f.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRICING ============================ */}
      <section
        id="tarifs"
        className="relative py-20 sm:py-28 overflow-hidden bg-secondary/40"
      >
        <div className="absolute inset-0 bg-dot-gold opacity-20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 border-accent/40 text-accent bg-accent/5"
            >
              Tarifs
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient-navy">
              Des offres adaptées à votre croissance
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Commencez gratuitement, évoluez quand vous êtes prêt. Sans
              engagement, résiliable à tout moment.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PRICING_PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1} className="h-full">
                <Card
                  className={`relative h-full flex flex-col ${
                    plan.highlighted
                      ? "border-accent border-2 shadow-xl glow-gold lg:scale-105"
                      : "hover:border-accent/40 hover:shadow-lg"
                  } transition-all duration-300`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-accent-foreground shadow-md px-3 py-1">
                        ★ Populaire
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1.5 min-h-[40px]">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                            <Check className="h-3 w-3 text-accent" />
                          </span>
                          <span className="text-foreground/90">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={`mt-8 w-full text-base h-11 ${
                        plan.highlighted
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg glow-gold"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link href="/register">
                        Commencer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-[#0c1f4a]">
        <div className="absolute inset-0 bg-dot-gold opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Prêt à transformer votre{" "}
              <span className="text-gradient-gold">gestion client</span> ?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Rejoignez les équipes qui gagnent du temps avec un CRM pensé pour
              la productivité. Créez votre compte en moins de 2 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-9 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 glow-gold text-base h-12 px-8"
              >
                <Link href="/register">
                  Créer un compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
