"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  X,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TaskStatus = "pending" | "in_progress" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high";
type FilterTab = "all" | "in_progress" | "done" | "late";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  clientId: string | null;
  clientName: string;
  assignedTo: string | null;
  createdAt: string;
};

type ClientOption = {
  id: string;
  name: string;
  company: string | null;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  high: {
    label: "Haute",
    color: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  medium: {
    label: "Moyenne",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  low: {
    label: "Basse",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminées" },
  { value: "late", label: "En retard" },
];

const KPI_CARDS = [
  { key: "total", label: "Total", color: "text-blue-600", bg: "bg-blue-50", icon: CheckSquare },
  { key: "in_progress", label: "En cours", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  { key: "done", label: "Terminées", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  { key: "late", label: "En retard", color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isOverdue(t: Task): boolean {
  if (!t.dueDate) return false;
  if (t.status === "done" || t.status === "cancelled") return false;
  return new Date(t.dueDate).getTime() < Date.now();
}

function priorityMeta(p: string) {
  return (
    PRIORITY_META[p as TaskPriority] || {
      label: p || "Moyenne",
      color: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TachesPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    dueDate: "",
    clientId: "",
    status: "pending" as TaskStatus,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks?status=pending", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setTasks(json.data as Task[]);
      } else {
        throw new Error(json.error || "Erreur");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les tâches.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        const list = (json.data as ClientOption[]).map((c) => ({
          id: c.id,
          name: c.name,
          company: (c as { company?: string | null }).company ?? null,
        }));
        setClients(list);
      }
    } catch {
      /* silent — client link is optional */
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchClients();
  }, [fetchTasks, fetchClients]);

  /* ----- KPIs ----- */
  const kpis = {
    total: tasks.length,
    in_progress: tasks.filter(
      (t) => t.status === "pending" || t.status === "in_progress"
    ).length,
    done: tasks.filter((t) => t.status === "done").length,
    late: tasks.filter(isOverdue).length,
  };

  /* ----- Filtered list ----- */
  const visibleTasks = tasks.filter((t) => {
    switch (filter) {
      case "in_progress":
        return t.status === "pending" || t.status === "in_progress";
      case "done":
        return t.status === "done";
      case "late":
        return isOverdue(t);
      default:
        return true;
    }
  });

  /* ----- Modals ----- */
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      priority: (t.priority as TaskPriority) || "medium",
      dueDate: toDateInputValue(t.dueDate),
      clientId: t.clientId || "",
      status: (t.status as TaskStatus) || "pending",
    });
    setModalOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({
        variant: "destructive",
        title: "Titre requis",
        description: "Veuillez saisir un titre pour la tâche.",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        clientId: form.clientId || undefined,
        status: editing ? form.status : "pending",
      };
      const url = editing ? `/api/tasks/${editing.id}` : "/api/tasks";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: editing ? "Tâche modifiée" : "Tâche créée",
          description: editing
            ? "Les modifications ont été enregistrées."
            : "La nouvelle tâche a été ajoutée.",
        });
        setModalOpen(false);
        fetchTasks();
      } else {
        throw new Error(json.error || "Erreur");
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

  async function toggleDone(t: Task) {
    const newStatus = t.status === "done" ? "pending" : "done";
    setTogglingId(t.id);
    // Optimistic UI
    setTasks((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status: newStatus } : x))
    );
    try {
      const res = await fetch(`/api/tasks/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erreur");
      toast({
        title:
          newStatus === "done" ? "Tâche terminée" : "Tâche rouverte",
        description: t.title,
      });
    } catch {
      // Revert
      setTasks((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, status: t.status } : x))
      );
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Mise à jour impossible.",
      });
    } finally {
      setTogglingId(null);
    }
  }

  async function onDelete(t: Task) {
    if (!confirm(`Supprimer la tâche « ${t.title} » ?`)) return;
    try {
      const res = await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Tâche supprimée",
          description: t.title,
        });
        fetchTasks();
      } else {
        throw new Error(json.error || "Erreur");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Suppression impossible.",
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tâches
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Suivez et organisez vos tâches
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTasks}
            title="Actualiser"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            onClick={openCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((kpi) => {
          const value = kpis[kpi.key as keyof typeof kpis];
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-3xl font-extrabold",
                        kpi.color
                      )}
                    >
                      {value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center",
                      kpi.bg
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5", kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? kpis.total
              : tab.value === "in_progress"
              ? kpis.in_progress
              : tab.value === "done"
              ? kpis.done
              : kpis.late;
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="grid gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
                <div className="mt-3 h-4 w-1/3 rounded bg-muted/70 animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : visibleTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === "all"
                  ? "Aucune tâche pour le moment."
                  : "Aucune tâche dans cette catégorie."}
              </p>
              <Button
                onClick={openCreate}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Créer une tâche
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence initial={false}>
            {visibleTasks.map((t) => {
              const overdue = isOverdue(t);
              const prio = priorityMeta(t.priority);
              const done = t.status === "done";
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <Card
                    className={cn(
                      "transition-colors hover:bg-secondary/40",
                      done && "opacity-75",
                      overdue && "border-rose-300"
                    )}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleDone(t)}
                          disabled={togglingId === t.id}
                          className="mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                          title={done ? "Marquer comme à faire" : "Marquer comme terminée"}
                          aria-label={done ? "Marquer comme à faire" : "Marquer comme terminée"}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>

                        {/* Content */}
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "font-semibold text-foreground truncate",
                                done && "line-through text-muted-foreground"
                              )}
                            >
                              {t.title}
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                                prio.color
                              )}
                              title={`Priorité ${prio.label}`}
                            >
                              <Flag className="h-3 w-3" />
                              {prio.label}
                            </span>
                            {overdue && (
                              <Badge
                                variant="outline"
                                className="text-rose-700 border-rose-300 bg-rose-50 text-xs"
                              >
                                <AlertCircle className="h-3 w-3" />
                                En retard
                              </Badge>
                            )}
                          </div>

                          {t.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {t.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {t.dueDate && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1",
                                  overdue && "text-rose-600 font-medium"
                                )}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(t.dueDate)}
                              </span>
                            )}
                            {t.clientName && t.clientName !== "—" && (
                              <span className="inline-flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                {t.clientName}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Créée le {formatDate(t.createdAt)}
                            </span>
                          </div>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(t)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(t)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Create / Edit modal */}
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
                    {editing ? "Modifier la tâche" : "Nouvelle tâche"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="t-title">Titre *</Label>
                    <Input
                      id="t-title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="Ex : Rappeler le client pour le devis..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-desc">Description</Label>
                    <Textarea
                      id="t-desc"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Détails, contexte, actions attendues..."
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-priority">Priorité</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) =>
                          setForm({ ...form, priority: v as TaskPriority })
                        }
                      >
                        <SelectTrigger id="t-priority" className="w-full">
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.keys(PRIORITY_META) as TaskPriority[]
                          ).map((p) => (
                            <SelectItem key={p} value={p}>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium",
                                  PRIORITY_META[p].color
                                )}
                              >
                                <Flag className="h-3 w-3" />
                                {PRIORITY_META[p].label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-due">Échéance</Label>
                      <Input
                        id="t-due"
                        type="date"
                        value={form.dueDate}
                        onChange={(e) =>
                          setForm({ ...form, dueDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-client">Client (optionnel)</Label>
                      <Select
                        value={form.clientId || "none"}
                        onValueChange={(v) =>
                          setForm({
                            ...form,
                            clientId: v === "none" ? "" : v,
                          })
                        }
                      >
                        <SelectTrigger id="t-client" className="w-full">
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Aucun —</SelectItem>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                              {c.company ? ` · ${c.company}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editing && (
                      <div className="space-y-2">
                        <Label htmlFor="t-status">Statut</Label>
                        <Select
                          value={form.status}
                          onValueChange={(v) =>
                            setForm({ ...form, status: v as TaskStatus })
                          }
                        >
                          <SelectTrigger id="t-status" className="w-full">
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">À faire</SelectItem>
                            <SelectItem value="in_progress">
                              En cours
                            </SelectItem>
                            <SelectItem value="done">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                      {saving
                        ? "Enregistrement..."
                        : editing
                        ? "Enregistrer"
                        : "Créer la tâche"}
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
