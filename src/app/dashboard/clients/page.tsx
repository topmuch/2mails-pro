"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Globe2,
  X,
  Building2,
  StickyNote,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  Clock,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  service: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

type Interaction = {
  id: string;
  type: string;
  content: string;
  clientId: string;
  createdBy: string | null;
  createdAt: string;
};

type SortKey = "name" | "email" | "status" | "createdAt" | "";

const SERVICE_OPTIONS = [
  "Transport Maritime",
  "Transport Aérien",
  "Transport Routier & Multimodal",
  "Transit & Dédouanement",
  "Entreposage sous Douane",
  "Supply Chain & Logistique",
  "Manutention de Colis Lourd",
  "Freight Forwarding",
];

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect", color: "bg-amber-100 text-amber-700" },
  { value: "actif", label: "Actif", color: "bg-emerald-100 text-emerald-700" },
  { value: "inactif", label: "Inactif", color: "bg-slate-100 text-slate-600" },
];

const COUNTRY_OPTIONS = [
  "Sénégal", "Mali", "Guinée", "Guinée-Bissau", "Mauritanie", "Gambie", "Autre",
];

const INTERACTION_TYPES = [
  { value: "call", label: "Appel", icon: Phone, color: "text-blue-600", bg: "bg-blue-100" },
  { value: "email", label: "Email", icon: Mail, color: "text-emerald-600", bg: "bg-emerald-100" },
  { value: "meeting", label: "Réunion", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  { value: "note", label: "Note", icon: StickyNote, color: "text-amber-600", bg: "bg-amber-100" },
  { value: "deal", label: "Affaire", icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-100" },
];

function getInteractionMeta(type: string) {
  return (
    INTERACTION_TYPES.find((t) => t.value === type) ||
    INTERACTION_TYPES.find((t) => t.value === "note")!
  );
}

function statusBadge(status: string) {
  const s = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s?.color || "bg-slate-100 text-slate-600"}`}>
      {s?.label || status}
    </span>
  );
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState<"details" | "timeline">("details");
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", country: "", service: "", status: "prospect", notes: "",
  });
  // Interactions state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ type: "note", content: "" });
  const [savingInteraction, setSavingInteraction] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/clients?${params}`);
      const json = await res.json();
      if (json.ok) setClients(json.data);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Chargement impossible." });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  const fetchInteractions = useCallback(async (clientId: string) => {
    setInteractionsLoading(true);
    try {
      const res = await fetch(`/api/interactions?clientId=${clientId}`);
      const json = await res.json();
      if (json.ok) setInteractions(json.data);
      else setInteractions([]);
    } catch {
      setInteractions([]);
    } finally {
      setInteractionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchClients, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchClients, search]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", company: "", email: "", phone: "", country: "", service: "", status: "prospect", notes: "" });
    setModalTab("details");
    setInteractions([]);
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name, company: c.company || "", email: c.email, phone: c.phone || "",
      country: c.country || "", service: c.service || "", status: c.status, notes: c.notes || "",
    });
    setModalTab("details");
    setInteractions([]);
    setModalOpen(true);
    fetchInteractions(c.id);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ variant: "destructive", title: "Champs requis", description: "Nom et email requis." });
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/clients/${editing.id}` : "/api/clients";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: editing ? "Client modifié" : "Client ajouté",
          description: editing ? "Les modifications ont été enregistrées." : "Le client a été créé avec succès.",
        });
        setModalOpen(false);
        fetchClients();
      } else {
        throw new Error(json.error);
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c: Client) {
    if (!confirm(`Supprimer le client « ${c.name} » ?`)) return;
    try {
      const res = await fetch(`/api/clients/${c.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Client supprimé", description: `${c.name} a été supprimé.` });
        fetchClients();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    }
  }

  async function onAddInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!newInteraction.content.trim()) {
      toast({ variant: "destructive", title: "Champ requis", description: "Le contenu est requis." });
      return;
    }
    setSavingInteraction(true);
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newInteraction.type,
          content: newInteraction.content,
          clientId: editing.id,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Interaction ajoutée", description: "L'interaction a été enregistrée." });
        setNewInteraction({ type: "note", content: "" });
        fetchInteractions(editing.id);
      } else {
        throw new Error(json.error);
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Ajout impossible." });
    } finally {
      setSavingInteraction(false);
    }
  }

  async function onDeleteInteraction(id: string) {
    if (!confirm("Supprimer cette interaction ?")) return;
    try {
      const res = await fetch(`/api/interactions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Interaction supprimée" });
        if (editing) fetchInteractions(editing.id);
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    }
  }

  function toggleSort(k: Exclude<SortKey, "">) {
    if (sortKey !== k) {
      setSortKey(k);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("");
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setCountryFilter("all");
    setServiceFilter("all");
    setSortKey("");
    setSortDir("asc");
  }

  const filteredClients = useMemo(() => {
    let list = clients;
    if (countryFilter !== "all") list = list.filter((c) => c.country === countryFilter);
    if (serviceFilter !== "all") list = list.filter((c) => c.service === serviceFilter);
    if (sortKey) {
      list = [...list].sort((a, b) => {
        if (sortKey === "createdAt") {
          const ad = new Date(a.createdAt).getTime();
          const bd = new Date(b.createdAt).getTime();
          return sortDir === "asc" ? ad - bd : bd - ad;
        }
        const av = (a[sortKey] || "").toString().toLowerCase();
        const bv = (b[sortKey] || "").toString().toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [clients, countryFilter, serviceFilter, sortKey, sortDir]);

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    countryFilter !== "all" ||
    serviceFilter !== "all" ||
    sortKey !== "";

  function SortHeader({ label, k }: { label: string; k: Exclude<SortKey, ""> }) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 text-left hover:text-foreground transition-colors"
      >
        {label}
        {sortKey === k ? (
          sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    );
  }

  const stats = {
    total: clients.length,
    prospects: clients.filter((c) => c.status === "prospect").length,
    actifs: clients.filter((c) => c.status === "actif").length,
    inactifs: clients.filter((c) => c.status === "inactif").length,
  };

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
              Clients
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gérez votre portefeuille de clients
            </p>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-primary" },
          { label: "Prospects", value: stats.prospects, color: "text-amber-600" },
          { label: "Actifs", value: stats.actifs, color: "text-emerald-600" },
          { label: "Inactifs", value: stats.inactifs, color: "text-slate-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Liste des clients</CardTitle>
              <CardDescription className="mt-1">{stats.total} client{stats.total > 1 ? "s" : ""}{filteredClients.length !== clients.length ? ` · ${filteredClients.length} affichés` : ""}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" title="Exporter en CSV">
                <a href="/api/clients/export" download>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export CSV
                </a>
              </Button>
              <Button variant="outline" size="icon" onClick={fetchClients} title="Actualiser">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {/* Advanced filters row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous pays</SelectItem>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous services</SelectItem>
                {SERVICE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-8"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} title="Réinitialiser les filtres">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="max-h-[560px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead className="min-w-[160px]"><SortHeader label="Client" k="name" /></TableHead>
                    <TableHead className="min-w-[160px]"><SortHeader label="Contact" k="email" /></TableHead>
                    <TableHead className="min-w-[120px]">Pays</TableHead>
                    <TableHead className="min-w-[160px]">Service</TableHead>
                    <TableHead className="min-w-[100px]"><SortHeader label="Statut" k="status" /></TableHead>
                    <TableHead className="min-w-[120px]"><SortHeader label="Créé le" k="createdAt" /></TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <div className="h-5 w-full rounded bg-muted animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters ? "Aucun client ne correspond aux filtres." : search ? "Aucun client ne correspond." : "Aucun client pour le moment."}
                        </p>
                        {!hasActiveFilters && (
                          <Button onClick={openAdd} variant="outline" size="sm" className="mt-3">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Ajouter un client
                          </Button>
                        )}
                        {hasActiveFilters && (
                          <Button onClick={resetFilters} variant="outline" size="sm" className="mt-3">
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{c.name}</div>
                          {c.company && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {c.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 truncate max-w-[180px]">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </div>
                          {c.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {c.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.country ? (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Globe2 className="h-3 w-3" />
                              {c.country}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.service ? (
                            <Badge variant="outline" className="font-normal text-xs">{c.service}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Modifier">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(c)} title="Supprimer" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit modal (with Détails + Timeline tabs) */}
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
              className="bg-background rounded-xl shadow-2xl ring-1 ring-border w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-foreground">
                    {editing ? "Modifier le client" : "Nouveau client"}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Tabs value={modalTab} onValueChange={(v) => setModalTab(v as "details" | "timeline")}>
                  <TabsList>
                    <TabsTrigger value="details">Détails</TabsTrigger>
                    {editing && (
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="details">
                    <form onSubmit={onSave} className="space-y-4 pt-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="c-name">Nom complet *</Label>
                          <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Awa Ndiaye" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="c-company">Société</Label>
                          <Input id="c-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Ex : SARL..." />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="c-email">Email *</Label>
                          <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@exemple.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="c-phone">Téléphone</Label>
                          <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 ..." />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="c-country">Pays</Label>
                          <Select value={form.country || "none"} onValueChange={(v) => setForm({ ...form, country: v === "none" ? "" : v })}>
                            <SelectTrigger id="c-country"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              {COUNTRY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="c-service">Service concerné</Label>
                          <Select value={form.service || "none"} onValueChange={(v) => setForm({ ...form, service: v === "none" ? "" : v })}>
                            <SelectTrigger id="c-service"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              {SERVICE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-status">Statut</Label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                          <SelectTrigger id="c-status"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-notes">Notes</Label>
                        <Textarea id="c-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Informations complémentaires..." />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={saving} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                          {saving ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le client"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  {editing && (
                    <TabsContent value="timeline">
                      {/* Add new interaction */}
                      <form onSubmit={onAddInteraction} className="space-y-3 pt-4">
                        <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="i-type" className="text-xs">Type d'interaction</Label>
                            <Select value={newInteraction.type} onValueChange={(v) => setNewInteraction({ ...newInteraction, type: v })}>
                              <SelectTrigger id="i-type"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {INTERACTION_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="i-content" className="text-xs">Contenu</Label>
                            <Textarea
                              id="i-content"
                              value={newInteraction.content}
                              onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                              rows={2}
                              placeholder="Décrivez l'interaction..."
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" disabled={savingInteraction} size="sm">
                            {savingInteraction ? "Ajout..." : "Ajouter l'interaction"}
                          </Button>
                        </div>
                      </form>
                      {/* Timeline list */}
                      <div className="mt-6">
                        {interactionsLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="h-16 w-full rounded bg-muted animate-pulse" />
                            ))}
                          </div>
                        ) : interactions.length === 0 ? (
                          <div className="text-center py-10">
                            <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Aucune interaction enregistrée pour ce client.</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Ajoutez la première interaction ci-dessus.</p>
                          </div>
                        ) : (
                          <div className="relative space-y-1">
                            {interactions.map((it) => {
                              const meta = getInteractionMeta(it.type);
                              const Icon = meta.icon;
                              return (
                                <div key={it.id} className="relative flex gap-3 group">
                                  <div className="flex flex-col items-center">
                                    <div className={`h-9 w-9 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 ring-4 ring-background`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="w-px flex-1 bg-border mt-1" />
                                  </div>
                                  <div className="flex-1 pb-5 -mt-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">{meta.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(it.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                        onClick={() => onDeleteInteraction(it.id)}
                                        title="Supprimer l'interaction"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                    <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{it.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
