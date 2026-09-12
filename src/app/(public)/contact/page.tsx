"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Building2,
  User,
  Calendar,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, Reveal } from "@/components/site/page-header";
import { COMPANY } from "@/lib/site-data";

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [prefTime, setPrefTime] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      subject: String(data.get("subject") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez renseigner votre nom, votre email et votre message.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      toast({
        title: "Message envoyé",
        description: "Merci ! Notre équipe vous répondra sous 24h ouvrées.",
      });
      form.reset();
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible d'envoyer le message. Écrivez-nous à ${COMPANY.email}.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function onBookingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("rdv-name") || "").trim(),
      email: String(data.get("rdv-email") || "").trim(),
      phone: String(data.get("rdv-phone") || "").trim(),
      company: String(data.get("rdv-company") || "").trim(),
      subject: String(data.get("rdv-subject") || "").trim(),
      preferredDate: String(data.get("rdv-date") || "").trim(),
      preferredTime: prefTime,
      message: String(data.get("rdv-message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez renseigner votre nom, votre email et votre message.",
      });
      return;
    }

    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      toast({
        title: "Demande envoyée",
        description: "Votre demande de rendez-vous a bien été transmise.",
      });
      form.reset();
      setPrefTime("");
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible d'envoyer la demande. Appelez-nous au ${COMPANY.phone}.`,
      });
    } finally {
      setBooking(false);
    }
  }

  return (
    <>
      <PageHeader
        badge="Contact"
        title="Parlons de votre CRM"
        subtitle="Une question, une démo, un projet ? Notre équipe vous répond sous 24h ouvrées."
      />

      <section className="py-20 sm:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Info */}
            <div>
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                  Coordonnées
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Comment nous joindre
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  2mails.pro est un service SaaS. Pour toute question sur
                  l&apos;inscription, la facturation ou le paramétrage de votre
                  CRM, contactez notre équipe support.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background ring-1 ring-border hover:ring-accent/40 transition-all group">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Adresse
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {COMPANY.addressLine1}
                        <br />
                        {COMPANY.addressLine2}, {COMPANY.city}, {COMPANY.country}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background ring-1 ring-border hover:ring-accent/40 transition-all group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Téléphone
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        <span className="block">{COMPANY.phone}</span>
                        <span className="block text-xs">{COMPANY.phoneSecondary}</span>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background ring-1 ring-border hover:ring-accent/40 transition-all group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Email
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {COMPANY.email}
                      </div>
                    </div>
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground">
                  <Clock className="h-5 w-5 text-accent shrink-0" />
                  <p className="text-sm">
                    Réponse sous 24h ouvrées — du lundi au vendredi, 9h–18h (CET).
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <Reveal delay={0.1}>
              <Card className="shadow-xl border-border/80">
                <CardHeader>
                  <CardTitle className="text-xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Décrivez votre projet ou votre question, nous vous répondons rapidement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Nom <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Votre nom"
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+33 ..."
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="vous@entreprise.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Démo, devis, support..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Décrivez votre besoin..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 mr-2 rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Demande de rendez-vous */}
      <section className="relative py-20 sm:py-28 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-dot-gold opacity-20" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Heading + benefits */}
            <Reveal>
              <Badge className="mb-4 bg-white/10 text-white border border-white/20 hover:bg-white/15">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                Démonstration
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Réservez une démo de 2mails.pro
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
                Découvrez 2mails.pro en 30 minutes : pipeline, clients,
                messagerie, analytics. Nous vous montrons comment configurer
                votre espace et inviter votre équipe.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Clock, text: "Démo personnalisée de 30 minutes" },
                  { icon: User, text: "Avec un produit expert" },
                  { icon: Building2, text: "Adaptée à votre secteur d'activité" },
                  { icon: Calendar, text: "Créneau au choix (visio)" },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ring-1 ring-white/10"
                  >
                    <div className="h-9 w-9 rounded-md bg-accent/20 flex items-center justify-center shrink-0">
                      <b.icon className="text-accent" style={{ width: "1.125rem", height: "1.125rem" }} />
                    </div>
                    <span className="text-sm sm:text-base text-white/90">{b.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={0.1}>
              <Card className="shadow-2xl border-border/80">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Réserver un créneau
                  </CardTitle>
                  <CardDescription>
                    Choisissez une date et un horaire, nous confirmerons par email.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onBookingSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-name">
                          Nom <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="rdv-name"
                          name="rdv-name"
                          placeholder="Votre nom"
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="rdv-email"
                          name="rdv-email"
                          type="email"
                          placeholder="vous@entreprise.com"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-phone">Téléphone</Label>
                        <Input
                          id="rdv-phone"
                          name="rdv-phone"
                          type="tel"
                          placeholder="+33 ..."
                          autoComplete="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-company">Organisation</Label>
                        <Input
                          id="rdv-company"
                          name="rdv-company"
                          placeholder="Acme Inc."
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rdv-subject">Sujet</Label>
                      <Input
                        id="rdv-subject"
                        name="rdv-subject"
                        placeholder="Démo CRM, paramétrage, etc."
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-date">Date souhaitée</Label>
                        <Input
                          id="rdv-date"
                          name="rdv-date"
                          type="date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-time">Créneau</Label>
                        <Select value={prefTime} onValueChange={setPrefTime}>
                          <SelectTrigger id="rdv-time">
                            <SelectValue placeholder="Choisir un horaire" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rdv-message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="rdv-message"
                        name="rdv-message"
                        rows={4}
                        placeholder="Votre besoin, votre secteur, votre équipe..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={booking}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                      size="lg"
                    >
                      {booking ? (
                        <>
                          <span className="h-4 w-4 mr-2 rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Réserver ma démo{" "}
                          <CalendarDays className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
