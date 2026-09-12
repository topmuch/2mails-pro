import {
  Plane,
  Ship,
  Truck,
  PackageCheck,
  Warehouse,
  FileCheck2,
  Anchor,
  Boxes,
  Globe2,
  ShieldCheck,
  Users,
  Clock,
  Route,
  HandshakeIcon,
  Sparkles,
  ShoppingCart,
  Wrench,
  Ship as ShipIcon,
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

export const SERVICES: Service[] = [
  {
    slug: "transport-maritime",
    icon: Ship,
    title: "Transport Maritime",
    shortTitle: "Maritime",
    desc: "Fret maritime complet, FCL/LCL, groupage et rendu destination finale pour vos marchandises vers et depuis Dakar.",
    image: "/svc-maritime.jpg",
    longDesc:
      "Notre service de transport maritime couvre l'ensemble de vos besoins d'import et d'export depuis et vers le Port de Dakar, véritable hub maritime de l'Afrique de l'Ouest. Nous gérons les conteneurs FCL (Full Container Load) et LCL (Less than Container Load), le conventionnel, le groupage et le rendu destination finale. Grâce à nos partenariats avec les compagnies maritimes de la place, nous négocions les meilleurs tarifs et délais pour votre fret, tout en assurant un suivi constant de vos marchandises depuis l'embarquement jusqu'à la livraison.",
    features: [
      "Fret FCL (conteneur complet) et LCL (groupage)",
      "Import / Export vers toutes destinations",
      "Conventionnel, Ro-Ro et marchandises diverses",
      "Rendu destination finale (door-to-door)",
      "Négociation tarifaire avec compagnies maritimes",
      "Suivi et tracking des conteneurs",
      "Gestion des documents B/L, connaissements",
      "Assurance marchandise sur demande",
    ],
    highlights: [
      { title: "Port de Dakar", desc: "Hub maritime de référence en Afrique de l'Ouest" },
      { title: "Tous modes", desc: "FCL, LCL, conventionnel et groupage" },
      { title: "Door-to-door", desc: "Livraison jusqu'à la destination finale" },
    ],
  },
  {
    slug: "transport-aerien",
    icon: Plane,
    title: "Transport Aérien",
    shortTitle: "Aérien",
    desc: "Solutions de fret aérien express avec suivi dédié, idéal pour les colis sensibles et urgents.",
    image: "/svc-aerien.jpg",
    longDesc:
      "Pour vos envois urgents et sensibles, notre service de transport aérien offre des solutions express avec un suivi dédié de bout en bout. Nous opérons depuis l'Aéroport International Blaise Diagne de Dakar vers toutes destinations mondiales. Nos équipes prennent en charge la réservation, la préparation des marchandises, les formalités de douane et la livraison finale. Le fret aérien est particulièrement adapté aux colis à forte valeur ajoutée, aux pièces détachées urgentes, aux échantillons et aux marchandises périssables nécessitant des délais courts.",
    features: [
      "Fret aérien express (standard et prioritaire)",
      "Import / Export international",
      "Colis sensibles et haute valeur",
      "Marchandises périssables et urgences",
      "Suivi dédié en temps réel",
      "Préparation et emballage adaptés",
      "Formalités douanières incluses",
      "Livraison finale door-to-door",
    ],
    highlights: [
      { title: "Express", desc: "Solutions urgentes pour vos envois prioritaires" },
      { title: "Suivi dédié", desc: "Tracking en temps réel de vos marchandises" },
      { title: "Toutes destinations", desc: "Vers et depuis l'aéroport de Dakar" },
    ],
  },
  {
    slug: "transport-routier-multimodal",
    icon: Truck,
    title: "Transport Routier & Multimodal",
    shortTitle: "Routier & Multimodal",
    desc: "Acheminement terrestre et solutions multimodales door-to-door vers le Mali, la Guinée, la Mauritanie et la Gambie.",
    image: "/svc-routier.jpg",
    longDesc:
      "Notre service de transport routier et multimodal assure l'acheminement de vos marchandises depuis Dakar vers les pays de la sous-région : Mali, Guinée, Guinée-Bissau, Mauritanie et Gambie. Nous combinons plusieurs modes de transport (route, mer, air) pour optimiser les coûts et les délais selon vos contraintes. Nos chauffeurs et partenaires expérimentés connaissent parfaitement les corridors ouest-africains et leurs particularités douanières. Le transport multimodal door-to-door vous garantit une prise en charge complète, de l'enlèvement jusqu'à la livraison finale.",
    features: [
      "Transport routier national et sous-régional",
      "Solutions multimodales combinées (mer/route/air)",
      "Corridors Mali, Guinée, Mauritanie, Gambie",
      "Livraison door-to-door",
      "Suivi GPS et reporting régulier",
      "Flotte de partenaires agréés",
      "Gestion des formalités de transit frontalier",
      "Marchandises générales et spéciales",
    ],
    highlights: [
      { title: "Sous-région", desc: "Mali, Guinée, Mauritanie, Gambie" },
      { title: "Multimodal", desc: "Combinaison mer / route / air optimisée" },
      { title: "Door-to-door", desc: "De l'enlèvement à la livraison finale" },
    ],
  },
  {
    slug: "transit-dedouanement",
    icon: FileCheck2,
    title: "Transit & Dédouanement",
    shortTitle: "Transit & Douane",
    desc: "Commissionnaire en douane agréé : formalités douanières, dédouanement import/export et gestion des régimes particuliers.",
    image: "/svc-transit.jpg",
    longDesc:
      "En tant qu'établissement de Transit et commissionnaire en Douane agréé, 2mails.pro prend en charge l'ensemble des formalités douanières de vos opérations d'import et d'export. Nos équipes expérimentées maîtrisent la réglementation douanière sénégalaise et les régimes particuliers (entrepôt sous douane, admission temporaire, transit, perfectionnement, etc.). Nous assurons la préparation et le dépôt des déclarations en douane, le calcul des droits et taxes, la gestion des régimes préférentiels et les relations avec les autorités douanières. Notre agrément garantit conformité, fiabilité et rapidité.",
    features: [
      "Commissionnaire en douane agréé",
      "Dédouanement import et export",
      "Déclarations en douane (D48, manifeste)",
      "Régimes particuliers (entrepôt, AT, transit)",
      "Calcul des droits et taxes",
      "Régimes préférentiels et certificats d'origine",
      "Relations avec autorités douanières",
      "Conseil en réglementation",
    ],
    highlights: [
      { title: "Agréé", desc: "Commissionnaire en douane officiellement agréé" },
      { title: "Tous régimes", desc: "Import, export et régimes particuliers" },
      { title: "Expertise", desc: "Équipes de 5 à 20 ans d'expérience" },
    ],
  },
  {
    slug: "entreposage-sous-douane",
    icon: Warehouse,
    title: "Entreposage sous Douane",
    shortTitle: "Entreposage",
    desc: "Stockage en magasin ou à ciel ouvert, entrepôt sous douane et gestion d'inventaire sécurisée.",
    image: "/svc-entrepot.jpg",
    longDesc:
      "Notre service d'entreposage sous douane vous permet de stocker vos marchandises en suspension des droits et taxes jusqu'à leur mise à la consommation ou leur réexportation. Nous proposons du stockage en magasin couvert et à ciel ouvert, adapté à tous types de marchandises. La gestion d'inventaire est entièrement sécurisée et informatisée, avec un suivi précis des entrées et sorties. L'entrepôt sous douane offre une flexibilité fiscale majeure : vous ne payez les droits qu'au moment de la sortie des marchandises vers le marché local.",
    features: [
      "Entrepôt sous douane agréé",
      "Stockage en magasin couvert",
      "Stockage à ciel ouvert",
      "Suspension des droits et taxes",
      "Gestion d'inventaire informatisée",
      "Sécurité 24/7 et contrôle d'accès",
      "Marchandises en attente de dédouanement",
      "Réexportation et mise à la consommation",
    ],
    highlights: [
      { title: "Suspension fiscale", desc: "Pas de droits tant que la marchandise reste stockée" },
      { title: "Flexible", desc: "Magasin couvert ou aire ouverte" },
      { title: "Sécurisé", desc: "Surveillance et gestion d'inventaire" },
    ],
  },
  {
    slug: "supply-chain-logistique",
    icon: Boxes,
    title: "Supply Chain & Logistique",
    shortTitle: "Supply Chain",
    desc: "Optimisation globale de votre chaîne d'approvisionnement, de l'origine à la destination finale.",
    image: "/svc-supplychain.jpg",
    longDesc:
      "Notre service de Supply Chain & Logistique vous accompagne dans l'optimisation globale de votre chaîne d'approvisionnement. De l'approvisionnement à la livraison finale, nous coordonnons l'ensemble des flux (matières, produits, informations) pour réduire vos coûts, améliorer vos délais et garantir la satisfaction de vos clients. Nous analysons vos processus, identifions les goulots d'étranglement et proposons des solutions sur mesure : consolidation des expéditions, optimisation des itinéraires, gestion des stocks, coordination des transporteurs. Notre approche proactive anticipe les aléas pour sécuriser vos opérations.",
    features: [
      "Optimisation de la chaîne d'approvisionnement",
      "Coordination des flux physiques et informationnels",
      "Consolidation et groupage d'expéditions",
      "Gestion des stocks et approvisionnement",
      "Planification et optimisation des itinéraires",
      "Coordination multi-transporteurs",
      "Reporting et KPI logistiques",
      "Conseil et audit logistique",
    ],
    highlights: [
      { title: "Approche globale", desc: "De l'origine à la destination finale" },
      { title: "Sur mesure", desc: "Solutions adaptées à chaque client" },
      { title: "Proactive", desc: "Anticipation des aléas et risques" },
    ],
  },
  {
    slug: "manutention-colis-lourd",
    icon: PackageCheck,
    title: "Manutention de Colis Lourd",
    shortTitle: "Colis Lourd",
    desc: "Heavy lift oncarriage : manutention et transport de colis hors gabarit avec équipements adaptés.",
    image: "/svc-colislourd.jpg",
    longDesc:
      "Notre service de manutention de colis lourd (heavy lift oncarriage) prend en charge le transport et la manipulation de marchandises hors gabarit, surdimensionnées ou de poids exceptionnel. Nous disposons d'équipements spécialisés (grues, chariots élévateurs lourds, remorques multi-essieux) et d'équipes formées aux opérations de levage complexes. Ce service est particulièrement adapté aux équipements industriels, aux matériels de BTP, aux turbines, transformateurs et autres colis hors normes. Nous gérons l'ensemble : déchargement portuaire, transport routier renforcé et livraison sur site.",
    features: [
      "Heavy lift oncarriage",
      "Marchandises hors gabarit et surdimensionnées",
      "Poids et dimensions exceptionnels",
      "Équipements spécialisés (grues, remorques)",
      "Déchargement et chargement portuaire",
      "Transport routier renforcé",
      "Levage et positionnement sur site",
      "Études de faisabilité et d'itinéraire",
    ],
    highlights: [
      { title: "Hors gabarit", desc: "Colis surdimensionnés et exceptionnels" },
      { title: "Équipements", desc: "Grues et remorques spécialisées" },
      { title: "Clé en main", desc: "Du port jusqu'au site final" },
    ],
  },
  {
    slug: "freight-forwarding",
    icon: Anchor,
    title: "Freight Forwarding",
    shortTitle: "Freight Forwarding",
    desc: "Organisation complète de vos flux de marchandises avec un réseau de sous-traitants agréés.",
    image: "/svc-freight.jpg",
    longDesc:
      "En tant que freight forwarder, 2mails.pro organise et coordonne l'ensemble de vos flux de marchandises à l'international. Nous agissons comme votre partenaire unique, en sélectionnant et en supervisant les meilleurs transporteurs, manutentionnaires et transitaires pour chaque étape de votre expédition. Notre réseau de sous-traitants agréés est encadré par des cahiers des charges stricts avec des obligations de part et d'autre, garantissant la qualité et la fiabilité de chaque opération. Nous négocions les tarifs, planifions les itinéraires, gérons la documentation et assurons le suivi de bout en bout.",
    features: [
      "Organisation complète des flux internationaux",
      "Partenaire unique pour toutes vos expéditions",
      "Réseau de sous-traitants agréés et encadrés",
      "Sélection et supervision des transporteurs",
      "Négociation tarifaire multi-modes",
      "Documentation et gestion documentaire",
      "Suivi de bout en bout",
      "Cahiers des charges et qualité garantie",
    ],
    highlights: [
      { title: "Partenaire unique", desc: "Un interlocuteur pour tous vos flux" },
      { title: "Réseau agréé", desc: "Sous-traitants encadrés par cahier des charges" },
      { title: "Bout en bout", desc: "De l'origine à la destination finale" },
    ],
  },
  {
    slug: "vente-transport",
    icon: ShoppingCart,
    title: "Vente de Transport",
    shortTitle: "Vente Transport",
    desc: "Vente de solutions de transport adaptées à vos besoins, avec un accompagnement complet.",
    image: "/svc-routier.jpg",
    longDesc:
      "2mails.pro propose la vente de solutions de transport adaptées aux besoins spécifiques de chaque client. Grâce à notre contrat de représentativité en Afrique de l'Ouest avec ARS Rental, nous mettons à votre disposition des engins et du matériel de manutention et transport de dernière génération. Que vous ayez besoin d'acquérir un véhicule utilitaire, un camion ou un équipement de transport spécialisé, nous vous accompagnons dans votre choix avec des solutions techniques et financières sur mesure.",
    features: [
      "Vente de véhicules utilitaires et camions",
      "Matériel de transport de dernière génération",
      "Solutions techniques adaptées",
      "Accompagnement dans le choix d'équipement",
      "Contrat de représentativité ARS Rental",
      "Solutions financières sur mesure",
      "Conseil en acquisition",
      "Suivi après-vente",
    ],
    highlights: [
      { title: "ARS Rental", desc: "Représentant officiel en Afrique de l'Ouest" },
      { title: "Dernière génération", desc: "Engins et matériel récents" },
      { title: "Sur mesure", desc: "Solutions adaptées à chaque besoin" },
    ],
  },
  {
    slug: "location-materiel-manutention",
    icon: Wrench,
    title: "Location Matériel de Manutention",
    shortTitle: "Location Manutention",
    desc: "Vente ou location longue durée de matériel de manutention de dernière génération.",
    image: "/svc-entrepot.jpg",
    longDesc:
      "En partenariat avec ARS Rental, 2mails.pro propose la vente ou la location longue durée de matériel de manutention de dernière génération. Notre catalogue comprend chariots élévateurs, transpalettes, grues mobiles, nacelles élévatrices et tout équipement nécessaire à la manutention de vos marchandises. La location longue durée vous offre la flexibilité d'un équipement récent et maintenu sans les contraintes de la propriété, avec des conditions adaptées à votre activité.",
    features: [
      "Chariots élévateurs et transpalettes",
      "Grues mobiles et nacelles élévatrices",
      "Location longue durée flexible",
      "Vente d'équipement neuf et récent",
      "Matériel de dernière génération",
      "Maintenance incluse en location",
      "Contrat ARS Rental",
      "Solutions adaptées à votre activité",
    ],
    highlights: [
      { title: "Longue durée", desc: "Vente ou location flexible" },
      { title: "Partenaire ARS Rental", desc: "Représentant exclusif Afrique de l'Ouest" },
      { title: "Maintenance", desc: "Incluse en location longue durée" },
    ],
  },
  {
    slug: "location-materiel-portuaire",
    icon: ShipIcon,
    title: "Location Matériel Portuaire",
    shortTitle: "Location Portuaire",
    desc: "Vente ou location longue durée de matériel portuaire pour vos opérations au Port de Dakar.",
    image: "/svc-maritime.jpg",
    longDesc:
      "2mails.pro, en tant que représentant d'ARS Rental en Afrique de l'Ouest, propose la vente ou la location longue durée de matériel portuaire de dernière génération. Notre offre couvre les grues de port, les reach stackers, les tracteurs portuaires, les chariots cavaliers et tout le matériel nécessaire à la manutention portuaire. Ces équipements sont indispensables pour les opérations de chargement et déchargement des navires, la manipulation des conteneurs et l'optimisation des flux dans les terminaux portuaires de Dakar.",
    features: [
      "Grues de port et reach stackers",
      "Tracteurs portuaires et chariots cavaliers",
      "Vente ou location longue durée",
      "Matériel portuaire de dernière génération",
      "Optimisation des opérations portuaires",
      "Maintenance et support technique",
      "Contrat ARS Rental",
      "Adapté au Port de Dakar",
    ],
    highlights: [
      { title: "Matériel portuaire", desc: "Grues, reach stackers, tracteurs" },
      { title: "Port de Dakar", desc: "Adapté aux opérations locales" },
      { title: "ARS Rental", desc: "Représentant officiel en Afrique de l'Ouest" },
    ],
  },
];

export const SERVICE_HIGHLIGHTS = [
  {
    img: "/truck.jpg",
    title: "Transport Routier",
    sub: "Vers Mali, Guinée, Mauritanie, Gambie",
  },
  {
    img: "/airfreight.jpg",
    title: "Fret Aérien",
    sub: "Solutions express & suivi dédié",
  },
  {
    img: "/hero-port.jpg",
    title: "Fret Maritime",
    sub: "FCL / LCL / groupage",
  },
];

export type Country = { name: string; base?: boolean };

export const COUNTRIES: Country[] = [
  { name: "Sénégal", base: true },
  { name: "Mali" },
  { name: "Guinée" },
  { name: "Guinée-Bissau" },
  { name: "Mauritanie" },
  { name: "Gambie" },
];

export type Stat = { value: string; label: string; icon: LucideIcon };

export const STATS: Stat[] = [
  { value: "2019", label: "Année de création", icon: Clock },
  { value: "5+", label: "Pays desservis", icon: Globe2 },
  { value: "5–20 ans", label: "Expérience des équipes", icon: Users },
  { value: "8", label: "Services spécialisés", icon: Route },
];

export type Atout = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const WHY_US: Atout[] = [
  {
    icon: Sparkles,
    title: "Approche proactive",
    desc: "Une solution sur mesure à chaque client, de l'origine jusqu'à la destination finale, avec anticipation des aléas.",
  },
  {
    icon: HandshakeIcon,
    title: "Sous-traitants agréés",
    desc: "Nous collaborons avec des partenaires validés selon des cahiers des charges avec obligations de part et d'autre.",
  },
  {
    icon: ShieldCheck,
    title: "Agréé en douane",
    desc: "Établissement de Transit et commissionnaire en Douane agréé, garantissant conformité et fiabilité.",
  },
  {
    icon: Users,
    title: "Équipes confirmées",
    desc: "Des collaborateurs qualifiés capitalisant entre 5 et 20 ans d'expérience en opérations nationales et internationales.",
  },
];

export type ProcessStep = { step: string; title: string; desc: string };

export const PROCESS: ProcessStep[] = [
  {
    step: "01",
    title: "Prise en charge",
    desc: "Analyse de votre besoin et élaboration d'une solution sur mesure, de l'origine à la destination.",
  },
  {
    step: "02",
    title: "Transit & Dédouanement",
    desc: "Gestion complète des formalités douanières et réglementaires par nos équipes agréées.",
  },
  {
    step: "03",
    title: "Transport & Manutention",
    desc: "Acheminement multimodal, manutention de colis lourds et suivi de la marchandise.",
  },
  {
    step: "04",
    title: "Livraison finale",
    desc: "Mise à disposition door-to-door avec confirmation de réception et clôture du dossier.",
  },
];

export const FAQS = [
  {
    q: "Quels types de marchandises 2mails.pro prend-elle en charge ?",
    a: "Nous traitons une large gamme de marchandises : conteneurisées, conventionnelles, colis lourds et hors gabarit, ainsi que les marchandises nécessitant un régime sous douane. Nos équipes adaptent les ressources à chaque type d'opération.",
  },
  {
    q: "Intervenez-vous dans les pays voisins du Sénégal ?",
    a: "Oui. Depuis Dakar, nous étendons nos opérations vers le Mali, la Guinée, la Guinée-Bissau, la Mauritanie et la Gambie, en transport routier et multimodal, avec un réseau de sous-traitants agréés.",
  },
  {
    q: "Êtes-vous agréés en tant que commissionnaire en douane ?",
    a: "Oui. 2mails.pro est un établissement de Transit et commissionnaire en Douane agréé. Nous gérons l'ensemble des formalités douanières import/export et les régimes particuliers.",
  },
  {
    q: "Comment obtenir un devis ?",
    a: "Utilisez le formulaire de contact de la page Contact ou écrivez-nous à contact@2mails.pro. Nos équipes vous répondront avec une proposition sur mesure dans les meilleurs délais.",
  },
];

// ---- Coordonnées de l'entreprise ----
export const COMPANY = {
  addressLine1: "Immeuble Kalimo Consulting Group",
  addressLine2: "Villa 2105, SICAP Liberté 1",
  city: "Dakar",
  country: "Sénégal",
  phone: "+221 33 864 52 41",
  phoneHref: "+221338645241",
  phoneSecondary: "+221 33 821 11 31",
  phoneSecondaryHref: "+221338211131",
  email: "contact@2mails.pro",
  founded: "2019",
};

// ---- Nos partenaires ----
export type Partner = {
  name: string;
  logo: string;
  role: string;
  description: string;
};

export const PARTNERS: Partner[] = [
  {
    name: "ARS Rental",
    logo: "/partner-ars-rental.png",
    role: "Représentant officiel en Afrique de l'Ouest",
    description:
      "Grâce à notre contrat de représentativité en Afrique de l'Ouest avec ARS Rental, nous sommes en mesure de fournir en location ou à la vente des engins et du matériel de manutention et transport de dernière génération.",
  },
];

// ---- Références clients ----
export type Reference = {
  name: string;
  logo: string;
  desc: string;
};

export const REFERENCES: Reference[] = [
  {
    name: "UNICEF",
    logo: "/ref-unicef.png",
    desc: "Fonds des Nations Unies pour l'enfance",
  },
  {
    name: "ITS Sénégal",
    logo: "/ref-its.png",
    desc: "Institut de Technologies du Sénégal",
  },
  {
    name: "Ministère de la Santé et de l'Hygiène Publique",
    logo: "/ref-mshp.jpg",
    desc: "Ministère de la Santé et de l'Hygiène Publique",
  },
  {
    name: "PATH International",
    logo: "/ref-path.png",
    desc: "Organisation mondiale de santé publique",
  },
];
