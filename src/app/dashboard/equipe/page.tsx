"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Mail,
  Phone,
  X,
  Briefcase,
  Award,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  yearsExperience: number | null;
  order: number;
  active: boolean;
  createdAt: string;
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function EquipePage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", email: "", phone: "", bio: "", photoUrl: "", yearsExperience: "", order: "0", active: true,
  });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/team?${params}`);
      const json = await res.json();
      if (json.ok) setMembers(json.data);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Chargement impossible." });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMembers, search]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", role: "", email: "", phone: "", bio: "", photoUrl: "", yearsExperience: "", order: "0", active: true });
    setModalOpen(true);
  }

  function openEdit(m: TeamMember) {
    setEditing(m);
    setForm({
      name: m.name, role: m.role, email: m.email || "", phone: m.phone || "",
      bio: m.bio || "", photoUrl: m.photoUrl || "",
      yearsExperience: m.yearsExperience != null ? String(m.yearsExperience) : "",
      order: String(m.order), active: m.active,
    });
    setModalOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast({ variant: "destructive", title: "Champs requis", description: "Nom et poste requis." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, role: form.role, email: form.email, phone: form.phone,
        bio: form.bio, photoUrl: form.photoUrl,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        order: Number(form.order) || 0, active: form.active,
      };
      const url = editing ? `/api/team/${editing.id}` : "/api/team";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: editing ? "Membre modifié" : "Membre ajouté",
          description: editing ? "Modifications enregistrées." : `${form.name} a rejoint l'équipe.`,
        });
        setModalOpen(false);
        fetchMembers();
      } else throw new Error(json.error);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(m: TeamMember) {
    if (!confirm(`Supprimer « ${m.name} » de l'équipe ?`)) return;
    try {
      const res = await fetch(`/api/team/${m.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Membre supprimé", description: `${m.name} a été retiré.` });
        fetchMembers();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    }
  }

  async function toggleActive(m: TeamMember) {
    try {
      const res = await fetch(`/api/team/${m.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !m.active }),
      });
      const json = await res.json();
      if (json.ok) fetchMembers();
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Équipe
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} membre{members.length > 1 ? "s" : ""} • {members.filter((m) => m.active).length} actif{members.filter((m) => m.active).length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau membre
        </Button>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un membre..." className="pl-8" />
        </div>
        <Button variant="outline" size="icon" onClick={fetchMembers} title="Actualiser">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse mb-4" />
                <div className="h-5 w-2/3 rounded bg-muted animate-pulse mb-2" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "Aucun membre ne correspond." : "Aucun membre dans l'équipe."}
            </p>
            {!search && (
              <Button onClick={openAdd} variant="outline" size="sm" className="mt-3">
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter un membre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`group hover:shadow-lg transition-shadow ${!m.active ? "opacity-60" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 ${colorFor(m.name)}`}>
                      {initials(m.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground truncate">{m.name}</h3>
                        {m.active ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">
                            <Circle className="h-3 w-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-primary font-medium mt-0.5 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {m.role}
                      </p>
                      {m.yearsExperience != null && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {m.yearsExperience} an{m.yearsExperience > 1 ? "s" : ""} d'expérience
                        </p>
                      )}
                    </div>
                  </div>

                  {m.bio && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {m.bio}
                    </p>
                  )}

                  <div className="mt-3 space-y-1">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-3 w-3" /> <span className="truncate">{m.email}</span>
                      </a>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-3 w-3" /> {m.phone}
                      </a>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={m.active} onCheckedChange={() => toggleActive(m)} />
                      <span className="text-xs text-muted-foreground">Actif</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)} title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(m)} title="Supprimer" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
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
                  <h3 className="text-lg font-bold text-foreground">
                    {editing ? "Modifier le membre" : "Nouveau membre"}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={onSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-name">Nom complet *</Label>
                      <Input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Awa Ndiaye" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-role">Poste *</Label>
                      <Input id="t-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex : Responsable Transit" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-email">Email</Label>
                      <Input id="t-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="membre@2mails.pro" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-phone">Téléphone</Label>
                      <Input id="t-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 ..." />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-exp">Expérience (ans)</Label>
                      <Input id="t-exp" type="number" min="0" max="50" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} placeholder="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-order">Ordre d'affichage</Label>
                      <Input id="t-order" type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-photo">Photo (URL)</Label>
                      <Input id="t-photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-bio">Biographie</Label>
                    <Textarea id="t-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Parcours, spécialités, expérience..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="t-active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                    <Label htmlFor="t-active" className="cursor-pointer">Membre actif</Label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                      {saving ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter à l'équipe"}
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
