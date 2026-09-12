"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mail,
  Package,
  Globe2,
  Clock,
  TrendingUp,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  Ship,
  Plane,
  Truck,
  Warehouse,
  FileCheck2,
  Boxes,
  Anchor,
  PackageCheck,
  ExternalLink,
  Inbox,
  Calendar,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

type DashboardData = {
  ok: boolean;
  stats: {
    totalMessages: number;
    messagesThisMonth: number;
    servicesCount: number;
    countriesCount: number;
    foundedYear: string;
    yearsActive: number;
  };
  services: string[];
  countries: string[];
  monthlyTrend: { month: string; count: number }[];
  recentMessages: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    createdAt: string;
  }[];
  subjectDistribution: { keyword: string; count: number }[];
  generatedAt: string;
};

type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/*  Static config                                                      */
/* ------------------------------------------------------------------ */

const SERVICE_ICONS: Record<string, typeof Ship> = {
  "Transport Maritime": Ship,
  "Transport Aérien": Plane,
  "Transport Routier & Multimodal": Truck,
  "Transit & Dédouanement": FileCheck2,
  "Entreposage sous Douane": Warehouse,
  "Supply Chain & Logistique": Boxes,
  "Manutention de Colis Lourd": PackageCheck,
  "Freight Forwarding": Anchor,
};

const PIE_COLORS = [
  "#1e3a8a",
  "#ca8a04",
  "#0e7490",
  "#15803d",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0369a1",
];

const SUBJECT_LABELS: Record<string, string> = {
  devis: "Demandes de devis",
  transit: "Transit",
  transport: "Transport",
  douane: "Douane",
  fret: "Fret",
  entrepôt: "Entreposage",
  autre: "Autre",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(iso);
}

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay,
}: {
  icon: typeof Mail;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "navy" | "gold" | "teal" | "green";
  delay?: number;
}) {
  // Multicolor solid backgrounds: blue + yellow alternating (per user request)
  const accentMap = {
    navy: {
      bg: "bg-primary",
      text: "text-primary-foreground",
      iconWrap: "bg-white/20",
      iconText: "text-white",
      valueText: "text-white",
      labelText: "text-white/80",
      subText: "text-white/60",
    },
    gold: {
      bg: "bg-accent",
      text: "text-accent-foreground",
      iconWrap: "bg-black/10",
      iconText: "text-accent-foreground",
      valueText: "text-accent-foreground",
      labelText: "text-accent-foreground/80",
      subText: "text-accent-foreground/60",
    },
    teal: {
      bg: "bg-cyan-500",
      text: "text-white",
      iconWrap: "bg-white/20",
      iconText: "text-white",
      valueText: "text-white",
      labelText: "text-white/80",
      subText: "text-white/60",
    },
    green: {
      bg: "bg-emerald-500",
      text: "text-white",
      iconWrap: "bg-white/20",
      iconText: "text-white",
      valueText: "text-white",
      labelText: "text-white/80",
      subText: "text-white/60",
    },
  };
  const c = accentMap[accent || "navy"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all ${c.bg} border-0`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className={`text-sm font-medium ${c.labelText}`}>{label}</p>
              <p className={`mt-2 text-3xl font-extrabold tracking-tight ${c.valueText}`}>
                {value}
              </p>
              {sub && (
                <p className={`mt-1 text-xs ${c.subText}`}>{sub}</p>
              )}
            </div>
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconWrap}`}
            >
              <Icon className={`h-6 w-6 ${c.iconText}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart: Messages trend (Area)                                       */
/* ------------------------------------------------------------------ */

function MessagesTrendChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
              Messages reçus
            </CardTitle>
            <CardDescription className="mt-1">
              Évolution sur les 6 derniers mois
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Activity className="mr-1 h-3 w-3" />
            Temps réel
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.875rem",
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Messages"
                stroke="#1e3a8a"
                strokeWidth={2.5}
                fill="url(#colorMsg)"
                dot={{ r: 4, fill: "#1e3a8a", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart: Subject distribution (Bar)                                  */
/* ------------------------------------------------------------------ */

function SubjectDistributionChart({
  data,
}: {
  data: { keyword: string; count: number }[];
}) {
  const chartData = data.map((d) => ({
    name: SUBJECT_LABELS[d.keyword] || d.keyword,
    value: d.count,
  }));
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5 text-accent" />
              Sujets des demandes
            </CardTitle>
            <CardDescription className="mt-1">
              Répartition par thématique
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.875rem",
                }}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar
                dataKey="value"
                name="Demandes"
                fill="#ca8a04"
                radius={[0, 6, 6, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart: Services (Donut)                                            */
/* ------------------------------------------------------------------ */

function ServicesDonut({ services }: { services: string[] }) {
  const data = services.map((s, i) => ({
    name: s,
    value: 1,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-accent" />
          Portefeuille de services
        </CardTitle>
        <CardDescription>
          {services.length} services spécialisés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.875rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {services.map((s, i) => {
              const Icon = SERVICE_ICONS[s] || Package;
              return (
                <div
                  key={s}
                  className="flex items-center gap-2 text-xs"
                  title={s}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="flex items-center gap-1 text-muted-foreground truncate">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{s}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Countries coverage                                                  */
/* ------------------------------------------------------------------ */

function CountriesCoverage({
  countries,
}: {
  countries: string[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe2 className="h-5 w-5 text-accent" />
          Couverture géographique
        </CardTitle>
        <CardDescription>
          {countries.length} pays desservis depuis Dakar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {countries.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2.5 rounded-lg p-3 ring-1 ${
                c === "Sénégal"
                  ? "bg-accent/15 ring-accent/40"
                  : "bg-secondary/60 ring-border"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  c === "Sénégal" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {c}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {c === "Sénégal" ? "Base" : "Desservi"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Messages table                                                     */
/* ------------------------------------------------------------------ */

function MessagesTable() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<MessageRow | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/messages?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      if (json.ok) {
        setMessages(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const t = setTimeout(fetchMessages, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchMessages, search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-accent" />
              Messages reçus
              <Badge variant="secondary" className="ml-1">
                {total}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Demandes envoyées via le formulaire de contact
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-8 w-full sm:w-64"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchMessages}
              title="Actualiser"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="max-h-[460px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="min-w-[140px]">Client</TableHead>
                  <TableHead className="min-w-[180px]">Contact</TableHead>
                  <TableHead className="min-w-[140px]">Sujet</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <div className="h-5 w-full rounded bg-muted animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? "Aucun message ne correspond à votre recherche."
                          : "Aucun message pour le moment."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((m) => (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(m)}
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {m.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                          {m.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {m.subject ? (
                          <Badge variant="outline" className="font-normal">
                            {m.subject}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {relativeTime(m.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(m);
                          }}
                        >
                          Voir
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Detail modal (inline) */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-background rounded-xl shadow-2xl ring-1 ring-border w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selected.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelected(null)}
                  >
                    Fermer
                  </Button>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-primary hover:underline truncate"
                    >
                      {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${selected.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selected.phone}
                      </a>
                    </div>
                  )}
                  {selected.subject && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Badge variant="secondary">{selected.subject}</Badge>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Message
                  </p>
                  <div className="rounded-lg bg-secondary/60 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button asChild className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Votre demande")}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Répondre par email
                    </a>
                  </Button>
                  {selected.phone && (
                    <Button asChild variant="outline">
                      <a href={`tel:${selected.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Appeler
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      if (json.ok) setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Vue d'ensemble
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data ? new Date(data.generatedAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboard}
          title="Actualiser"
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI cards - multicolores bleu/jaune alternés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Mail}
          label="Messages reçus"
          value={loading ? "—" : data?.stats.totalMessages ?? 0}
          sub={`${data?.stats.messagesThisMonth ?? 0} ce mois-ci`}
          accent="navy"
          delay={0}
        />
        <KpiCard
          icon={Package}
          label="Services proposés"
          value={loading ? "—" : data?.stats.servicesCount ?? 0}
          sub="Transit • Transport • Logistique"
          accent="gold"
          delay={0.05}
        />
        <KpiCard
          icon={Globe2}
          label="Pays desservis"
          value={loading ? "—" : data?.stats.countriesCount ?? 0}
          sub="Depuis Dakar"
          accent="navy"
          delay={0.1}
        />
        <KpiCard
          icon={Clock}
          label="Années d'activité"
          value={loading ? "—" : data?.stats.yearsActive ?? 0}
          sub={`Depuis ${data?.stats.foundedYear ?? "2019"}`}
          accent="gold"
          delay={0.15}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <MessagesTrendChart data={data?.monthlyTrend || []} />
        </div>
        <ServicesDonut services={data?.services || []} />
      </div>

      {/* Second charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SubjectDistributionChart data={data?.subjectDistribution || []} />
        </div>
        <CountriesCoverage countries={data?.countries || []} />
      </div>

      {/* Messages table */}
      <div className="mb-6">
        <MessagesTable />
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} 2mails.pro — Tableau de bord interne
        </p>
        <p className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Données mises à jour le {data ? new Date(data.generatedAt).toLocaleString("fr-FR") : "—"}
        </p>
      </div>
    </main>
  );
}
