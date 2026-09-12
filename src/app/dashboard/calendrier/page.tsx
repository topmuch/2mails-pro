"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AppointmentStatus = "pending" | "confirmed" | "cancelled";

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string;
  status: AppointmentStatus;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: "En attente",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmé",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Annulé",
    color: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const KPI_CARDS = [
  { key: "month", label: "Ce mois-ci", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "pending", label: "En attente", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "confirmed", label: "Confirmés", color: "text-emerald-600", bg: "bg-emerald-50" },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parsePreferredDate(raw: string | null): Date | null {
  if (!raw) return null;
  // Try ISO first
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;
  // Try YYYY-MM-DD
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3])
    );
    if (!Number.isNaN(d.getTime())) return d;
  }
  // Try DD/MM/YYYY
  const m2 = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m2) {
    const d = new Date(
      Number(m2[3]),
      Number(m2[2]) - 1,
      Number(m2[1])
    );
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns 0-6 with Monday = 0, Sunday = 6 */
function mondayBasedWeekday(d: Date): number {
  const jsDay = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return (jsDay + 6) % 7;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateFr(iso: string | null): string {
  if (!iso) return "—";
  const d = parsePreferredDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string | null): string {
  if (!time) return "—";
  return time;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CalendrierPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar cursor
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedDay, setSelectedDay] = useState<Date | null>(today);

  /* ----- Data ----- */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setAppointments(json.data as Appointment[]);
      } else {
        throw new Error(json.error || "Erreur");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les rendez-vous.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ----- Month navigation ----- */
  function prevMonth() {
    setCursor((c) => {
      const m = c.month - 1;
      if (m < 0) return { year: c.year - 1, month: 11 };
      return { ...c, month: m };
    });
  }
  function nextMonth() {
    setCursor((c) => {
      const m = c.month + 1;
      if (m > 11) return { year: c.year + 1, month: 0 };
      return { ...c, month: m };
    });
  }
  function goToday() {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDay(today);
  }

  /* ----- Calendar grid ----- */
  const calendarCells = useMemo(() => {
    const firstDay = new Date(cursor.year, cursor.month, 1);
    const leadingBlanks = mondayBasedWeekday(firstDay); // 0-6
    const totalDays = getDaysInMonth(cursor.year, cursor.month);

    const cells: ({ date: Date; inMonth: true } | { date: null; inMonth: false })[] = [];

    for (let i = 0; i < leadingBlanks; i++) {
      cells.push({ date: null, inMonth: false });
    }
    for (let day = 1; day <= totalDays; day++) {
      cells.push({
        date: new Date(cursor.year, cursor.month, day),
        inMonth: true,
      });
    }
    // Trailing blanks to fill the last week
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, inMonth: false });
    }
    return cells;
  }, [cursor]);

  /* ----- Appointments bucketed by day ----- */
  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    const noDate: Appointment[] = [];
    for (const a of appointments) {
      const d = parsePreferredDate(a.preferredDate);
      if (!d) {
        noDate.push(a);
        continue;
      }
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(a);
      map.set(key, arr);
    }
    return { map, noDate };
  }, [appointments]);

  function appointmentsForDay(d: Date): Appointment[] {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return byDay.map.get(key) || [];
  }

  /* ----- KPIs ----- */
  const monthAppointments = useMemo(
    () =>
      appointments.filter((a) => {
        const d = parsePreferredDate(a.preferredDate);
        if (!d) return false;
        return (
          d.getFullYear() === cursor.year && d.getMonth() === cursor.month
        );
      }),
    [appointments, cursor]
  );

  const kpis = {
    month: monthAppointments.length,
    pending: monthAppointments.filter((a) => a.status === "pending").length,
    confirmed: monthAppointments.filter((a) => a.status === "confirmed").length,
  };

  /* ----- Selected day appointments ----- */
  const selectedAppointments = selectedDay ? appointmentsForDay(selectedDay) : [];

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Calendrier
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Visualisez les rendez-vous et demandes
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAppointments} title="Actualiser">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {KPI_CARDS.map((kpi) => {
          const value = kpis[kpi.key as keyof typeof kpis];
          const Icon =
            kpi.key === "pending"
              ? Clock
              : kpi.key === "confirmed"
              ? CalendarDays
              : CalendarDays;
          return (
            <Card key={kpi.key}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p className={cn("mt-1 text-3xl font-extrabold", kpi.color)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg capitalize">
                  {MONTHS_FR[cursor.month]} {cursor.year}
                </CardTitle>
                <CardDescription className="mt-1">
                  {monthAppointments.length} rendez-vous ce mois-ci
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={goToday}>
                  Aujourd&apos;hui
                </Button>
                <Button variant="outline" size="icon" onClick={prevMonth} title="Mois précédent">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} title="Mois suivant">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, i) => {
                if (!cell.inMonth || !cell.date) {
                  return (
                    <div
                      key={i}
                      className="aspect-square sm:min-h-[80px] rounded-md bg-muted/40 border border-dashed border-border/60"
                    />
                  );
                }
                const dayApts = appointmentsForDay(cell.date);
                const isToday = sameDay(cell.date, today);
                const isSelected = selectedDay && sameDay(cell.date, selectedDay);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDay(cell.date!)}
                    className={cn(
                      "aspect-square sm:min-h-[80px] p-1.5 rounded-md border text-left transition-colors flex flex-col gap-1",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-background hover:bg-secondary/60",
                      isToday && !isSelected && "border-primary/60 bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-semibold inline-flex items-center justify-center h-6 w-6 rounded-full",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayApts.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-auto">
                        <span className="inline-flex items-center justify-center text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground w-fit">
                          {dayApts.length}
                        </span>
                        <div className="hidden sm:flex flex-wrap gap-0.5">
                          {dayApts.slice(0, 3).map((a) => {
                            const meta = STATUS_META[a.status];
                            return (
                              <span
                                key={a.id}
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  meta.dot
                                )}
                                title={`${a.name} — ${meta.label}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {(["pending", "confirmed", "cancelled"] as AppointmentStatus[]).map(
                (s) => (
                  <span key={s} className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        STATUS_META[s].dot
                      )}
                    />
                    {STATUS_META[s].label}
                  </span>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected day panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDay
                ? formatDateFr(selectedDay.toISOString())
                : "Aucune date sélectionnée"}
            </CardTitle>
            <CardDescription>
              {selectedAppointments.length} rendez-vous
              {selectedAppointments.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[460px] overflow-y-auto -mx-1 px-1 space-y-3">
              {selectedAppointments.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucun rendez-vous ce jour.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {selectedAppointments.map((a) => (
                    <AppointmentCard key={a.id} a={a} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No-date appointments */}
      {byDay.noDate.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-muted-foreground" />
              Sans date
            </CardTitle>
            <CardDescription>
              {byDay.noDate.length} demande{byDay.noDate.length > 1 ? "s" : ""} sans
              date de rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {byDay.noDate.map((a) => (
                  <AppointmentCard key={a.id} a={a} compact />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointment card                                                   */
/* ------------------------------------------------------------------ */

function AppointmentCard({
  a,
  compact = false,
}: {
  a: Appointment;
  compact?: boolean;
}) {
  const meta = STATUS_META[a.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className={cn(
        "rounded-lg border border-border bg-background p-3 hover:bg-secondary/40 transition-colors",
        a.status === "cancelled" && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground text-sm truncate">
              {a.name}
            </span>
          </div>
          {a.company && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{a.company}</span>
            </div>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0",
            meta.color
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>

      {a.subject && (
        <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
          {a.subject}
        </p>
      )}
      {!compact && a.message && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {a.message}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {a.preferredTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(a.preferredTime)}
          </span>
        )}
        {a.phone && (
          <a
            href={`tel:${a.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {a.phone}
          </a>
        )}
        {a.email && (
          <a
            href={`mailto:${a.email}`}
            className="inline-flex items-center gap-1 hover:text-foreground truncate max-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{a.email}</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
