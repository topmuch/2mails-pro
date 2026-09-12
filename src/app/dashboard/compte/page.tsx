"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  CreditCard,
  Users,
  TrendingUp,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AccountData = {
  id: string;
  name: string;
  domain: string | null;
  plan: string;
  status: string;
  maxUsers: number;
  currentUsers: number;
  currentClients: number;
  currentDeals: number;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/*  Plan config                                                        */
/* ------------------------------------------------------------------ */

const PLANS: Record<
  string,
  { label: string; maxUsers: number; price: string; features: string[] }
> = {
  free: {
    label: "Free",
    maxUsers: 2,
    price: "Gratuit",
    features: ["2 utilisateurs", "Clients illimités", "Pipeline de base", "Support communautaire"],
  },
  pro: {
    label: "Pro",
    maxUsers: 10,
    price: "29 €/mois",
    features: [
      "10 utilisateurs",
      "Clients & deals illimités",
      "Pipeline avancé",
      "Statistiques détaillées",
      "Support prioritaire",
    ],
  },
  business: {
    label: "Business",
    maxUsers: 50,
    price: "99 €/mois",
    features: [
      "50 utilisateurs",
      "Tout le plan Pro",
      "Domaine personnalisé",
      "Multi-tenant avancé",
      "Support dédié 24/7",
    ],
  },
};

const PLAN_ORDER = ["free", "pro", "business"];

function planLabel(plan: string) {
  return PLANS[plan]?.label || plan;
}

function planBadgeClass(plan: string) {
  const p = (plan || "").toLowerCase();
  if (p === "business") {
    return "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
  }
  if (p === "pro") {
    return "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  }
  return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function statusBadgeClass(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active") {
    return "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }
  if (s === "suspended") {
    return "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
  if (s === "cancelled") {
    return "border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  }
  return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function statusLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "Actif";
  if (s === "suspended") return "Suspendu";
  if (s === "cancelled") return "Annulé";
  return status || "—";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ComptePage() {
  const { toast } = useToast();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    plan: "free",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account");
      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data);
        setForm({
          name: json.data.name || "",
          domain: json.data.domain || "",
          plan: json.data.plan || "free",
        });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Chargement impossible." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const dirty =
    !!data &&
    (form.name !== (data.name || "") ||
      form.domain !== (data.domain || "") ||
      form.plan !== (data.plan || "free"));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Nom requis", description: "Le nom de l'organisation est obligatoire." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          domain: form.domain,
          plan: form.plan,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Compte mis à jour",
          description: "Les modifications ont été enregistrées.",
        });
        fetchAccount();
      } else {
        throw new Error(json.error || "Erreur");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Enregistrement impossible",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    } finally {
      setSaving(false);
    }
  }

  function selectPlan(plan: string) {
    setForm((f) => ({ ...f, plan }));
  }

  const maxUsers = data?.maxUsers ?? PLANS[form.plan]?.maxUsers ?? 0;
  const userPercent = maxUsers > 0 ? Math.min(100, (data?.currentUsers ?? 0 / maxUsers) * 100) : 0;

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Paramètres du compte
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gérez votre organisation, votre abonnement et votre utilisation
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAccount} title="Actualiser">
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {loading || !data ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <form onSubmit={onSave} className="space-y-6">
          {/* Organisation card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Organisation
                </CardTitle>
                <CardDescription>
                  Informations générales de votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Nom de l&apos;organisation *</Label>
                    <Input
                      id="org-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Mon entreprise"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-domain">Domaine personnalisé</Label>
                    <Input
                      id="org-domain"
                      value={form.domain}
                      onChange={(e) => setForm({ ...form, domain: e.target.value })}
                      placeholder="monentreprise.2mails.pro"
                    />
                    <p className="text-xs text-muted-foreground">
                      Laisser vide si aucun domaine personnalisé.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm text-muted-foreground">Statut :</span>
                  <Badge variant="outline" className={statusBadgeClass(data.status)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {statusLabel(data.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Abonnement &amp; plan
                </CardTitle>
                <CardDescription>
                  Comparez les offres et changez de plan à tout moment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Plan actuel :</span>
                  <Badge variant="outline" className={planBadgeClass(data.plan)}>
                    {planLabel(data.plan)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {PLANS[data.plan]?.price}
                  </span>
                </div>

                {/* Features comparison */}
                <div className="grid sm:grid-cols-3 gap-3">
                  {PLAN_ORDER.map((p) => {
                    const plan = PLANS[p];
                    const isActive = data.plan === p;
                    const isSelected = form.plan === p;
                    return (
                      <div
                        key={p}
                        className={`relative rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">{plan.label}</span>
                          {isActive && (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Actuel
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-accent mb-3">{plan.price}</p>
                        <ul className="space-y-1.5 mb-4">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          type="button"
                          size="sm"
                          variant={isActive ? "outline" : "default"}
                          className="w-full"
                          disabled={isActive}
                          onClick={() => selectPlan(p)}
                        >
                          {isActive ? "Plan actuel" : isSelected ? "Sélectionné" : "Choisir"}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Select plan (fallback) */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="plan-select">Changer de plan</Label>
                    <Select value={form.plan} onValueChange={(v) => selectPlan(v)}>
                      <SelectTrigger id="plan-select" className="w-full">
                        <SelectValue placeholder="Sélectionner un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_ORDER.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PLANS[p].label} — {PLANS[p].price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground">
                      Le changement de plan ajustera automatiquement la limite
                      d&apos;utilisateurs ({PLANS[form.plan]?.maxUsers} utilisateurs max).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Utilisation
                </CardTitle>
                <CardDescription>
                  Statistiques de consommation de votre espace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Users usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Utilisateurs
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{data.currentUsers}</span>
                      {" / "}
                      {maxUsers}
                    </span>
                  </div>
                  <Progress value={userPercent} className="h-2" />
                </div>

                {/* Clients & Deals counts */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      Clients
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">
                      {data.currentClients}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Deals
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">
                      {data.currentDeals}
                    </p>
                  </div>
                </div>

                {/* Created date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <Calendar className="h-4 w-4" />
                  Compte créé le{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(data.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-red-200 dark:border-red-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/30 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-red-700 dark:text-red-300">
                      Supprimer le compte
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                      Cette action supprimera définitivement l&apos;organisation, les
                      utilisateurs, les clients et toutes les données associées.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmDelete((v) => !v)}
                  >
                    <AlertTriangle className="mr-1.5 h-4 w-4" />
                    Supprimer le compte
                  </Button>
                </div>
                {confirmDelete && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg border border-amber-200 dark:border-amber-950 bg-amber-50 dark:bg-amber-950/30 p-4"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-semibold mb-1">Confirmation requise</p>
                        <p>
                          La suppression définitive n&apos;est pas encore disponible dans
                          cette version. Pour supprimer votre compte et toutes ses
                          données, contactez le support à{" "}
                          <a
                            href="mailto:support@2mails.pro"
                            className="font-medium underline"
                          >
                            support@2mails.pro
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Fermer
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sticky save bar */}
          <div className="sticky bottom-4 z-30">
            <Card className="shadow-lg ring-1 ring-border">
              <CardContent className="py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className={`h-4 w-4 ${dirty ? "text-amber-500" : "text-emerald-500"}`} />
                  {dirty
                    ? "Modifications non enregistrées"
                    : `Plan ${planLabel(data.plan)} · ${data.currentUsers}/${maxUsers} utilisateurs`}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        name: data.name || "",
                        domain: data.domain || "",
                        plan: data.plan || "free",
                      })
                    }
                    disabled={!dirty || saving}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !dirty}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </main>
  );
}
