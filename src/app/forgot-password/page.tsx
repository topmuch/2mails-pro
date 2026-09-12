"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        setSent(true);
        if (json.devToken) {
          toast({
            title: "Token généré (dev)",
            description: `Token: ${json.devToken}`,
          });
        }
      } else {
        toast({ variant: "destructive", title: "Erreur", description: json.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la demande." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#0c1f4a] via-[#14306e] to-[#0c1f4a]">
      <div className="absolute inset-0 bg-dot-gold opacity-25" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <ThemeToggle variant="dark-header" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-background rounded-2xl shadow-2xl ring-1 ring-border p-8">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground">Email envoyé</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Si cet email existe, un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-white p-1.5 mx-auto shadow-lg">
                  <img src="/logo-2mails-transparent.png" alt="2mails.pro" className="h-full w-full object-contain" />
                </div>
                <h1 className="mt-4 text-xl font-bold text-foreground">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="pl-10 h-11" required autoFocus />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : <><Send className="mr-2 h-4 w-4" />Envoyer le lien</>}
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
