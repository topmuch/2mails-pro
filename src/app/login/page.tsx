"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Globe2,
  Anchor,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

const HIGHLIGHTS = [
  { icon: Globe2, text: "Transit & logistique en Afrique de l'Ouest" },
  { icon: ShieldCheck, text: "Commissionnaire en douane agréé" },
  { icon: Anchor, text: "Transport maritime, aérien & multimodal" },
  { icon: Truck, text: "Solutions door-to-door sur mesure" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez saisir votre email et mot de passe.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue${json.user?.name ? `, ${json.user.name}` : ""} !`,
        });
        window.location.href = next;
      } else {
        toast({
          variant: "destructive",
          title: "Connexion échouée",
          description: json.error || "Identifiants incorrects.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se connecter. Réessayez.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding / visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          { }
          <img
            src="/hero-port.jpg"
            alt="Port de Dakar"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f4a] via-[#0c1f4a]/90 to-[#0c1f4a]/70" />
          <div className="absolute inset-0 bg-dot-gold opacity-30" />
        </div>

        {/* Decorative blurs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-foreground/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Logo + back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden bg-white p-2 shadow-lg">
                <img
                  src="/logo-2mails-transparent.png"
                  alt="Logo 2mails.pro"
                  className="h-20 w-auto sm:h-24 object-contain"
                />
              </div>
              <div className="text-xs text-white/60 uppercase tracking-widest">
                2mails.pro
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>
          </div>

          {/* Hero text */}
          <div className="max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
            >
              Votre partenaire logistique au cœur de l&apos;Afrique de l&apos;Ouest
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-white/75 leading-relaxed"
            >
              Espace d&apos;administration 2mails.pro. Gérez vos clients, votre équipe,
              vos statistiques et vos paramètres depuis un tableau de bord unifié.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 space-y-3"
            >
              {HIGHLIGHTS.map((h) => (
                <li key={h.text} className="flex items-center gap-3 text-sm text-white/85">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <h.icon className="h-4 w-4 text-accent" />
                  </div>
                  {h.text}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>© {new Date().getFullYear()} 2mails.pro — Dakar, Sénégal</span>
            <span>Depuis 2019</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Mobile decorative */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between p-5 relative z-10">
          <div className="rounded-xl overflow-hidden bg-white p-1.5 ring-1 ring-border shadow">
            <img
              src="/logo-2mails-transparent.png"
              alt="Logo 2mails.pro"
              className="h-16 w-auto object-contain"
            />
          </div>
          <ThemeToggle />
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent-foreground px-3 py-1 text-xs font-semibold mb-4">
                <Lock className="h-3.5 w-3.5" />
                Espace sécurisé
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Connexion
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Connectez-vous à votre espace d&apos;administration 2mails.pro.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@2mails.pro"
                    className="pl-10 h-11"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-secondary/60 p-3.5 ring-1 ring-border">
              <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accès réservé à l&apos;équipe 2mails.pro. Vos identifiants sont
                confidentiels et sécurisés.
              </p>
            </div>

            {/* Help link + Register link */}
            <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
              <p>
                <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                  Mot de passe oublié ?
                </Link>
              </p>
              <p className="border-t border-border pt-3">
                Pas encore de compte ?{" "}
                <Link href="/register" className="text-accent hover:underline font-semibold">
                  S&apos;inscrire
                  <ArrowRight className="inline-block ml-1 h-3.5 w-3.5 align-text-bottom" />
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
