"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Save,
  Globe,
  Search,
  Share2,
  BarChart3,
  Twitter,
  RefreshCw,
  CheckCircle2,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type SeoData = {
  id?: string;
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string | null;
  ogDescription: string | null;
  googleAnalyticsId: string | null;
  twitterHandle: string | null;
  updatedAt?: string;
};

const EMPTY: SeoData = {
  siteTitle: "",
  metaDescription: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  googleAnalyticsId: "",
  twitterHandle: "",
};

export default function SeoPage() {
  const { toast } = useToast();
  const [data, setData] = useState<SeoData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSeo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo");
      const json = await res.json();
      if (json.ok && json.data) setData(json.data);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Chargement impossible." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSeo();
  }, [fetchSeo]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data.siteTitle.trim() || !data.metaDescription.trim()) {
      toast({ variant: "destructive", title: "Champs requis", description: "Titre et méta-description requis." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Paramètres SEO enregistrés",
          description: "Les balises meta seront appliquées au site.",
        });
        fetchSeo();
      } else throw new Error(json.error);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  // Live preview helpers
  const titleLen = data.siteTitle.length;
  const descLen = data.metaDescription.length;
  const kwCount = data.keywords.split(",").map((k) => k.trim()).filter(Boolean).length;

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Paramètres SEO
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Optimisez le référencement du site 2mails.pro
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSeo}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Général */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-accent" />
              Balises générales
            </CardTitle>
            <CardDescription>Titre de page et méta-description affichés dans les résultats de recherche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="siteTitle">Titre du site (Title) *</Label>
                <Badge variant={titleLen > 60 ? "destructive" : "secondary"} className="text-xs">
                  {titleLen}/60
                </Badge>
              </div>
              <Input
                id="siteTitle"
                value={data.siteTitle}
                onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
                placeholder="2mails.pro | CRM SaaS — Gestion clients & équipe..."
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground">Idéalement entre 50 et 60 caractères.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaDescription">Méta-description *</Label>
                <Badge variant={descLen > 160 ? "destructive" : "secondary"} className="text-xs">
                  {descLen}/160
                </Badge>
              </div>
              <Textarea
                id="metaDescription"
                value={data.metaDescription}
                onChange={(e) => setData({ ...data, metaDescription: e.target.value })}
                rows={3}
                placeholder="Description du site affichée sous le titre dans Google..."
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">Idéalement entre 150 et 160 caractères.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="keywords">Mots-clés</Label>
                <Badge variant="secondary" className="text-xs">{kwCount} mot{kwCount > 1 ? "s" : ""}-clé{kwCount > 1 ? "s" : ""}</Badge>
              </div>
              <Textarea
                id="keywords"
                value={data.keywords}
                onChange={(e) => setData({ ...data, keywords: e.target.value })}
                rows={2}
                placeholder="transit Dakar, logistique Sénégal, freight forwarding..."
              />
              <p className="text-xs text-muted-foreground">Séparés par des virgules.</p>
            </div>
          </CardContent>
        </Card>

        {/* Open Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="h-5 w-5 text-accent" />
              Open Graph (partage réseaux sociaux)
            </CardTitle>
            <CardDescription>Titre et description affichés lors d'un partage sur Facebook, LinkedIn, WhatsApp...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ogTitle">Titre Open Graph</Label>
              <Input
                id="ogTitle"
                value={data.ogTitle || ""}
                onChange={(e) => setData({ ...data, ogTitle: e.target.value })}
                placeholder="2mails.pro | CRM SaaS — Tableau de bord unifié"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogDescription">Description Open Graph</Label>
              <Textarea
                id="ogDescription"
                value={data.ogDescription || ""}
                onChange={(e) => setData({ ...data, ogDescription: e.target.value })}
                rows={2}
                placeholder="Solutions sur mesure de transit, transport et logistique..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-accent" />
              Suivi & analytique
            </CardTitle>
            <CardDescription>Identifiants de suivi pour mesurer le trafic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga">Google Analytics ID</Label>
              <Input
                id="ga"
                value={data.googleAnalyticsId || ""}
                onChange={(e) => setData({ ...data, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX ou UA-XXXXXXXX-X"
              />
              <p className="text-xs text-muted-foreground">Trouvable dans votre compte Google Analytics.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-1.5">
                <Twitter className="h-3.5 w-3.5" />
                Compte Twitter / X
              </Label>
              <Input
                id="twitter"
                value={data.twitterHandle || ""}
                onChange={(e) => setData({ ...data, twitterHandle: e.target.value })}
                placeholder="@2mailspro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Aperçu Google */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-accent" />
              Aperçu dans Google
            </CardTitle>
            <CardDescription>Voici comment votre site pourrait apparaître dans les résultats de recherche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border p-4 bg-white">
              <div className="text-xs text-emerald-700 truncate">
                https://2mails.pro<span className="text-muted-foreground"> › accueil</span>
              </div>
              <div className="text-lg text-blue-700 hover:underline cursor-pointer mt-1 line-clamp-1">
                {data.siteTitle || "Titre du site — 2mails.pro"}
              </div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {data.metaDescription || "Méta-description du site apparaîtra ici..."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="sticky bottom-4 z-30">
          <Card className="shadow-lg ring-1 ring-border">
            <CardContent className="py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {data.updatedAt
                  ? `Dernière modification : ${new Date(data.updatedAt).toLocaleString("fr-FR")}`
                  : "Aucune modification enregistrée"}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => fetchSeo()} disabled={loading}>
                  Réinitialiser
                </Button>
                <Button type="submit" disabled={saving || loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Save className="mr-1.5 h-4 w-4" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </main>
  );
}
