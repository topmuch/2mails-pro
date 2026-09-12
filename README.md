# 2mails.pro — CRM SaaS & Dashboard

Plateforme **2mails.pro** — CRM SaaS multi-tenant pour gérer vos clients, votre équipe, votre messagerie, vos statistiques et vos paramètres depuis un tableau de bord unifié.

Déploiement optimisé pour **Coolify** (ou tout environnement Docker).

---

## 🧱 Stack technique

- **Framework** : Next.js 16 (App Router, output `standalone`)
- **Langage** : TypeScript 5
- **UI** : Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Base de données** : SQLite (via Prisma ORM)
- **Auth** : Système maison (cookie httpOnly, hashing SHA-256+salt)
- **Runtime** : Bun (dev) / Node.js (prod, standalone)

## 📂 Structure

```
src/app/(public)/     # Pages publiques (Accueil, À propos, Services, Atouts, Contact)
src/app/dashboard/     # Tableau de bord admin (protégé par auth)
src/app/login/         # Page de connexion
src/app/api/           # API routes (contact, clients, team, seo, auth, dashboard)
src/components/        # Composants UI réutilisables
src/lib/              # Utilitaires (db, auth, site-data, utils)
prisma/               # Schéma de base de données
scripts/seed.ts       # Seed : crée l'admin + SEO par défaut
```

## 🚀 Déploiement sur Coolify

### Option A — Dockerfile (recommandé)

1. Dans Coolify : **New Resource → Application**
2. Connectez votre dépôt GitHub
3. Coolify détecte automatiquement le `Dockerfile`
4. Configurez les variables d'environnement (voir ci-dessous)
5. Ajoutez un **volume persistant** sur `/app/db` (pour la base SQLite)
6. Déployez 🎉

### Option B — Docker Compose

1. Dans Coolify : **New Resource → Docker Compose based**
2. Pointez vers le repo — Coolify utilise automatiquement `docker-compose.yml`
3. Le volume `twomails-db` est créé automatiquement
4. Configurez les variables d'environnement
5. Déployez

### Variables d'environnement (obligatoires en production)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `ADMIN_EMAIL` | Email du compte admin | `admin@2mails.pro` |
| `ADMIN_PASSWORD` | Mot de passe admin (**à changer !**) | `twomails2025` |
| `ADMIN_NAME` | Nom affiché de l'admin | `Admin 2mails.pro` |
| `TENANT_NAME` | Nom du tenant par défaut | `2mails.pro Demo` |
| `DATABASE_URL` | Chemin de la base SQLite | `file:/app/db/custom.db` |
| `NODE_ENV` | Environnement | `production` |
| `PORT` | Port d'écoute | `3000` |
| `HOSTNAME` | Host d'écoute | `0.0.0.0` |

### Volume persistant

La base de données SQLite est stockée dans `/app/db`. **Montez un volume persistant**
sur ce chemin pour conserver les données entre les redéploiements.

### Démarrage automatique

Au démarrage du conteneur, le script `start:prod` exécute séquentiellement :

1. `prisma db push` → crée/migre le schéma de base
2. `scripts/seed.ts` → crée l'utilisateur admin + SEO par défaut (idempotent)
3. `node server.js` → démarre le serveur Next.js standalone

## 💻 Développement local

```bash
# Installer les dépendances
bun install

# Générer le client Prisma
bun run db:generate

# Créer/migrer la base de données
bun run db:push

# Créer l'utilisateur admin (admin@2mails.pro / twomails2025)
bun run seed

# Lancer le serveur de développement
bun run dev
```

Le site est accessible sur http://localhost:3000

## 🔐 Accès au dashboard

1. Rendez-vous sur `/login`
2. Connectez-vous avec les identifiants admin
3. Accédez au dashboard : `/dashboard` (Clients, Équipe, Messages, SEO)

## 📜 Licence

© 2mails.pro — Tous droits réservés.
