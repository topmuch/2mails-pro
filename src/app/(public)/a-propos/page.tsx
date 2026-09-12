"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Globe2,
  Zap,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, Reveal } from "@/components/site/page-header";
import { PROCESS, WHY_US } from "@/lib/site-data";

export default function AProposPage() {
  return (
    <>
      <PageHeader
        badge="À propos de 2mails.pro"
        title="Le CRM SaaS pensé pour les équipes commerciales"
        subtitle="2mails.pro combine un CRM complet, une messagerie intégrée et des analytics en temps réel, dans un espace privé multi-tenant."
      />

      {/* Histoire / mission */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -top-4 -left-4 h-24 w-24 rounded-2xl bg-accent/20 -z-10" />
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-primary/10 -z-10" />
                <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-border bg-primary p-10 flex items-center justify-center h-[300px] sm:h-[460px]">
                  <img
                    src="/logo-2mails-transparent.png"
                    alt="Logo 2mails.pro"
                    className="h-40 sm:h-56 w-auto object-contain"
                  />
                </div>
                <div className="absolute -bottom-6 left-6 sm:left-10 bg-background rounded-xl shadow-lg ring-1 ring-border p-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      SaaS multi-tenant
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Disponible 24/7, FR / EN
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                  Notre mission
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Unifier CRM et messagerie pour les petites équipes
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  2mails.pro est né d&apos;un constat simple : les petites équipes
                  commerciales jonglent entre un CRM, une boîte email, un agenda
                  et un tableur. Résultat : des informations dispersées, des
                  échanges perdus, des opportunités oubliées.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Notre produit rassemble tout dans une seule interface :
                  clients, pipeline de ventes, messagerie IMAP / SMTP, tâches,
                  calendrier et statistiques. Chaque organisation dispose de
                  son propre espace privé, strictement isolé des autres.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Pensé comme un SaaS multi-tenant dès le départ, 2mails.pro
                  s&apos;adresse aux TPE, PME et équipes commerciales qui veulent
                  un outil moderne, rapide et abordable, sans la complexité
                  d&apos;un Salesforce ni le coût d&apos;un HubSpot.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <Link
                  href="/contact"
                  className="mt-6 group block rounded-xl bg-secondary/60 ring-1 ring-border p-4 hover:ring-accent/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                        <strong className="text-foreground">Envie d&apos;essayer 2mails.pro ?</strong>
                        {" — "}Démarrez gratuitement en 30 secondes, sans carte bancaire.
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
                        Créer un compte
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
              <Reveal delay={0.3}>
                <ul className="mt-7 space-y-3">
                  {[
                    "CRM, messagerie, tâches et calendrier au même endroit",
                    "Isolation multi-tenant : vos données sont privées",
                    "Bilingue français / anglais, thème clair / sombre",
                    "API REST et personnalisations par tenant",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Plateforme SaaS */}
      <section className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-gold opacity-40" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Reveal>
                <Badge className="mb-4 bg-white/10 text-white border border-white/20 hover:bg-white/15">
                  <Globe2 className="mr-1.5 h-3.5 w-3.5 text-accent" />
                  Plateforme SaaS
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Une architecture pensée pour la confiance
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed">
                  2mails.pro est conçu comme un SaaS multi-tenant : chaque
                  organisation dispose de son propre espace de travail, avec
                  ses clients, deals, tâches, emails et paramètres.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
                  Les rôles (admin, manager, agent) contrôlent les permissions
                  au sein de chaque tenant, et les invitations par email
                  expirent après 7 jours pour des raisons de sécurité.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, title: "Multi-tenant", desc: "Isolation stricte par organisation" },
                  { icon: ShieldCheck, title: "Sécurité", desc: "Mots de passe hachés, sessions httpOnly" },
                  { icon: Globe2, title: "Bilingue", desc: "Interface FR / EN native" },
                  { icon: Code2, title: "API REST", desc: "Intégrez 2mails.pro à vos outils" },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl p-5 bg-white/5 text-white ring-white/15 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                        Module
                      </span>
                      <c.icon className="h-4 w-4 opacity-70" />
                    </div>
                    <div className="mt-2 text-xl font-bold">{c.title}</div>
                    <div className="mt-1 text-xs text-white/70">{c.desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <Reveal>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                Process
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Démarrez en 4 étapes
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                De l&apos;inscription à votre premier deal dans le pipeline, 2mails.pro
                vous accompagne à chaque étape.
              </p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-border" />
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08}>
                <div className="relative bg-card rounded-2xl p-6 ring-1 ring-border hover:ring-accent/40 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg shadow-md relative z-10">
                      {p.step}
                    </div>
                    <ArrowRight className="h-5 w-5 text-accent hidden lg:block" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Atouts preview */}
      <section className="py-20 sm:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Reveal>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                Nos atouts
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Pourquoi choisir 2mails.pro
              </h2>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.06}>
                <Card className="h-full border-border/80 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="h-11 w-11 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <w.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {w.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {w.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild>
              <Link href="/register">
                Démarrer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-gold opacity-40" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Prêt à centraliser votre CRM et vos emails ?
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
              Créez votre organisation gratuitement, jusqu&apos;à 2 utilisateurs inclus.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
              <Link href="/register">
                Créer mon compte <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
