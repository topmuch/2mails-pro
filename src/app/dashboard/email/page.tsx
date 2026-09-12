"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Mail,
  Save,
  RefreshCw,
  CheckCircle2,
  Server,
  ShieldAlert,
  Inbox,
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type EmailSettings = {
  id?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  notifyEmail: string;
  notifyOnContact: boolean;
  notifyOnAppointment: boolean;
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPassword: string;
  updatedAt?: string;
};

const EMPTY: EmailSettings = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  fromEmail: "",
  fromName: "",
  notifyEmail: "",
  notifyOnContact: true,
  notifyOnAppointment: true,
  imapHost: "",
  imapPort: 993,
  imapUser: "",
  imapPassword: "",
};

export default function EmailPage() {
  const { toast } = useToast();
  const [data, setData] = useState<EmailSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email-settings");
      const json = await res.json();
      if (json.ok && json.data) {
        setData({
          id: json.data.id,
          smtpHost: json.data.smtpHost ?? "",
          smtpPort: json.data.smtpPort ?? 587,
          smtpUser: json.data.smtpUser ?? "",
          smtpPassword: json.data.smtpPassword ?? "",
          fromEmail: json.data.fromEmail ?? "",
          fromName: json.data.fromName ?? "",
          notifyEmail: json.data.notifyEmail ?? "",
          notifyOnContact: json.data.notifyOnContact ?? true,
          notifyOnAppointment: json.data.notifyOnAppointment ?? true,
          updatedAt: json.data.updatedAt,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les paramètres email.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data.fromEmail.trim() || !data.notifyEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "L'email expéditeur et l'email de notification sont requis.",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost: data.smtpHost,
          smtpPort: Number(data.smtpPort) || 587,
          smtpUser: data.smtpUser,
          smtpPassword: data.smtpPassword,
          fromEmail: data.fromEmail,
          fromName: data.fromName,
          notifyEmail: data.notifyEmail,
          notifyOnContact: data.notifyOnContact,
          notifyOnAppointment: data.notifyOnAppointment,
          imapHost: data.imapHost,
          imapPort: Number(data.imapPort) || 993,
          imapUser: data.imapUser,
          imapPassword: data.imapPassword,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Paramètres enregistrés",
          description: "La configuration email a été mise à jour avec succès.",
        });
        fetchSettings();
      } else {
        throw new Error(json.error);
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

  async function handleTest() {
    if (!data.smtpHost || !data.smtpUser) {
      toast({
        variant: "destructive",
        title: "Configuration incomplète",
        description: "Renseignez et enregistrez l'hôte et l'utilisateur SMTP avant de tester.",
      });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/email-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: data.notifyEmail }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Email de test envoyé ✅",
          description: `Un email a été envoyé à ${json.sentTo}. Vérifiez votre boîte de réception (et les spams).`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Échec de l'envoi",
          description: json.error || "Erreur inconnue lors de l'envoi de l'email de test.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de contacter le serveur pour l'envoi de test.",
      });
    } finally {
      setTesting(false);
    }
  }

  const isConfigured = Boolean(data.smtpHost && data.smtpUser && data.fromEmail);

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Email &amp; Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configurez le serveur SMTP et les notifications automatiques d&apos;2mails.pro
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center text-muted-foreground text-sm">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Chargement des paramètres...
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={onSave} className="space-y-6">
          {/* Configuration SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-accent" />
                Configuration SMTP
                {isConfigured ? (
                  <Badge variant="secondary" className="ml-1 gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Configuré
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-1 gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Non configuré
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Paramètres du serveur d&apos;envoi d&apos;emails (SMTP). Les identifiants sont stockés
                sécurisément et utilisés pour les notifications automatiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="smtpHost" className="flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5" />
                    Hôte SMTP
                  </Label>
                  <Input
                    id="smtpHost"
                    value={data.smtpHost}
                    onChange={(e) => setData({ ...data, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adresse du serveur SMTP de votre fournisseur.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port SMTP</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    min={1}
                    max={65535}
                    value={data.smtpPort}
                    onChange={(e) =>
                      setData({ ...data, smtpPort: Number(e.target.value) || 0 })
                    }
                    placeholder="587"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ports courants : 587 (TLS), 465 (SSL), 25 (non chiffré).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Utilisateur SMTP</Label>
                  <Input
                    id="smtpUser"
                    value={data.smtpUser}
                    onChange={(e) => setData({ ...data, smtpUser: e.target.value })}
                    placeholder="contact@2mails.pro"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={data.smtpPassword}
                    onChange={(e) => setData({ ...data, smtpPassword: e.target.value })}
                    placeholder={data.smtpPassword ? "•••••••• (conservé, ne pas re-saisir)" : "••••••••••••"}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.smtpPassword
                      ? "✓ Mot de passe déjà configuré. Laissez vide pour le conserver."
                      : "Pour Gmail, utilisez un mot de passe d'application (16 caractères)."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email expéditeur</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={data.fromEmail}
                    onChange={(e) => setData({ ...data, fromEmail: e.target.value })}
                    placeholder="noreply@2mails.pro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">Nom de l&apos;expéditeur</Label>
                  <Input
                    id="fromName"
                    value={data.fromName}
                    onChange={(e) => setData({ ...data, fromName: e.target.value })}
                    placeholder="2mails.pro"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IMAP (boîte de réception) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Inbox className="h-5 w-5 text-accent" />
                Réception (IMAP)
              </CardTitle>
              <CardDescription>
                Configuration pour consulter la boîte de réception dans la Messagerie.
                Souvent identiques à SMTP (ex: Gmail utilise les mêmes identifiants).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imapHost">Hôte IMAP</Label>
                  <Input
                    id="imapHost"
                    value={data.imapHost}
                    onChange={(e) => setData({ ...data, imapHost: e.target.value })}
                    placeholder="imap.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort">Port IMAP</Label>
                  <Input
                    id="imapPort"
                    type="number"
                    value={data.imapPort}
                    onChange={(e) => setData({ ...data, imapPort: Number(e.target.value) })}
                    placeholder="993"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imapUser">Utilisateur IMAP</Label>
                  <Input
                    id="imapUser"
                    value={data.imapUser}
                    onChange={(e) => setData({ ...data, imapUser: e.target.value })}
                    placeholder="contact@2mails.pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPassword">Mot de passe IMAP</Label>
                  <Input
                    id="imapPassword"
                    type="password"
                    value={data.imapPassword}
                    onChange={(e) => setData({ ...data, imapPassword: e.target.value })}
                    placeholder={data.imapPassword ? "•••••••• (conservé, ne pas re-saisir)" : "••••••••"}
                    autoComplete="new-password"
                  />
                  {data.imapPassword && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      ✓ Mot de passe déjà configuré. Laissez vide pour le conserver.
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pour Gmail, utilisez le même mot de passe d&apos;application (16 caractères) que pour SMTP.
                La Messagerie du dashboard lit cette boîte via IMAP.
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-accent" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choisissez quand et où recevoir des notifications par email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="notifyEmail">Email de réception des notifications</Label>
                <Input
                  id="notifyEmail"
                  type="email"
                  value={data.notifyEmail}
                  onChange={(e) => setData({ ...data, notifyEmail: e.target.value })}
                  placeholder="contact@2mails.pro"
                />
                <p className="text-xs text-muted-foreground">
                  Tous les emails de notification seront envoyés à cette adresse.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5 pr-4">
                    <Label htmlFor="notifyOnContact" className="text-sm font-medium cursor-pointer">
                      Notifier à la réception d&apos;un message de contact
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Un email est envoyé quand un visiteur soumet le formulaire de contact.
                    </p>
                  </div>
                  <Switch
                    id="notifyOnContact"
                    checked={data.notifyOnContact}
                    onCheckedChange={(checked) =>
                      setData({ ...data, notifyOnContact: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5 pr-4">
                    <Label htmlFor="notifyOnAppointment" className="text-sm font-medium cursor-pointer">
                      Notifier à la demande de rendez-vous
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Un email est envoyé quand un visiteur demande un rendez-vous.
                    </p>
                  </div>
                  <Switch
                    id="notifyOnAppointment"
                    checked={data.notifyOnAppointment}
                    onCheckedChange={(checked) =>
                      setData({ ...data, notifyOnAppointment: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sticky save bar */}
          <div className="sticky bottom-4 z-30">
            <Card className="shadow-lg ring-1 ring-border">
              <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {data.updatedAt
                    ? `Dernière modification : ${new Date(data.updatedAt).toLocaleString("fr-FR")}`
                    : "Aucune modification enregistrée"}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTest}
                    disabled={testing || saving || loading || !isConfigured}
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    {testing ? "Envoi..." : "Tester l'envoi"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchSettings()}
                    disabled={loading || saving}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || loading}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
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
