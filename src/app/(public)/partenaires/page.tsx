"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Building2, Code2, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, Reveal } from "@/components/site/page-header";
import { PARTNERS } from "@/lib/site-data";

const BENEFITS = [
  { icon: Sparkles, text: "Connexion en quelques minutes, sans installation" },
  { icon: ShieldCheck, text: "Vos emails restent chez votre hébergeur (IMAP)" },
  { icon: Building2, text: "Compatible Gmail, Outlook, OVH, Infomaniak..." },
  { icon: Code2, text: "API REST pour vos intégrations personnalisées" },
];

export default function PartenairesPage() {
  return (
    <>
      <PageHeader
        badge="Intégrations & partenaires"
        title="Un écosystème ouvert et connecté"
        subtitle="2mails.pro se connecte à vos outils existants : fournisseurs d'email via IMAP/SMTP, API REST, et à venir des intégrations Zapier et Make."
      />

      {/* Partners / integrations grid */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:gap-10">
            {PARTNERS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <Card className="overflow-hidden border-border/80 hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Logo side */}
                      <div className="relative bg-secondary/40 flex items-center justify-center p-8 md:p-12 min-h-[280px]">
                        <div className="absolute inset-0 bg-grid-navy opacity-20" />
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg ring-1 ring-border w-full max-w-[240px] aspect-square flex items-center justify-center">
                          <img
                            src={p.logo}
                            alt={`Logo ${p.name}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Content side */}
                      <div className="md:col-span-2 p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">
                            <Globe2 className="mr-1.5 h-3.5 w-3.5" />
                            {p.role}
                          </Badge>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                          {p.name}
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                          {p.description}
                        </p>

                        {/* Benefits */}
                        <div className="mt-6 grid sm:grid-cols-2 gap-3">
                          {BENEFITS.map((b) => (
                            <div key={b.text} className="flex items-center gap-2.5 text-sm text-foreground/80">
                              <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                                <b.icon className="h-4 w-4 text-accent" />
                              </div>
                              {b.text}
                            </div>
                          ))}
                        </div>

                        <div className="mt-7">
                          <Button asChild>
                            <Link href="/register">
                              Démarrer gratuitement
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* ============ À venir ============ */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Bientôt disponible
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                  Intégrations à venir
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                  Nous travaillons à connecter 2mails.pro à votre stack
                  d&apos;outils existante. Voici ce qui est sur notre roadmap.
                </p>
              </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { name: "Zapier", desc: "Automatisations sans code" },
                { name: "Make", desc: "Workflows visuels" },
                { name: "Google Calendar", desc: "Sync d'agenda bidirectionnelle" },
                { name: "Webhooks", desc: "Événements en temps réel" },
              ].map((ref, i) => (
                <Reveal key={ref.name} delay={i * 0.06}>
                  <div className="group h-full flex flex-col items-center justify-center text-center rounded-2xl bg-card ring-1 ring-border hover:ring-accent/40 hover:shadow-lg transition-all p-6 hover:-translate-y-1">
                    <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                      <Code2 className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      {ref.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {ref.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Become a partner CTA */}
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-gold opacity-30" />
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Vous éditez un outil SaaS ?
                </h3>
                <p className="mt-3 text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Construisons ensemble une intégration native avec 2mails.pro.
                  Contactez notre équipe pour discuter partenariat technique.
                </p>
                <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/contact">
                    Devenir partenaire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
