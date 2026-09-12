import {
  TrendingUp,
  Users,
  Mail,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Building2,
  Send,
  Globe2,
  ShieldCheck,
  Sparkles,
  Zap,
  Clock,
  Code2,
  Moon,
  HandshakeIcon,
  Star,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/atouts", label: "Atouts" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  desc: string;
  image: string;
  longDesc: string;
  features: string[];
  highlights: { title: string; desc: string }[];
};

/**
 * 2mails.pro — Modules CRM SaaS.
 * Chaque "service" correspond à un module du produit, pas à une prestation logistique.
 */
export const SERVICES: Service[] = [
  {
    slug: "pipeline-ventes",
    icon: TrendingUp,
    title: "Pipeline de ventes",
    shortTitle: "Pipeline",
    desc: "Tableau Kanban drag & drop pour suivre vos opportunités, de la prospection à la signature.",
    image: "/svc-supplychain.jpg",
    longDesc:
      "Le module Pipeline de 2mails.pro centralise toutes vos opportunités commerciales dans un tableau Kanban glisser-déposer. Personnalisez les étapes (lead, qualifié, proposition, négociation, gagné/perdu), suivez la valeur de chaque deal, attribuez des responsables et visualisez vos prévisions de revenus en temps réel. Idéal pour piloter une équipe commerciale sans tableurs Excel.",
    features: [
      "Vue Kanban glisser-déposer",
      "Étapes personnalisables par organisation",
      "Valeur estimée et probabilité de closing",
      "Attribution à un responsable",
      "Date de clôture prévisionnelle",
      "Filtres par étape, responsable, période",
      "Prévisions de revenus consolidées",
      "Historique des changements d'étape",
    ],
    highlights: [
      { title: "Kanban", desc: "Glisser-déposer intuitif" },
      { title: "Prévisions", desc: "Revenus consolidés par étape" },
      { title: "Personnalisable", desc: "Étapes adaptées à votre cycle de vente" },
    ],
  },
  {
    slug: "gestion-clients",
    icon: Users,
    title: "Gestion des clients",
    shortTitle: "Clients",
    desc: "Fiche 360° avec timeline d'interactions, historique des échanges, pièces jointes et notes.",
    image: "/svc-entrepot.jpg",
    longDesc:
      "Le module Clients de 2mails.pro est votre CRM centralisé : créez, éditez et supprimez vos contacts, suivez chaque interaction (appels, emails, rendez-vous, notes), associez vos clients à des deals et des tâches, et gardez un historique complet de votre relation. Chaque fiche client est privée à votre organisation (multi-tenant).",
    features: [
      "Fiche client complète (nom, société, email, téléphone, pays)",
      "Timeline d'interactions (appels, emails, meetings, notes)",
      "Pièces jointes et notes collaboratives",
      "Statut prospect / actif / inactif",
      "Lien avec deals, tâches et rendez-vous",
      "Recherche et filtres avancés",
      "Isolation multi-tenant",
      "Import / export CSV",
    ],
    highlights: [
      { title: "360°", desc: "Vue d'ensemble du client" },
      { title: "Timeline", desc: "Historique complet des échanges" },
      { title: "Privé", desc: "Données isolées par organisation" },
    ],
  },
  {
    slug: "messagerie-integree",
    icon: Mail,
    title: "Messagerie intégrée",
    shortTitle: "Messagerie",
    desc: "Connexion IMAP / SMTP native. Envoyez et recevez vos emails directement depuis le CRM.",
    image: "/svc-freight.jpg",
    longDesc:
      "Le module Messagerie de 2mails.pro connecte votre boîte mail (IMAP/SMTP) au CRM. Plus besoin de changer d'onglet : lisez, répondeez et archivez vos emails depuis l'interface. Chaque message est rattachable à un client, une opportunité ou une tâche, et alimente automatiquement la timeline d'interactions.",
    features: [
      "Connexion IMAP / SMTP sécurisée",
      "Réception et envoi d'emails",
      "Rattachement à un client ou un deal",
      "Notifications de nouveaux emails",
      "Modèles d'emails réutilisables",
      "Pièces jointes",
      "Tri par dossier IMAP",
      "Recherche plein texte",
    ],
    highlights: [
      { title: "IMAP / SMTP", desc: "Compatible tout fournisseur" },
      { title: "Centralisé", desc: "Email + CRM au même endroit" },
      { title: "Traçable", desc: "Alimente la timeline client" },
    ],
  },
  {
    slug: "taches-rappels",
    icon: CheckSquare,
    title: "Tâches & rappels",
    shortTitle: "Tâches",
    desc: "Créez des tâches liées à un client ou un deal, fixez des échéances et ne ratez plus rien.",
    image: "/svc-transit.jpg",
    longDesc:
      "Le module Tâches de 2mails.pro vous aide à ne plus rien oublier : créez des tâches, associez-les à un client ou une opportunité, fixez une priorité et une échéance, et suivez leur statut (en attente, en cours, terminée, annulée). Les tâches peuvent être attribuées à un membre de l'équipe pour répartir la charge de travail.",
    features: [
      "Tâches liées à un client ou un deal",
      "Priorités (basse, moyenne, haute)",
      "Date d'échéance et rappels",
      "Attribution à un membre de l'équipe",
      "Statuts (en attente, en cours, terminée)",
      "Filtres par assigné, priorité, échéance",
      "Vue liste et tableau Kanban",
      "Notifications",
    ],
    highlights: [
      { title: "Liée", desc: "Tâche rattachée à un client ou deal" },
      { title: "Rappels", desc: "Échéances et notifications" },
      { title: "Équipe", desc: "Attribution et suivi collaboratif" },
    ],
  },
  {
    slug: "calendrier-rendez-vous",
    icon: CalendarDays,
    title: "Calendrier & rendez-vous",
    shortTitle: "Calendrier",
    desc: "Planifiez vos rendez-vous, visualisez votre agenda et synchronisez vos contacts clients.",
    image: "/svc-routier.jpg",
    longDesc:
      "Le module Calendrier de 2mails.pro vous permet de planifier vos rendez-vous, de les associer à un client et de visualiser votre agenda en un coup d'œil. Les demandes de rendez-vous issues du formulaire public sont automatiquement collectées et rattachées au tenant concerné.",
    features: [
      "Vue agenda mensuelle",
      "Demandes de rendez-vous depuis le site public",
      "Statut (en attente, confirmé, annulé)",
      "Association à un client",
      "Date et créneau horaire",
      "Notes et sujet du RDV",
      "Notifications de nouvelles demandes",
      "Liste filtrable",
    ],
    highlights: [
      { title: "Agenda", desc: "Vue mensuelle claire" },
      { title: "Formulaire public", desc: "Demandes entrantes automatiques" },
      { title: "Lié au client", desc: "RDV rattaché à un contact" },
    ],
  },
  {
    slug: "statistiques-analytics",
    icon: BarChart3,
    title: "Statistiques & analytics",
    shortTitle: "Analytics",
    desc: "Tableaux de bord en temps réel : conversion, pipeline, activité email, performance par utilisateur.",
    image: "/svc-maritime.jpg",
    longDesc:
      "Le module Analytics de 2mails.pro transforme vos données CRM en tableaux de bord exploitables : suivi des vues de pages, taux de conversion du pipeline, activité email par utilisateur, performance commerciale, top clients. Toutes les métriques sont mises à jour en temps réel et filtrables par période.",
    features: [
      "Tableau de bord temps réel",
      "Taux de conversion par étape du pipeline",
      "Activité email par utilisateur",
      "Top clients et top deals",
      "Vues de pages et sessions",
      "Performance commerciale",
      "Export des données",
      "Filtres par période",
    ],
    highlights: [
      { title: "Temps réel", desc: "Données à jour en continu" },
      { title: "Actionnable", desc: "Indicateurs prêts à la décision" },
      { title: "Export", desc: "CSV et tableur" },
    ],
  },
  {
    slug: "multi-tenant-isolation",
    icon: Building2,
    title: "Multi-tenant & isolation",
    shortTitle: "Multi-tenant",
    desc: "Chaque organisation dispose de son propre espace privé. Données strictement isolées par tenant.",
    image: "/svc-entrepot.jpg",
    longDesc:
      "2mails.pro est conçu dès le départ comme un SaaS multi-tenant : chaque organisation possède son propre espace de travail, avec ses clients, deals, tâches, emails et paramètres. Aucune donnée ne circule entre organisations. Les rôles (admin, manager, agent) contrôlent les permissions au sein de chaque tenant.",
    features: [
      "Isolation stricte des données par organisation",
      "Rôles (super_admin, admin, manager, agent)",
      "Invitation d'utilisateurs par email",
      "Limites d'utilisateurs par plan",
      "Paramètres par tenant (SEO, emails, maintenance)",
      "Domaine personnalisé (à venir)",
      "Statistiques par tenant",
      "Sécurité et confidentialité",
    ],
    highlights: [
      { title: "Isolé", desc: "Vos données ne fuient jamais" },
      { title: "Rôles", desc: "Admin / manager / agent" },
      { title: "Invitations", desc: "Ajoutez vos collègues par email" },
    ],
  },
  {
    slug: "personnalisation-api",
    icon: Code2,
    title: "Personnalisation & API",
    shortTitle: "API",
    desc: "Thèmes clair/sombre, SEO par tenant, et API REST pour intégrer 2mails.pro à vos outils.",
    image: "/svc-aerien.jpg",
    longDesc:
      "2mails.pro s'adapte à votre marque et à vos outils : personnalisez le titre SEO et la description de votre espace, activez le mode maintenance, basculez entre thème clair et sombre, et intégrez le CRM à vos workflows via l'API REST. La localisation FR / EN est intégrée.",
    features: [
      "Thème clair / sombre",
      "Localisation FR / EN",
      "Paramètres SEO par tenant",
      "Mode maintenance programmable",
      "API REST documentée",
      "Webhooks (à venir)",
      "Personnalisation de l'identité",
      "Intégrations à venir (Zapier, Make)",
    ],
    highlights: [
      { title: "FR / EN", desc: "Localisation native" },
      { title: "API REST", desc: "Pour vos intégrations" },
      { title: "Thème", desc: "Clair / sombre au choix" },
    ],
  },
];

export const SERVICE_HIGHLIGHTS = [
  {
    img: "/hero-port.jpg",
    title: "Pipeline de ventes",
    sub: "Kanban drag & drop",
  },
  {
    img: "/airfreight.jpg",
    title: "Messagerie intégrée",
    sub: "IMAP / SMTP natif",
  },
  {
    img: "/warehouse.jpg",
    title: "Multi-tenant",
    sub: "Données isolées par org",
  },
];

/**
 * Points forts affichés sur la page d'accueil / À propos.
 * (Anciennement COUNTRIES — remplacé par des features clés du produit.)
 */
export type Country = { name: string; base?: boolean };

export const COUNTRIES: Country[] = [
  { name: "Multi-tenant", base: true },
  { name: "FR / EN" },
  { name: "Dark mode" },
  { name: "API REST" },
  { name: "IMAP / SMTP" },
  { name: "Rôles & permissions" },
];

export type Stat = { value: string; label: string; icon: LucideIcon };

export const STATS: Stat[] = [
  { value: "8", label: "Modules CRM", icon: Code2 },
  { value: "FR/EN", label: "Bilingue", icon: Globe2 },
  { value: "∞", label: "Clients par plan Pro", icon: Users },
  { value: "24/7", label: "Disponibilité SaaS", icon: Clock },
];

export type Atout = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const WHY_US: Atout[] = [
  {
    icon: Building2,
    title: "Multi-tenant natif",
    desc: "Chaque organisation dispose de son propre espace privé, strictement isolé des autres. Vos données clients ne fuient jamais.",
  },
  {
    icon: Globe2,
    title: "Bilingue FR / EN",
    desc: "Interface traduite en français et en anglais, pour servir vos équipes et vos clients partout en Europe et en Afrique.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & rôles",
    desc: "Permissions par rôle (admin, manager, agent), mots de passe hachés (SHA-256) et sessions sécurisées par cookie httpOnly.",
  },
  {
    icon: Zap,
    title: "Déploiement rapide",
    desc: "Inscription en 30 secondes, plan Free jusqu'à 2 utilisateurs. Aucune installation, accessible depuis n'importe quel navigateur.",
  },
];

export type ProcessStep = { step: string; title: string; desc: string };

export const PROCESS: ProcessStep[] = [
  {
    step: "01",
    title: "Inscription",
    desc: "Créez votre organisation en 30 secondes, gratuitement, sans carte bancaire.",
  },
  {
    step: "02",
    title: "Configuration",
    desc: "Renseignez vos paramètres SMTP/IMAP, votre SEO et invitez votre équipe par email.",
  },
  {
    step: "03",
    title: "Import des clients",
    desc: "Ajoutez vos clients et opportunités, ou importez-les en CSV depuis votre ancien outil.",
  },
  {
    step: "04",
    title: "Pilotage",
    desc: "Suivez votre pipeline, vos tâches et vos statistiques depuis un tableau de bord unifié.",
  },
];

export const FAQS = [
  {
    q: "2mails.pro est-il un CRM ou un outil d'email ?",
    a: "Les deux. 2mails.pro combine un CRM complet (clients, pipeline, tâches, calendrier, analytics) et une messagerie intégrée IMAP/SMTP. Vous gérez votre relation client et vos emails depuis la même interface.",
  },
  {
    q: "Mes données sont-elles isolées des autres organisations ?",
    a: "Oui. 2mails.pro est un SaaS multi-tenant : chaque organisation possède son propre espace privé. Vos clients, deals, tâches et emails ne sont jamais visibles par une autre organisation.",
  },
  {
    q: "Puis-je inviter mes collègues ?",
    a: "Oui. L'administrateur peut inviter des utilisateurs par email, avec un rôle (admin, manager, agent). Chaque invitation expire après 7 jours pour des raisons de sécurité.",
  },
  {
    q: "Comment démarrer ?",
    a: "Inscrivez-vous gratuitement sur /register, créez votre organisation (2 utilisateurs inclus), puis configurez votre boîte email IMAP/SMTP. Aucune carte bancaire requise.",
  },
];

// ---- Coordonnées de l'entreprise ----
export const COMPANY = {
  addressLine1: "2mails.pro",
  addressLine2: "Service en ligne (SaaS)",
  city: "Paris",
  country: "France",
  phone: "+33 1 84 80 00 00",
  phoneHref: "+33184800000",
  phoneSecondary: "+33 1 84 80 00 01",
  phoneSecondaryHref: "+33184800001",
  email: "contact@2mails.pro",
  founded: "2024",
};

// ---- Nos partenaires / intégrations ----
export type Partner = {
  name: string;
  logo: string;
  role: string;
  description: string;
};

export const PARTNERS: Partner[] = [
  {
    name: "Intégrations email",
    logo: "/logo-2mails-transparent.png",
    role: "IMAP / SMTP standard",
    description:
      "2mails.pro se connecte à tout fournisseur d'email supportant IMAP et SMTP : Gmail, Outlook, OVH, Infomaniak, etc. Vos emails restent chez votre hébergeur, le CRM s'contente de les lire et d'en envoyer.",
  },
];

// ---- Témoignages clients (placeholder) ----
export type Reference = {
  name: string;
  logo: string;
  desc: string;
};

export const REFERENCES: Reference[] = [
  {
    name: "Vos clients ici",
    logo: "/logo-2mails-transparent.png",
    desc: "Devenez la prochaine success story 2mails.pro",
  },
];
