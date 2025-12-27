# AdSpark AI - UGC Ad Creator

Eine produktionsreife SaaS-Anwendung, die automatisch professionelle UGC-Videoanzeigen (TikTok/Reels/Shorts) aus Produktinformationen erstellt.

## Features

- **AI-Generierung**: Hooks, Skripte, Shotlist, Voiceover, Untertitel, CTAs
- **Multi-Tenant**: Teams, Brands, Rollen (Owner/Admin/Member)
- **Credit-System**: Abonnements + Credit-Pakete via Stripe
- **Template-Library**: Vorlagen nach Branchen
- **Export**: JSON, Markdown, SRT, TXT + Copy-to-Clipboard
- **DSGVO-freundlich**: Minimales Tracking, klare Consent-Flows

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js Route Handlers + BullMQ Worker
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Auth**: NextAuth.js (Email + Google OAuth)
- **Payments**: Stripe (Subscriptions + Credit Packs)
- **Queue**: BullMQ + Redis
- **AI**: Google Gemini API

## Schnellstart

### Voraussetzungen

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Stripe Account
- Google Cloud Console (fuer OAuth)
- Gemini API Key

### 1. Repository klonen

```bash
git clone <repository-url>
cd AI-UGC-Ad-Creator
```

### 2. Abhaengigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Bearbeite `.env` und fuege deine Keys ein:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/adspark_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# Redis
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Datenbank einrichten

```bash
# Datenbank-Schema erstellen
npm run db:push

# Seed-Daten einfuegen (Templates + Demo-Daten)
npm run db:seed
```

### 5. Anwendung starten

```bash
# Entwicklungsserver starten
npm run dev

# In einem separaten Terminal: Worker starten
npm run worker
```

Die Anwendung ist jetzt unter `http://localhost:3000` erreichbar.

## Docker Compose (Alternative)

```bash
# Postgres + Redis starten
docker-compose up -d postgres redis

# Anwendung lokal starten
npm run dev
```

Oder komplett mit Docker:

```bash
docker-compose up -d
```

## Stripe Setup

### 1. Produkte erstellen

Im Stripe Dashboard:

1. **Subscriptions** (Products > Add Product):
   - Starter: 29 EUR/Monat
   - Professional: 79 EUR/Monat
   - Agency: 199 EUR/Monat

2. **Credit Packs** (One-time):
   - Small: 50 Credits fuer 9,90 EUR
   - Medium: 150 Credits fuer 24,90 EUR
   - Large: 500 Credits fuer 69,90 EUR

### 2. Price IDs in .env eintragen

```env
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."
STRIPE_CREDITS_SMALL_PRICE_ID="price_..."
STRIPE_CREDITS_MEDIUM_PRICE_ID="price_..."
STRIPE_CREDITS_LARGE_PRICE_ID="price_..."
```

### 3. Webhook einrichten

```bash
# Lokal mit Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Das angezeigte Secret in .env eintragen
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Events die behandelt werden:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Google OAuth Setup

1. Gehe zur [Google Cloud Console](https://console.cloud.google.com)
2. Erstelle ein neues Projekt oder waehle ein bestehendes
3. Aktiviere die Google+ API
4. Erstelle OAuth 2.0 Credentials
5. Fuege Redirect URIs hinzu:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

## Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Geschuetzte Seiten
│   │   ├── dashboard/
│   │   ├── generator/
│   │   ├── brands/
│   │   ├── billing/
│   │   └── layout.tsx
│   ├── auth/               # Auth-Seiten
│   ├── api/                # API Routes
│   │   ├── auth/
│   │   ├── brands/
│   │   ├── generations/
│   │   ├── billing/
│   │   └── webhooks/
│   └── page.tsx            # Landing Page
├── components/
│   ├── ui/                 # shadcn/ui Komponenten
│   ├── dashboard/          # Dashboard-Komponenten
│   └── generator/          # Generator-Komponenten
├── lib/
│   ├── ai/                 # AI/Gemini Integration
│   │   ├── gemini.ts
│   │   ├── pipeline.ts
│   │   └── prompts.ts
│   ├── queue/              # BullMQ Queue
│   ├── validations/        # Zod Schemas
│   ├── auth.ts             # NextAuth Konfiguration
│   ├── db.ts               # Prisma Client
│   ├── stripe.ts           # Stripe Integration
│   └── utils.ts            # Hilfsfunktionen
├── hooks/                  # React Hooks
├── types/                  # TypeScript Types
└── __tests__/              # Vitest Tests

prisma/
├── schema.prisma           # Datenbankschema
└── seed.ts                 # Seed-Daten
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrierung
- `GET/POST /api/auth/[...nextauth]` - NextAuth

### Brands
- `GET /api/brands` - Alle Brands
- `POST /api/brands` - Brand erstellen
- `GET /api/brands/[id]` - Brand Details
- `PATCH /api/brands/[id]` - Brand aktualisieren
- `DELETE /api/brands/[id]` - Brand loeschen
- `GET /api/brands/[id]/products` - Produkte einer Brand
- `POST /api/brands/[id]/products` - Produkt erstellen

### Generations
- `GET /api/generations` - Alle Generierungen
- `POST /api/generations` - Neue Generierung starten
- `GET /api/generations/[id]/status` - Status abfragen
- `POST /api/generations/[id]/regenerate` - Abschnitt regenerieren

### Billing
- `POST /api/billing/checkout` - Checkout Session
- `POST /api/billing/portal` - Customer Portal
- `POST /api/webhooks/stripe` - Stripe Webhook

## Tests

```bash
# Alle Tests ausfuehren
npm test

# Tests einmalig ausfuehren
npm run test:run
```

## Deployment

### Vercel

1. Repository mit Vercel verbinden
2. Umgebungsvariablen setzen
3. Build Command: `npm run build`
4. Output Directory: `.next`

### Selfhost (Docker)

```bash
# Image bauen
docker build -t adspark-ai .

# Container starten
docker run -p 3000:3000 --env-file .env adspark-ai
```

## Credit-System

| Aktion | Credits |
|--------|---------|
| Creative Pack (komplett) | 10 |
| Hooks regenerieren | 2 |
| Skripte regenerieren | 3 |
| Andere Abschnitte regenerieren | 1 |

## Definition of Done Checkliste

- [x] Benutzerregistrierung und Login (Email + Google)
- [x] Team/Brand-Management
- [x] AI-Generierung (Hooks, Skripte, Shotlist, etc.)
- [x] Credit-System und Abrechnungen
- [x] Stripe Integration (Subscriptions + Payments)
- [x] Template-Library mit Branchen-Vorlagen
- [x] Export-Funktionen (JSON, Markdown, SRT)
- [x] Responsive Dashboard UI
- [x] Queue-basierte Verarbeitung
- [x] Unit Tests (5+ kritische Tests)
- [x] Docker Compose Setup
- [x] Dokumentation

## Lizenz

Proprietaer - Alle Rechte vorbehalten.
