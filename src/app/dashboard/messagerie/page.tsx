"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Reply,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  Paperclip,
  Inbox,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Archive,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type EmailListItem = {
  uid: number;
  from: string;
  fromAddress: string;
  to: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
};

type EmailAttachment = { filename: string; contentType: string; size: number };

type EmailDetail = EmailListItem & {
  bodyHtml: string;
  bodyText: string;
  attachments: EmailAttachment[];
};

const FOLDER = "INBOX";
const PAGE_SIZE = 20;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "à l'instant";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 o";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function textToHtml(text: string): string {
  if (!text) return "";
  return `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]).join("").toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
  "bg-orange-500", "bg-pink-500",
];

function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const EMAIL_BODY_CSS = `
.email-content p { margin: 0.5em 0; }
.email-content h1, .email-content h2, .email-content h3, .email-content h4 { font-weight: 600; margin: 0.75em 0 0.4em; line-height: 1.3; }
.email-content h1 { font-size: 1.4em; color: #0c1f4a; }
.email-content h2 { font-size: 1.25em; color: #0c1f4a; }
.email-content h3 { font-size: 1.1em; }
.email-content a { color: #1e3a8a; text-decoration: underline; }
.email-content ul, .email-content ol { padding-left: 1.5em; margin: 0.5em 0; }
.email-content ul { list-style: disc; }
.email-content ol { list-style: decimal; }
.email-content img { max-width: 100%; height: auto; border-radius: 0.25rem; }
.email-content blockquote { border-left: 3px solid #ca8a04; padding-left: 1em; margin: 0.5em 0; color: #64748b; }
.email-content table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
.email-content th, .email-content td { border: 1px solid #e2e8f0; padding: 0.25em 0.5em; }
.email-content pre { background: #f1f5f9; padding: 0.75em; border-radius: 0.375rem; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 0.875em; margin: 0.5em 0; white-space: pre-wrap; }
.email-content code { background: #f1f5f9; padding: 0.1em 0.3em; border-radius: 0.2rem; font-size: 0.875em; }
.email-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 1em 0; }
.email-content b, .email-content strong { font-weight: 600; }
`;

export default function MessageriePage() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formTo, setFormTo] = useState("");
  const [formCc, setFormCc] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  // Track which email is "clicking" for the orange shadow animation
  const [clickingUid, setClickingUid] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, unreadOnly]);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), folder: FOLDER });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await fetch(`/api/email/inbox?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setEmails(Array.isArray(json.emails) ? json.emails : []);
        setTotal(Number(json.total) || 0);
        setTotalPages(Math.max(1, Math.ceil((Number(json.total) || 0) / PAGE_SIZE)));
      } else {
        setError(json.error || "Erreur lors du chargement.");
        setEmails([]); setTotal(0); setTotalPages(1);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setEmails([]); setTotal(0); setTotalPages(1);
    } finally { setLoading(false); }
  }, [page, debouncedSearch, unreadOnly]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const selectEmail = useCallback(async (uid: number) => {
    // Trigger the orange shadow pulse animation
    setClickingUid(uid);
    setSelectedUid(uid);
    setSelectedEmail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/email/${uid}?folder=${FOLDER}`);
      const json = await res.json();
      if (json.ok && json.email) {
        setSelectedEmail(json.email as EmailDetail);
        setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, isRead: true } : e)));
      } else {
        toast({ variant: "destructive", title: "Erreur", description: json.error || "Impossible de charger l'email." });
        setSelectedUid(null);
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger l'email." });
      setSelectedUid(null);
    } finally {
      setDetailLoading(false);
      setTimeout(() => setClickingUid(null), 600);
    }
  }, [toast]);

  const handleDelete = useCallback(async () => {
    if (!selectedUid) return;
    const uidToDelete = selectedUid;
    setDeleting(true);
    try {
      const res = await fetch(`/api/email/${uidToDelete}?folder=${FOLDER}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Email supprimé", description: "L'email a été supprimé de la boîte de réception." });
        // Immediately remove from the list (optimistic UI)
        setEmails((prev) => prev.filter((e) => e.uid !== uidToDelete));
        setSelectedUid(null);
        setSelectedEmail(null);
        // Also refresh from server to sync any other changes
        fetchInbox();
      } else {
        toast({ variant: "destructive", title: "Erreur", description: json.error || "Suppression impossible." });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    } finally { setDeleting(false); }
  }, [selectedUid, toast, fetchInbox]);

  const openComposerNew = () => {
    setFormTo(""); setFormCc(""); setFormSubject(""); setFormBody("");
    setComposerOpen(true);
  };

  const openComposerReply = () => {
    if (!selectedEmail) return;
    setFormTo(selectedEmail.fromAddress || "");
    setFormSubject(selectedEmail.subject.toLowerCase().startsWith("re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
    setFormCc(""); setFormBody("");
    setComposerOpen(true);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formTo.trim() || !formSubject.trim()) {
      toast({ variant: "destructive", title: "Champs requis", description: "Le destinataire et l'objet sont obligatoires." });
      return;
    }
    setSending(true);
    try {
      const html = textToHtml(formBody);
      const res = await fetch("/api/email/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: formTo.trim(), cc: formCc.trim() || undefined, subject: formSubject.trim(), html, text: formBody }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Email envoyé", description: `Le message a bien été envoyé à ${formTo.trim()}.` });
        setComposerOpen(false);
      } else {
        toast({ variant: "destructive", title: "Échec de l'envoi", description: json.error || "Erreur inconnue." });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Envoi impossible." });
    } finally { setSending(false); }
  };

  const closeDetail = () => { setSelectedUid(null); setSelectedEmail(null); };
  const unreadCount = emails.filter((e) => !e.isRead).length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
      {/* ===== TOP BAR — colorful gradient ===== */}
      <div className="shrink-0 bg-gradient-to-r from-[#0c1f4a] via-[#14306e] to-[#1e3a8a] text-white">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 shrink-0">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                Messagerie
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-white/60 hidden sm:block">
                {total} email{total > 1 ? "s" : ""} · {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="ghost" size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20">
              <a href="https://mail.2mails.pro" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Consulter en ligne</span>
                <span className="sm:hidden">Webmail</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchInbox} disabled={loading}
              className="text-white/80 hover:text-white hover:bg-white/10">
              <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button size="sm" onClick={openComposerNew}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md shadow-accent/30">
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Nouvel email</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="shrink-0 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 sm:px-6 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Messagerie indisponible</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-0.5">{error}</p>
            <Button asChild size="sm" variant="outline" className="mt-2 border-amber-400 text-amber-700 hover:bg-amber-100">
              <Link href="/dashboard/email">Configurer l&apos;email</Link>
            </Button>
          </div>
        </div>
      )}

      {/* ===== MAIN — full height 2-column layout ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: email list */}
        <div className={cn(
          "w-full lg:w-[400px] xl:w-[440px] shrink-0 border-r border-border bg-background flex flex-col overflow-hidden",
          selectedUid && "hidden lg:flex"
        )}>
          {/* Filters bar */}
          <div className="shrink-0 p-3 space-y-2 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
              <button type="button" onClick={() => setUnreadOnly(false)}
                className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  !unreadOnly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                Tous
              </button>
              <button type="button" onClick={() => setUnreadOnly(true)}
                className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                  unreadOnly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                Non lus
                {unreadCount > 0 && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 h-9 bg-background" />
            </div>
          </div>

          {/* Email list — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch ? "Aucun email ne correspond." : unreadOnly ? "Aucun email non lu. 🎉" : "Boîte de réception vide."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {emails.map((email) => {
                  const isSelected = selectedUid === email.uid;
                  const isClicking = clickingUid === email.uid;
                  const avatarColor = colorForName(email.from || email.fromAddress || "?");
                  return (
                    <li key={email.uid}>
                      <button
                        type="button"
                        onClick={() => selectEmail(email.uid)}
                        className={cn(
                          "w-full text-left p-3 transition-all duration-200 relative group",
                          isSelected && "bg-primary/5",
                          !email.isRead && "bg-blue-50/40 dark:bg-blue-950/15",
                          "hover:bg-secondary/60"
                        )}
                      >
                        {/* Orange shadow glow on click */}
                        {isClicking && (
                          <motion.div
                            layoutId="email-click-glow"
                            className="absolute inset-0 rounded-lg"
                            initial={{ boxShadow: "0 0 0 0 rgba(202, 138, 4, 0.6)" }}
                            animate={{ boxShadow: "0 0 20px 4px rgba(202, 138, 4, 0.35), inset 0 0 12px rgba(202, 138, 4, 0.15)" }}
                            exit={{ boxShadow: "0 0 0 0 rgba(202, 138, 4, 0)" }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <div className="relative flex items-start gap-3">
                          {/* Avatar */}
                          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm", avatarColor)}>
                            {getInitials(email.from || email.fromAddress || "?")}
                          </div>
                          {/* Unread dot */}
                          {!email.isRead && (
                            <span className="absolute -left-1 top-3 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn("text-sm truncate", email.isRead ? "font-medium text-foreground/80" : "font-bold text-foreground")}>
                                {email.from || "Inconnu"}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {relativeTime(email.date)}
                              </span>
                            </div>
                            <p className={cn("text-sm truncate mt-0.5", email.isRead ? "text-foreground/70" : "font-semibold text-foreground")}>
                              {email.subject || "(sans objet)"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {email.preview || "\u00A0"}
                            </p>
                            {email.hasAttachments && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-accent">
                                <Paperclip className="h-3 w-3" />
                                <span>Pièce jointe</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {(totalPages > 1 || total > 0) && (
            <div className="shrink-0 border-t border-border p-3 flex items-center justify-between gap-2 bg-background">
              <p className="text-xs text-muted-foreground">Page {page} / {totalPages}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: detail panel — full height */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden bg-secondary/20",
          selectedUid ? "flex" : "hidden lg:flex"
        )}>
          {selectedUid && (
            <Button variant="ghost" size="sm" className="lg:hidden m-3 shrink-0 self-start" onClick={closeDetail}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour à la liste
            </Button>
          )}

          {!selectedUid ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 ring-1 ring-border">
                <Mail className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-semibold text-foreground">Sélectionnez un email</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Choisissez un message dans la liste pour afficher son contenu ici.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 p-6 space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : selectedEmail ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Email header — colorful */}
              <div className="shrink-0 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 break-words">
                  {selectedEmail.subject || "(sans objet)"}
                </h2>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn("h-11 w-11 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md", colorForName(selectedEmail.from || selectedEmail.fromAddress || "?"))}>
                      {getInitials(selectedEmail.from || selectedEmail.fromAddress || "?")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{selectedEmail.from || "Inconnu"}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedEmail.fromAddress || "—"}</p>
                      {selectedEmail.to && <p className="text-xs text-muted-foreground mt-0.5 truncate">À : {selectedEmail.to}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 mt-1">{formatFullDate(selectedEmail.date)}</p>
                </div>
                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Button size="sm" onClick={openComposerReply} disabled={sending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                    <Reply className="mr-1.5 h-4 w-4" />
                    Répondre
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    {deleting ? "Suppression..." : "Supprimer"}
                  </Button>
                </div>
              </div>

              {/* Email body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <div
                  className="email-content bg-background rounded-xl p-5 sm:p-6 ring-1 ring-border text-foreground text-sm"
                  style={{ lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.bodyHtml || (selectedEmail.bodyText
                      ? `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${escapeHtml(selectedEmail.bodyText)}</pre>`
                      : "<p style=\"color: #94a3b8; font-style: italic;\">Aucun contenu.</p>")
                  }}
                />
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-semibold text-foreground">Pièces jointes ({selectedEmail.attachments.length})</h3>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {selectedEmail.attachments.map((att, i) => (
                        <li key={`${att.filename}-${i}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 hover:border-accent/40 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                              <Paperclip className="h-4 w-4 text-accent" />
                            </div>
                            <span className="text-sm text-foreground truncate">{att.filename || "sans-nom"}</span>
                          </div>
                          <Badge variant="secondary" className="font-normal shrink-0">{formatBytes(att.size)}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ===== COMPOSER MODAL ===== */}
      <AnimatePresence>
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !sending && setComposerOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-background w-full sm:max-w-2xl sm:rounded-xl shadow-2xl ring-1 ring-border max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Send className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Nouvel email</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => !sending && setComposerOpen(false)} disabled={sending}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="composer-to" className="text-xs font-medium">Destinataire <span className="text-destructive">*</span></Label>
                  <Input id="composer-to" type="email" value={formTo} onChange={(e) => setFormTo(e.target.value)} placeholder="destinataire@exemple.com" required autoFocus />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="composer-cc" className="text-xs font-medium">Cc <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <Input id="composer-cc" type="text" value={formCc} onChange={(e) => setFormCc(e.target.value)} placeholder="copie@exemple.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="composer-subject" className="text-xs font-medium">Objet <span className="text-destructive">*</span></Label>
                  <Input id="composer-subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="Objet du message" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="composer-body" className="text-xs font-medium">Message</Label>
                  <Textarea id="composer-body" value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Écrivez votre message..." rows={8} />
                </div>
              </form>
              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-border bg-secondary/30">
                <Button variant="outline" onClick={() => !sending && setComposerOpen(false)} disabled={sending}>Annuler</Button>
                <Button type="button" onClick={() => handleSend()} disabled={sending || !formTo.trim() || !formSubject.trim()}
                  className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {sending ? (<><RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />Envoi...</>) : (<><Send className="mr-1.5 h-4 w-4" />Envoyer</>)}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: EMAIL_BODY_CSS }} />
    </div>
  );
}
