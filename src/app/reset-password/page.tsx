"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const email = searchParams.get("email") || "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Erreur", description: "Email manquant dans le lien." });
      return;
    }
    if (password !== confirm) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
        toast({ title: "Succès", description: "Mot de passe réinitialisé." });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast({ variant: "destructive", title: "Erreur", description: json.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de réinitialiser." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#0c1f4a] via-[#14306e] to-[#0c1f4a]">
      <div className="absolute inset-0 bg-dot-gold opacity-25" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <ThemeToggle variant="dark-header" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-2xl ring-1 ring-border p-8">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Mot de passe modifié</h1>
              <p className="mt-2 text-sm text-muted-foreground">Redirection vers la connexion...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white p-1.5 mx-auto shadow-lg">
                  <img src="/logo-2mails-transparent.png" alt="2mails.pro" className="h-full w-full object-contain" />
                </div>
                <h1 className="mt-4 text-xl font-bold text-foreground">Nouveau mot de passe</h1>
                <p className="mt-1 text-sm text-muted-foreground">Définissez un nouveau mot de passe pour {email}</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10 h-11" required minLength={6} autoFocus />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmer</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm" type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="pl-10 h-11" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</> : "Réinitialiser le mot de passe"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
