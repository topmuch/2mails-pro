"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Trash2,
  Mail,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  X,
  Copy,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  active: boolean;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string; // pending | accepted | expired
  createdAt: string;
  expiresAt: string;
};

type AccountData = {
  maxUsers: number;
  currentUsers: number;
  plan: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  agent: "Agent",
};

function roleBadgeClass(role: string) {
  const r = (role || "").toLowerCase();
  if (r.includes("admin")) {
    return "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  }
  if (r.includes("manager") || r.includes("manag")) {
    return "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
  if (r.includes("agent")) {
    return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
  return "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function statusBadgeClass(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "accepted") {
    return "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }
  if (s === "expired") {
    return "border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  }
  return "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
}

function statusLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "accepted") return "Acceptée";
  if (s === "expired") return "Expirée";
  return "En attente";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MembresPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", role: "agent" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, invRes, accRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/invitations"),
        fetch("/api/account"),
      ]);
      const membersJson = await membersRes.json();
      const invJson = await invRes.json();
      const accJson = await accRes.json();
      if (membersJson.ok) setMembers(membersJson.data || []);
      if (invJson.ok) setInvitations(invJson.data || []);
      if (accJson.ok && accJson.data) setAccount(accJson.data);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Chargement impossible." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeMembers = members.filter((m) => m.active);
  const pendingInvitations = invitations.filter((i) => i.status === "pending");
  const maxUsers = account?.maxUsers ?? 0;
  const currentUsers = account?.currentUsers ?? activeMembers.length;

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email) {
      toast({ variant: "destructive", title: "Email requis", description: "Saisissez un email valide." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: form.role }),
      });
      const json = await res.json();
      if (json.ok && json.token) {
        const link = `${window.location.origin}/register?invite=${json.token}`;
        toast({
          title: "Invitation créée",
          description: `Lien : ${link}`,
          action: (
            <button
              onClick={() => copyToClipboard(link)}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copier
            </button>
          ),
        });
        setModalOpen(false);
        setForm({ email: "", role: "agent" });
        fetchAll();
      } else {
        throw new Error(json.error || "Erreur");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Invitation impossible",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteInvitation(inv: Invitation) {
    if (!confirm(`Supprimer l'invitation de « ${inv.email} » ?`)) return;
    try {
      const res = await fetch(`/api/invitations/${inv.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Invitation supprimée", description: inv.email });
        fetchAll();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  KPI cards                                                       */
  /* ---------------------------------------------------------------- */

  const kpis = [
    {
      label: "Utilisateurs actifs",
      value: String(currentUsers),
      icon: Users,
      hint: `${activeMembers.length} membre${activeMembers.length > 1 ? "s" : ""} dans l'équipe`,
      tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Invitations en attente",
      value: String(pendingInvitations.length),
      icon: Clock,
      hint: `${invitations.length} invitation${invitations.length > 1 ? "s" : ""} au total`,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Limite du plan",
      value: `${currentUsers}/${maxUsers || "—"}`,
      icon: Shield,
      hint: account ? `Plan ${account.plan}` : "Chargement…",
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Membres
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gérez les utilisateurs et les invitations de votre espace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} title="Actualiser">
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Inviter un membre
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {loading && !account
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          : kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${k.tint}`}>
                      <k.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {k.label}
                      </p>
                      <p className="text-2xl font-extrabold text-foreground leading-tight">
                        {k.value}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{k.hint}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Active members */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Membres actifs
          </CardTitle>
          <CardDescription>
            Liste des membres de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucun membre actif pour le moment.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Inviter un membre
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${colorFor(m.name)}`}>
                          {initials(m.name)}
                        </div>
                        <span className="font-medium text-foreground">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {m.email ? (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[220px]">{m.email}</span>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadgeClass(m.role)}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Actif
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-accent" />
            Invitations
          </CardTitle>
          <CardDescription>
            Invitations envoyées aux futurs membres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune invitation envoyée.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Inviter un membre
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {inv.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadgeClass(inv.role)}>
                        {ROLE_LABELS[inv.role] || inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(inv.status)}>
                        {statusLabel(inv.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(inv.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(`${window.location.origin}/register?invite=${inv.token}`)}
                        title="Copier le lien"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteInvitation(inv)}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-2xl ring-1 ring-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Inviter un membre
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={onInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inv-email">Email du membre *</Label>
                    <Input
                      id="inv-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="membre@exemple.com"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Un lien d&apos;inscription valide 7 jours sera généré.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-role">Rôle</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v })}
                    >
                      <SelectTrigger id="inv-role" className="w-full">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            Administrateur
                          </span>
                        </SelectItem>
                        <SelectItem value="manager">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-500" />
                            Manager
                          </span>
                        </SelectItem>
                        <SelectItem value="agent">
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            Agent
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Le rôle détermine les permissions du membre une fois connecté.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setModalOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {saving ? "Envoi…" : "Générer le lien"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
