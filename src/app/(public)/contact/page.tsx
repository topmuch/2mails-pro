"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Languages,
  Send,
  Navigation,
  ExternalLink,
  CalendarDays,
  Clock,
  Building2,
  User,
  Calendar,
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
import { useLanguage } from "@/lib/i18n";
import { COMPANY } from "@/lib/site-data";

export default function ContactPage() {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

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
        title: t("contact.requiredTitle"),
        description: t("contact.requiredDesc"),
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
        title: t("contact.success"),
        description: t("contact.successDesc"),
      });
      form.reset();
    } catch {
      toast({
        variant: "destructive",
        title: t("contact.error"),
        description:
          `${t("contact.errorDesc")}${t("contact.errorEmailSuffix")}${COMPANY.email}.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const [booking, setBooking] = useState(false);
  const [prefTime, setPrefTime] = useState("");

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
        title: t("contact.requiredTitle"),
        description: t("contact.requiredDesc"),
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
        title: t("contact.rdvSuccess"),
        description: t("contact.rdvSuccessDesc"),
      });
      form.reset();
      setPrefTime("");
    } catch {
      toast({
        variant: "destructive",
        title: t("contact.error"),
        description:
          `${t("contact.errorDesc")}${t("contact.errorPhoneSuffix")}${COMPANY.phone}.`,
      });
    } finally {
      setBooking(false);
    }
  }

  return (
    <>
      <PageHeader
        badge={t("contact.badge")}
        title={t("contact.title")}
        subtitle={t("contact.desc")}
      />

      <section className="py-20 sm:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Info */}
            <div>
              <Reveal>
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                  {t("contact.coords.badge")}
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {t("contact.coords.title")}
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t("contact.coords.desc")}
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 space-y-4">
                  <a
                    href="https://maps.google.com/?q=Immeuble+Kalimo+Consulting+Group+SICAP+Liberté+1+Dakar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-xl bg-background ring-1 ring-border hover:ring-accent/40 transition-all group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {t("contact.address.label")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {COMPANY.addressLine1}
                        <br />
                        {COMPANY.addressLine2}, {COMPANY.city}, {COMPANY.country}
                      </div>
                    </div>
                  </a>

                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background ring-1 ring-border hover:ring-accent/40 transition-all group"
                  >
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {t("contact.phone")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        <a href={`tel:${COMPANY.phoneHref}`} className="hover:text-accent transition-colors block">
                          {COMPANY.phone}
                        </a>
                        <a href={`tel:${COMPANY.phoneSecondaryHref}`} className="hover:text-accent transition-colors block text-xs">
                          {COMPANY.phoneSecondary}
                        </a>
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
                        {t("contact.email")}
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
                  <Languages className="h-5 w-5 text-accent shrink-0" />
                  <p className="text-sm">
                    {t("contact.bilingual")}
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <Reveal delay={0.1}>
              <Card className="shadow-xl border-border/80">
                <CardHeader>
                  <CardTitle className="text-xl">{t("contact.formTitle")}</CardTitle>
                  <CardDescription>
                    {t("contact.formDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {t("contact.name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder={t("contact.placeholder.name")}
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("contact.phone")}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+221 ..."
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t("contact.email")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t("contact.subject")}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder={t("contact.placeholder.subject")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t("contact.message")} <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder={t("contact.placeholder.message")}
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
                          {t("contact.sending")}
                        </>
                      ) : (
                        <>
                          {t("contact.send")} <Send className="ml-2 h-4 w-4" />
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
                {t("contact.rdvBadge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t("contact.rdv")}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
                {t("contact.rdvIntro")}
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Clock, text: t("contact.rdvBenefit1") },
                  { icon: User, text: t("contact.rdvBenefit2") },
                  { icon: Building2, text: t("contact.rdvBenefit3") },
                  { icon: Calendar, text: t("contact.rdvBenefit4") },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ring-1 ring-white/10"
                  >
                    <div className="h-9 w-9 rounded-md bg-accent/20 flex items-center justify-center shrink-0">
                      <b.icon className="h-4.5 w-4.5 text-accent" style={{ width: "1.125rem", height: "1.125rem" }} />
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
                    {t("contact.rdvTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("contact.rdvCardDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onBookingSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-name">
                          {t("contact.name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="rdv-name"
                          name="rdv-name"
                          placeholder={t("contact.placeholder.name")}
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-email">
                          {t("contact.email")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="rdv-email"
                          name="rdv-email"
                          type="email"
                          placeholder="vous@exemple.com"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-phone">{t("contact.phone")}</Label>
                        <Input
                          id="rdv-phone"
                          name="rdv-phone"
                          type="tel"
                          placeholder="+221 ..."
                          autoComplete="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-company">{t("contact.company")}</Label>
                        <Input
                          id="rdv-company"
                          name="rdv-company"
                          placeholder={t("contact.placeholder.company")}
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rdv-subject">{t("contact.subject")}</Label>
                      <Input
                        id="rdv-subject"
                        name="rdv-subject"
                        placeholder={t("contact.placeholder.rdvSubject")}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rdv-date">{t("contact.rdvDate")}</Label>
                        <Input
                          id="rdv-date"
                          name="rdv-date"
                          type="date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdv-time">{t("contact.rdvTime")}</Label>
                        <Select value={prefTime} onValueChange={setPrefTime}>
                          <SelectTrigger id="rdv-time">
                            <SelectValue placeholder={t("contact.placeholder.timeslot")} />
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
                        {t("contact.message")} <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="rdv-message"
                        name="rdv-message"
                        rows={4}
                        placeholder={t("contact.placeholder.rdvMessage")}
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
                          {t("contact.sending")}
                        </>
                      ) : (
                        <>
                          {t("contact.rdvBtn")}{" "}
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

      {/* Carte & itinéraire */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <Navigation className="mr-1.5 h-3.5 w-3.5" />
                {t("contact.findUs")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {t("contact.address")}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("contact.addressDesc")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Carte interactive */}
              <div className="lg:col-span-2">
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-border shadow-lg h-[380px] sm:h-[460px] bg-secondary">
                  <iframe
                    title={t("contact.mapTitle")}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-17.4680%2C14.6880%2C-17.4280%2C14.7080&layer=mapnik&marker=14.6980%2C-17.4480"
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-md ring-1 ring-border px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <MapPin className="h-4 w-4 text-accent" />
                      2mails.pro
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {COMPANY.addressLine1}<br />
                      {COMPANY.addressLine2}, {COMPANY.city}, {COMPANY.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Itinéraire & infos */}
              <div className="space-y-4">
                <Card className="ring-1 ring-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                        <Navigation className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {t("contact.itinerary")}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {t("contact.itineraryDesc")}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=Immeuble+Kalimo+Consulting+Group+SICAP+Liberté+1+Dakar+Sénégal"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        {t("contact.googleMaps")}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      <a
                        href="https://www.openstreetmap.org/?mlat=14.6980&mlon=-17.4480#map=16/14.6980/-17.4480"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {t("contact.openStreet")}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="ring-1 ring-border bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      {t("contact.gps")}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">{t("contact.latitude")}</span>
                        <span className="font-mono font-medium">14.6980° N</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">{t("contact.longitude")}</span>
                        <span className="font-mono font-medium">17.4480° W</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/15">
                      <p className="text-xs text-white/70 leading-relaxed">
                        {t("contact.gpsNote")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
