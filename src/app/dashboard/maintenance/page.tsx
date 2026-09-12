"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wrench,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

type MaintenanceData = {
  enabled: boolean;
  messageFr: string;
  messageEn: string;
  endTime: string | null;
  updatedAt?: string;
};

const EMPTY: MaintenanceData = {
  enabled: false,
  messageFr: "",
  messageEn: "",
  endTime: null,
};

const DEFAULT_FR = "Site en maintenance. Nous serons de retour très bientôt.";
const DEFAULT_EN = "Site under maintenance. We will be back very soon.";

/**
 * Convert an ISO datetime string into a value usable by <input type="datetime-local">.
 * Returns "" when no value is set.
 */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function MaintenanceAdminPage() {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [data, setData] = useState<MaintenanceData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  // Local input string for the datetime-local field (preserves partial entry)
  const [endTimeInput, setEndTimeInput] = useState<string>("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance", { cache: "no-store" });
      const json = await res.json();
      if (json?.ok && json.data) {
        const next: MaintenanceData = {
          enabled: !!json.data.enabled,
          messageFr: json.data.messageFr ?? "",
          messageEn: json.data.messageEn ?? "",
          endTime: json.data.endTime ?? null,
          updatedAt: json.data.updatedAt,
        };
        setData(next);
        setEndTimeInput(toLocalInputValue(next.endTime));
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les réglages.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function onToggle(checked: boolean) {
    setToggling(true);
    const prev = data.enabled;
    // Optimistic update
    setData((d) => ({ ...d, enabled: checked }));
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: checked }),
      });
      const json = await res.json();
      if (json?.ok) {
        toast({
          title: checked
            ? "Maintenance activée"
            : "Maintenance désactivée",
          description: checked
            ? "Les visiteurs sont redirigés vers la page de maintenance."
            : "Le site est de nouveau accessible au public.",
        });
        if (json.data) {
          setData({
            enabled: !!json.data.enabled,
            messageFr: json.data.messageFr ?? data.messageFr,
            messageEn: json.data.messageEn ?? data.messageEn,
            endTime: json.data.endTime ?? null,
            updatedAt: json.data.updatedAt,
          });
          setEndTimeInput(toLocalInputValue(json.data.endTime ?? null));
        }
      } else {
        throw new Error(json?.error || "update failed");
      }
    } catch {
      // Revert on failure
      setData((d) => ({ ...d, enabled: prev }));
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le changement n'a pas pu être appliqué.",
      });
    } finally {
      setToggling(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data.messageFr.trim() || !data.messageEn.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Les messages FR et EN sont obligatoires.",
      });
      return;
    }
    setSaving(true);
    const payload = {
      enabled: data.enabled,
      messageFr: data.messageFr.trim(),
      messageEn: data.messageEn.trim(),
      endTime: endTimeInput
        ? new Date(endTimeInput).toISOString()
        : null,
    };
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.ok) {
        toast({
          title: "Réglages enregistrés",
          description: "La page de maintenance a été mise à jour.",
        });
        if (json.data) {
          setData({
            enabled: !!json.data.enabled,
            messageFr: json.data.messageFr,
            messageEn: json.data.messageEn,
            endTime: json.data.endTime ?? null,
            updatedAt: json.data.updatedAt,
          });
          setEndTimeInput(toLocalInputValue(json.data.endTime ?? null));
        }
      } else {
        throw new Error(json?.error || "save failed");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Enregistrement impossible.",
      });
    } finally {
      setSaving(false);
    }
  }

  const previewMessage = lang === "en" ? data.messageEn || DEFAULT_EN : data.messageFr || DEFAULT_FR;
  const previewTitle = lang === "en" ? "Maintenance in progress" : "Maintenance en cours";

  return (
    <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Maintenance
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mettre le site en maintenance et personnaliser le message public
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.enabled ? (
            <Badge variant="destructive" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Maintenance activée
            </Badge>
          ) : (
            <Badge className="gap-1.5 bg-emerald-500 text-white hover:bg-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Site actif
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Warning notice */}
      <div className="mb-6 rounded-lg border border-amber-300/60 bg-amber-50 p-4 flex items-start gap-3 dark:bg-amber-950/40">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 dark:text-amber-100">
          Quand la maintenance est activée, les visiteurs du site sont
          redirigés vers la page de maintenance. Le tableau de bord reste
          accessible aux administrateurs connectés.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-6 pb-28">
        {/* Enable / disable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-accent" />
              Mode maintenance
            </CardTitle>
            <CardDescription>
              Activez ou désactivez la page de maintenance en un clic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {data.enabled ? "Maintenance activée" : "Site actif"}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.enabled
                    ? "Les visiteurs voient la page de maintenance."
                    : "Le site public est accessible normalement."}
                </p>
              </div>
              <Switch
                checked={data.enabled}
                onCheckedChange={onToggle}
                disabled={toggling || loading}
                aria-label="Activer la maintenance"
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-accent" />
              Messages affichés
            </CardTitle>
            <CardDescription>
              Texte bilingue affiché sur la page de maintenance publique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messageFr" className="flex items-center gap-1.5">
                <span className="inline-flex h-5 px-1.5 items-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                  FR
                </span>
                Message en français
              </Label>
              <Textarea
                id="messageFr"
                value={data.messageFr}
                onChange={(e) =>
                  setData((d) => ({ ...d, messageFr: e.target.value }))
                }
                rows={3}
                placeholder={DEFAULT_FR}
              />
              <p className="text-xs text-muted-foreground">
                Affiché lorsque la langue du visiteur est le français.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageEn" className="flex items-center gap-1.5">
                <span className="inline-flex h-5 px-1.5 items-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                  EN
                </span>
                Message in English
              </Label>
              <Textarea
                id="messageEn"
                value={data.messageEn}
                onChange={(e) =>
                  setData((d) => ({ ...d, messageEn: e.target.value }))
                }
                rows={3}
                placeholder={DEFAULT_EN}
              />
              <p className="text-xs text-muted-foreground">
                Shown when the visitor&apos;s language is English.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* End time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-accent" />
              Fin de maintenance
            </CardTitle>
            <CardDescription>
              Date et heure de remise en service — un compte à rebours sera
              affiché sur la page publique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="endTime">Date & heure de fin</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTimeInput}
                onChange={(e) => setEndTimeInput(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Laisser vide pour ne pas afficher de compte à rebours.
              </p>
            </div>
            {endTimeInput && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Aperçu :{" "}
                <span className="font-medium text-foreground">
                  {new Date(endTimeInput).toLocaleString("fr-FR")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-accent" />
              Aperçu de la page publique
            </CardTitle>
            <CardDescription>
              Voici comment la page de maintenance apparaîtra aux visiteurs
              (langue actuelle : {lang.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl ring-1 ring-border">
              {/* Preview top bar */}
              <div className="flex items-center justify-between bg-[#0c1f4a] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/70">
                  <Globe className="h-3 w-3 text-amber-300" />
                  {lang === "fr" ? "Français" : "English"}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/70">
                  <Clock className="h-3 w-3 text-amber-300" />
                  {data.enabled ? "Maintenance" : "Site actif"}
                </div>
              </div>
              {/* Preview body */}
              <div className="bg-gradient-to-b from-[#0c1f4a] via-[#14306e] to-[#0c1f4a] px-5 py-8 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-lg bg-white p-1.5 shadow-lg">
                  <img
                    src="/logo-2mails-transparent.png"
                    alt="2mails.pro"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-base font-bold text-white">
                  {previewTitle}
                </div>
                <p className="mx-auto mt-2 max-w-sm text-xs text-white/80 leading-relaxed">
                  {previewMessage || (lang === "fr" ? DEFAULT_FR : DEFAULT_EN)}
                </p>
                {endTimeInput && (
                  <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] text-amber-200 ring-1 ring-amber-300/30">
                    <Clock className="h-3 w-3" />
                    {new Date(endTimeInput).toLocaleString("fr-FR")}
                  </div>
                )}
                <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[10px] text-white">
                  <MailIcon />
                  {lang === "fr" ? "Contactez-nous" : "Contact us"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sticky save bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {data.updatedAt
                ? `Dernière modification : ${new Date(data.updatedAt).toLocaleString("fr-FR")}`
                : "Aucune modification enregistrée"}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={fetchSettings}
                disabled={loading || saving}
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={saving || loading || toggling}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

// Small inline mail icon to avoid an extra lucide import just for the preview.
function MailIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
