import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SERVICES } from "@/lib/site-data";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) {
    return { title: "Service introuvable — 2mails.pro" };
  }
  return {
    title: `${service.title} — 2mails.pro Dakar`,
    description: service.desc,
    openGraph: {
      title: `${service.title} — 2mails.pro`,
      description: service.desc,
    },
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) {
    notFound();
  }

  const currentIndex = SERVICES.findIndex((s) => s.slug === slug);
  const nextService = SERVICES[(currentIndex + 1) % SERVICES.length];
  const Icon = service.icon;

  return (
    <>
      {/* Hero du service */}
      <section className="relative pt-32 sm:pt-36 pb-16 sm:pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          { }
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f4a]/90 via-[#0c1f4a]/80 to-[#0c1f4a]/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Tous les services
          </Link>
          <div className="max-w-3xl">
            <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-5 ring-1 ring-accent/30">
              <Icon className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {service.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed">
              {service.desc}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                <Link href="/contact">
                  Demander un devis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                <a href="tel:+221338211131">
                  <Phone className="mr-2 h-4 w-4" />
                  +221 33 821 11 31
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Description longue */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            <div className="lg:col-span-2">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                Présentation
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Une expertise complète au service de vos opérations
              </h2>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {service.longDesc}
              </p>

              {/* Features */}
              <h3 className="mt-10 text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                Ce que nous offrons
              </h3>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {service.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-3 p-4 rounded-xl bg-secondary/60 ring-1 ring-border"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/90">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar : highlights + contact */}
            <aside className="space-y-5">
              <Card className="ring-1 ring-border">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Points forts
                  </h3>
                  <div className="space-y-4">
                    {service.highlights.map((h) => (
                      <div key={h.title} className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                          <Sparkles className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {h.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {h.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground ring-1 ring-primary">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Pourquoi 2mails.pro
                  </h3>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-center gap-2 text-white/85">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      Commissionnaire en douane agréé
                    </li>
                    <li className="flex items-center gap-2 text-white/85">
                      <Clock className="h-4 w-4 text-accent shrink-0" />
                      Équipes 5–20 ans d&apos;expérience
                    </li>
                    <li className="flex items-center gap-2 text-white/85">
                      <Sparkles className="h-4 w-4 text-accent shrink-0" />
                      Approche proactive et sur mesure
                    </li>
                  </ul>
                  <div className="mt-5 pt-5 border-t border-white/15 space-y-2">
                    <a
                      href="tel:+221338211131"
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors"
                    >
                      <Phone className="h-4 w-4 text-accent" />
                      +221 33 821 11 31
                    </a>
                    <a
                      href="mailto:contact@2mails.pro"
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors"
                    >
                      <Mail className="h-4 w-4 text-accent" />
                      contact@2mails.pro
                    </a>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* Autres services */}
      <section className="py-16 sm:py-20 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                Continuer l'exploration
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Autres services
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/services">
                Voir tous <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.filter((s) => s.slug !== slug).slice(0, 4).map((s) => {
              const SIcon = s.icon;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group bg-card rounded-xl ring-1 ring-border hover:ring-accent/40 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="relative h-32 overflow-hidden">
                    { }
                    <img
                      src={s.image}
                      alt={s.title}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f4a]/80 to-transparent" />
                    <div className="absolute top-3 left-3 h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center">
                      <SIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {s.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Next service CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Service suivant
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href={`/services/${nextService.slug}`}>
                {nextService.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-gold opacity-40" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Besoin de ce service ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
            Contactez nos équipes pour une solution sur mesure adaptée à votre
            activité. Devis gratuit sous 24h ouvrées.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
              <Link href="/contact">
                Demander un devis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <a href="mailto:contact@2mails.pro">
                <Mail className="mr-2 h-4 w-4" />
                contact@2mails.pro
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
