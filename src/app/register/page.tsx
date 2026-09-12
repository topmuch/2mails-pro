"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Mail, text: "Email & messagerie unifiées" },
  { icon: Users, text: "Clients, deals & équipe au même endroit" },
  { icon: ShieldCheck, text: "Données isolées par organisation" },
  { icon: Zap, text: "Démarrez gratuitement, jusqu'à 2 utilisateurs" },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0€",
    tagline: "Pour démarrer",
    features: ["2 utilisateurs", "Messagerie de base", "CRM essentiel"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "29€",
    tagline: "Pour grandir",
    features: ["10 utilisateurs", "Statistiques avancées", "Support prioritaire"],
    highlight: false,
  },
  {
    id: "business",
    name: "Business",
    price: "79€",
    tagline: "Pour scaler",
    features: ["Utilisateurs illimités", "Multi-domaines", "SLA dédié"],
    highlight: false,
  },
];

type InvitationInfo = {
  ok: boolean;
  email?: string;
  role?: string;
  tenantName?: string;
  error?: string;
};

function RegisterInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";

  const [tenantName, setTenantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");

  // Invitation state
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isInviteFlow = Boolean(inviteToken);

  // Fetch invitation details if a token is present
  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    setInviteLoading(true);
    fetch(`/api/invitations/verify?token=${encodeURIComponent(inviteToken)}`)
      .then(async (res) => {
        const json = (await res.json()) as InvitationInfo;
        if (cancelled) return;
        setInvitation(json);
        if (json.ok && json.email) {
          setEmail(json.email);
        } else {
          setInviteError(json.error || "Invitation invalide ou expirée.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInviteError("Impossible de vérifier l'invitation.");
        }
      })
      .finally(() => {
        if (!cancelled) setInviteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isInviteFlow && !tenantName.trim()) {
      toast({
        variant: "destructive",
        title: "Champ requis",
        description: "Veuillez renseigner le nom de votre organisation.",
      });
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop court",
        description: "Au moins 6 caractères requis.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mots de passe différents",
        description: "La confirmation ne correspond pas au mot de passe.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isInviteFlow
            ? {
                email: email.trim().toLowerCase(),
                password,
                name: name.trim(),
                inviteToken,
              }
            : {
                email: email.trim().toLowerCase(),
                password,
                name: name.trim(),
                tenantName: tenantName.trim(),
              },
        ),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Compte créé",
          description: `Bienvenue${json.user?.name ? `, ${json.user.name}` : ""} !`,
        });
        // Use full-page navigation so the new session cookie is picked up.
        window.location.href = "/dashboard";
      } else {
        toast({
          variant: "destructive",
          title: "Inscription échouée",
          description: json.error || "Impossible de créer le compte.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le compte. Réessayez.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding / visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f4a] via-[#0c1f4a]/95 to-[#0c1f4a]/80" />
        <div className="absolute inset-0 bg-dot-gold opacity-30" />

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-accent/20 text-accent px-3 py-1 text-xs font-semibold mb-5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              CRM SaaS Multi-tenant
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
            >
              CRM & Email Management pour votre organisation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-white/75 leading-relaxed"
            >
              Créez votre espace de travail en 30 secondes. Gérez vos clients,
              votre équipe, vos emails et vos statistiques depuis un seul
              tableau de bord.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 space-y-3"
            >
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-white/85">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-accent" />
                  </div>
                  {f.text}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>© {new Date().getFullYear()} 2mails.pro</span>
            <span>Powered by 2mails.pro</span>
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
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 relative z-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent-foreground px-3 py-1 text-xs font-semibold mb-4">
                {isInviteFlow ? (
                  <>
                    <Users className="h-3.5 w-3.5" />
                    Rejoindre une organisation
                  </>
                ) : (
                  <>
                    <Building2 className="h-3.5 w-3.5" />
                    Créer un compte
                  </>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {isInviteFlow ? "Accepter l'invitation" : "S'inscrire"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isInviteFlow
                  ? "Vous avez été invité à rejoindre une organisation sur 2mails.pro."
                  : "Démarrez gratuitement avec votre organisation sur 2mails.pro."}
              </p>
            </div>

            {/* Invitation banner */}
            {isInviteFlow && (
              <div className="mb-5">
                {inviteLoading && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-secondary/60 p-3.5 ring-1 ring-border">
                    <Loader2 className="h-4 w-4 text-accent mt-0.5 shrink-0 animate-spin" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Vérification de l'invitation en cours...
                    </p>
                  </div>
                )}
                {!inviteLoading && invitation?.ok && invitation.tenantName && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-emerald-500/10 p-3.5 ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground leading-relaxed">
                      Vous avez été invité à rejoindre{" "}
                      <strong className="font-semibold">{invitation.tenantName}</strong>
                      {invitation.role ? (
                        <>
                          {" "}en tant que{" "}
                          <span className="font-mono">{invitation.role}</span>
                        </>
                      ) : null}
                      . Renseignez votre nom et votre mot de passe pour finaliser.
                    </p>
                  </div>
                )}
                {!inviteLoading && inviteError && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3.5 ring-1 ring-destructive/30">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-medium text-destructive">Invitation invalide</p>
                      <p className="text-muted-foreground mt-0.5">{inviteError}</p>
                      <Link
                        href="/register"
                        className="inline-block mt-2 text-primary hover:underline font-medium"
                      >
                        Créer un nouveau compte →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Organization name — only for normal flow */}
              {!isInviteFlow && (
                <div className="space-y-2">
                  <Label htmlFor="tenantName" className="text-sm font-medium">
                    Nom de l&apos;organisation
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tenantName"
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Acme Inc."
                      className="pl-10 h-11"
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Votre nom
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="pl-10 h-11"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

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
                    placeholder="vous@entreprise.com"
                    className="pl-10 h-11"
                    autoComplete="email"
                    required
                    // For invitation flow, lock the email to the invitation's email
                    disabled={isInviteFlow && Boolean(invitation?.ok)}
                  />
                </div>
                {isInviteFlow && invitation?.ok && (
                  <p className="text-xs text-muted-foreground">
                    L&apos;email est fixé par l&apos;invitation.
                  </p>
                )}
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
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* Plan selector — only for normal flow (invited users inherit tenant plan) */}
              {!isInviteFlow && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Plan <span className="text-muted-foreground font-normal">(tous démarrent en Free)</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id)}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-all",
                          selectedPlan === p.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/50",
                        )}
                      >
                        <div className="text-xs font-semibold text-foreground">{p.name}</div>
                        <div className="text-sm font-bold text-accent mt-0.5">
                          {p.price}
                          <span className="text-[10px] text-muted-foreground font-normal">/mois</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous pourrez changer de plan à tout moment depuis votre tableau de bord.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (isInviteFlow && (inviteLoading || !invitation?.ok))}
                className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    {isInviteFlow ? "Rejoindre l'organisation" : "Créer mon compte"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-secondary/60 p-3.5 ring-1 ring-border">
              <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vos données sont isolées et sécurisées. Chaque organisation dispose
                de son propre espace privé.
              </p>
            </div>

            {/* Login link */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>

            {/* Features micro-list (mobile-only summary) */}
            <div className="lg:hidden mt-6 grid grid-cols-2 gap-2">
              {FEATURES.map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2 rounded-lg bg-secondary/40 p-2 ring-1 ring-border"
                >
                  <f.icon className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="text-[11px] text-muted-foreground leading-tight">{f.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
