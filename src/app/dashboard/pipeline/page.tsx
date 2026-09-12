"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  X,
  Trash2,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Stage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

type Deal = {
  id: string;
  title: string;
  value: number;
  stage: Stage;
  clientId: string;
  clientName: string;
  closeDate: string | null;
  assignedTo: string | null;
  createdAt: string;
};

type Client = { id: string; name: string };

type StageMeta = {
  value: Stage;
  label: string;
  badge: string;
  dot: string;
  border: string;
  tint: string;
};

const STAGES: StageMeta[] = [
  {
    value: "lead",
    label: "Prospect",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-400",
    tint: "bg-blue-50/60",
  },
  {
    value: "qualified",
    label: "Qualifié",
    badge: "bg-cyan-100 text-cyan-700",
    dot: "bg-cyan-500",
    border: "border-cyan-400",
    tint: "bg-cyan-50/60",
  },
  {
    value: "proposal",
    label: "Proposition",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-400",
    tint: "bg-amber-50/60",
  },
  {
    value: "negotiation",
    label: "Négociation",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
    border: "border-orange-400",
    tint: "bg-orange-50/60",
  },
  {
    value: "won",
    label: "Gagné",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-400",
    tint: "bg-emerald-50/60",
  },
  {
    value: "lost",
    label: "Perdu",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-400",
    tint: "bg-rose-50/60",
  },
];

function stageMeta(stage: Stage): StageMeta {
  return STAGES.find((s) => s.value === stage) || STAGES[0];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export default function PipelinePage() {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    value: string;
    stage: Stage;
    clientId: string;
    closeDate: string;
    assignedTo: string;
  }>({
    title: "",
    value: "",
    stage: "lead",
    clientId: "",
    closeDate: "",
    assignedTo: "",
  });

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deals");
      const json = await res.json();
      if (json.ok) setDeals(json.data as Deal[]);
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les deals.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      const json = await res.json();
      if (json.ok) {
        setClients(
          (json.data as Client[]).map((c) => ({ id: c.id, name: c.name }))
        );
      }
    } catch {
      // silent — clients may be empty, modal will show warning
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchClients();
  }, [fetchDeals, fetchClients]);

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      value: "",
      stage: "lead",
      clientId: clients[0]?.id || "",
      closeDate: "",
      assignedTo: "",
    });
    setModalOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditing(deal);
    setForm({
      title: deal.title,
      value: String(deal.value || ""),
      stage: deal.stage,
      clientId: deal.clientId,
      closeDate: toDateInput(deal.closeDate),
      assignedTo: deal.assignedTo || "",
    });
    setModalOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({
        variant: "destructive",
        title: "Champ requis",
        description: "Le titre est obligatoire.",
      });
      return;
    }
    if (!form.clientId) {
      toast({
        variant: "destructive",
        title: "Client requis",
        description: "Veuillez sélectionner un client.",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        value: Number(form.value) || 0,
        stage: form.stage,
        clientId: form.clientId,
        closeDate: form.closeDate || null,
        assignedTo: form.assignedTo.trim() || null,
      };
      const url = editing ? `/api/deals/${editing.id}` : "/api/deals";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: editing ? "Deal mis à jour" : "Deal créé",
          description: editing
            ? "Les modifications ont été enregistrées."
            : "Le deal a été ajouté au pipeline.",
        });
        setModalOpen(false);
        fetchDeals();
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

  async function onDelete() {
    if (!editing) return;
    if (!confirm(`Supprimer le deal « ${editing.title} » ?`)) return;
    try {
      const res = await fetch(`/api/deals/${editing.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: "Deal supprimé",
          description: `« ${editing.title} » a été supprimé.`,
        });
        setModalOpen(false);
        fetchDeals();
      } else {
        throw new Error(json.error);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Suppression impossible.",
      });
    }
  }

  // ---- Drag and drop (HTML5) ----
  function onDragStart(dealId: string) {
    setDraggedId(dealId);
  }
  function onDragEnd() {
    setDraggedId(null);
    setDragOverStage(null);
  }
  function onDragOverStage(stage: Stage, e: React.DragEvent) {
    e.preventDefault();
    if (dragOverStage !== stage) setDragOverStage(stage);
  }
  function onDragLeaveStage(stage: Stage) {
    setDragOverStage((prev) => (prev === stage ? null : prev));
  }
  function onDropStage(stage: Stage, e: React.DragEvent) {
    e.preventDefault();
    const dealId = draggedId;
    setDraggedId(null);
    setDragOverStage(null);
    if (!dealId) return;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage } : d))
    );
    setMovingId(dealId);
    fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          toast({
            title: "Deal déplacé",
            description: `« ${deal.title} » → ${stageMeta(stage).label}`,
          });
        } else {
          throw new Error(json.error);
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Déplacement impossible.",
        });
        fetchDeals();
      })
      .finally(() => setMovingId(null));
  }

  // ---- Summary stats ----
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const activeCount = deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  ).length;
  const wonDeals = deals.filter((d) => d.stage === "won");
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Suivez vos opportunités commerciales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDeals}
            title="Actualiser"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            onClick={openCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouveau deal
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm font-medium">Valeur totale</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-medium">Deals actifs</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {activeCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium">Deals gagnés</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">
              {wonDeals.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium">CA gagné</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">
              {formatCurrency(wonValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {STAGES.map((s) => (
            <div key={s.value} className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-2 px-2">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const items = deals.filter((d) => d.stage === stage.value);
              const total = items.reduce(
                (sum, d) => sum + (d.value || 0),
                0
              );
              const isOver = dragOverStage === stage.value;
              return (
                <div
                  key={stage.value}
                  onDragOver={(e) => onDragOverStage(stage.value, e)}
                  onDragLeave={() => onDragLeaveStage(stage.value)}
                  onDrop={(e) => onDropStage(stage.value, e)}
                  className={cn(
                    "w-72 shrink-0 flex flex-col rounded-xl border transition-colors",
                    isOver
                      ? cn(stage.border, "bg-accent/10")
                      : "border-border bg-secondary/30"
                  )}
                >
                  {/* Column header */}
                  <div className="px-3 py-3 border-b border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          stage.dot
                        )}
                      />
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {stage.label}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="px-3 pb-2">
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  {/* Cards list */}
                  <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-22rem)]">
                    {items.length === 0 ? (
                      <div
                        className={cn(
                          "rounded-lg border border-dashed border-border p-4 text-center",
                          stage.tint
                        )}
                      >
                        <p className="text-xs text-muted-foreground">
                          Aucun deal
                        </p>
                        {isOver && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Déposez ici
                          </p>
                        )}
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {items.map((deal) => (
                          <motion.div
                            key={deal.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            draggable
                            onDragStart={() => onDragStart(deal.id)}
                            onDragEnd={onDragEnd}
                            onClick={() => openEdit(deal)}
                            className={cn(
                              "group cursor-pointer rounded-lg border border-border bg-background p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all",
                              draggedId === deal.id && "opacity-50",
                              movingId === deal.id && "ring-2 ring-primary/60"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                                {deal.title}
                              </p>
                              <span
                                className={cn(
                                  "inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                  stage.badge
                                )}
                              >
                                {stage.label}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {deal.clientName || "—"}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(deal.value)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {deal.closeDate && (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(deal.closeDate)}
                                </span>
                              )}
                              {deal.assignedTo && (
                                <span className="inline-flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {deal.assignedTo}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                    {editing ? "Modifier le deal" : "Nouveau deal"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {clients.length === 0 && (
                  <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Aucun client disponible. Créez d&apos;abord un client dans
                    la section Clients.
                  </div>
                )}

                <form onSubmit={onSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="d-title">Titre du deal *</Label>
                    <Input
                      id="d-title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="Ex : Transport maritime 40ft Dakar → Bamako"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="d-value">Valeur (€)</Label>
                      <Input
                        id="d-value"
                        type="number"
                        min="0"
                        step="any"
                        value={form.value}
                        onChange={(e) =>
                          setForm({ ...form, value: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-stage">Étape</Label>
                      <Select
                        value={form.stage}
                        onValueChange={(v) =>
                          setForm({ ...form, stage: v as Stage })
                        }
                      >
                        <SelectTrigger id="d-stage" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    s.dot
                                  )}
                                />
                                {s.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="d-client">Client *</Label>
                      <Select
                        value={form.clientId || "none"}
                        onValueChange={(v) =>
                          setForm({
                            ...form,
                            clientId: v === "none" ? "" : v,
                          })
                        }
                      >
                        <SelectTrigger id="d-client" className="w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-close">Date de clôture</Label>
                      <Input
                        id="d-close"
                        type="date"
                        value={form.closeDate}
                        onChange={(e) =>
                          setForm({ ...form, closeDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="d-assign">Assigné à</Label>
                    <Input
                      id="d-assign"
                      value={form.assignedTo}
                      onChange={(e) =>
                        setForm({ ...form, assignedTo: e.target.value })
                      }
                      placeholder="Ex : Awa Ndiaye"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editing && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={onDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    )}
                    <div className="ml-auto flex gap-2 flex-1 max-w-md">
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
                            : "Créer le deal"}
                      </Button>
                    </div>
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
