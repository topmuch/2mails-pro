import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "2mails.pro | CRM SaaS — Gestion clients, équipe & messagerie",
  description:
    "2mails.pro — CRM SaaS pour gérer vos clients, votre équipe, vos statistiques, votre messagerie et vos paramètres depuis un tableau de bord unifié.",
  keywords: [
    "2mails.pro",
    "CRM SaaS",
    "gestion clients",
    "gestion équipe",
    "messagerie intégrée",
    "tableau de bord CRM",
    "CRM Dakar Sénégal",
    "logiciel CRM",
    "platform CRM",
  ],
  authors: [{ name: "2mails.pro" }],
  icons: {
    icon: "/logo-2mails-transparent.png",
    apple: "/logo-2mails-transparent.png",
  },
  openGraph: {
    title: "2mails.pro | CRM SaaS — Tableau de bord unifié",
    description:
      "Gérez vos clients, votre équipe, votre messagerie et vos statistiques depuis un tableau de bord unifié. CRM SaaS moderne et intuitif.",
    siteName: "2mails.pro",
    type: "website",
    locale: "fr_SN",
  },
  twitter: {
    card: "summary_large_image",
    title: "2mails.pro | CRM SaaS",
    description:
      "CRM SaaS pour gérer clients, équipe, messagerie et statistiques depuis un tableau de bord unifié.",
  },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('twomails-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
