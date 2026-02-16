# PodBlog AI MVP

SaaS che trasforma podcast in articoli SEO-optimized usando AI.

## 🚀 Stack Tecnologico

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL + Storage), Next.js API routes
- **AI:** OpenAI API (coming soon)
- **Payment:** Stripe (coming soon)
- **Deploy:** Vercel + GitHub

## 📋 Prerequisiti

- Node.js 18+
- Account Supabase
- Account Vercel (per deploy)
- Account GitHub

## 🛠️ Setup Locale

### 1. Clone e installa dipendenze

```bash
git clone https://github.com/[your-username]/podblog-mvp.git
cd podblog-mvp
npm install
```

### 2. Configura Supabase

#### A) Crea progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto: "podblog-mvp"
3. Region: Europe (Frankfurt)
4. Genera password DB sicura

#### B) Esegui schema database

1. Vai su **SQL Editor** nel dashboard Supabase
2. Copia tutto il contenuto di `SUPABASE_SETUP.sql`
3. Esegui lo script
4. Verifica che le tabelle siano create: `profiles`, `subscriptions`, `articles`, `usage`

#### C) Ottieni credenziali API

1. Vai su **Project Settings** → **API**
2. Copia:
   - `URL` (Project URL)
   - `anon public` key
   - `service_role` key (sotto "Service role")

### 3. Configura variabili d'ambiente

Crea file `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OpenAI (per dopo)
OPENAI_API_KEY=

# Stripe (per dopo)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### 4. Avvia dev server

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 📁 Struttura Progetto

```
podblog-mvp/
├── app/
│   ├── login/          # Pagina login
│   ├── signup/         # Pagina registrazione
│   ├── dashboard/      # Dashboard utente (protetta)
│   │   ├── layout.tsx  # Layout con navbar + auth check
│   │   └── page.tsx    # Home dashboard
│   ├── auth/
│   │   └── signout/    # Route logout
│   ├── page.tsx        # Landing page
│   └── layout.tsx      # Root layout
├── lib/
│   └── supabase/
│       ├── client.ts      # Client Supabase (browser + server)
│       └── middleware.ts  # Middleware auth
├── components/
│   └── ui/             # shadcn/ui components
├── middleware.ts       # Next.js middleware (auth)
├── DATABASE.md         # Documentazione schema DB
├── SUPABASE_SETUP.sql  # SQL setup completo
└── .env.local          # Env variables (NON committare!)
```

## 🗄️ Database Schema

Vedi `DATABASE.md` per documentazione completa.

**Tabelle principali:**
- `profiles` - Profili utente
- `subscriptions` - Abbonamenti (Stripe integration)
- `articles` - Articoli generati
- `usage` - Tracking mensile per limiti

**Features:**
- Row Level Security (RLS) abilitato
- Trigger automatico per creazione profilo + trial su signup
- Indexes per performance

## 🔐 Autenticazione

- **Signup:** `/signup` - Crea account con email/password
- **Login:** `/login` - Accedi
- **Dashboard:** `/dashboard` - Protetto da middleware (solo autenticati)
- **Logout:** POST a `/auth/signout`

**Flow:**
1. User fa signup → Supabase crea user in `auth.users`
2. Trigger automatico crea:
   - Row in `profiles`
   - Subscription in stato "trialing" (7 giorni)
   - Row in `usage` per mese corrente (limit 12 articoli)
3. User vede dashboard con info piano e usage

## 🚀 Deploy

### Deploy su Vercel

```bash
# Collega a Vercel
vercel

# Aggiungi env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Deploy production
vercel --prod
```

### Configura Supabase per produzione

1. Vai su Supabase **Authentication** → **URL Configuration**
2. Aggiungi alla **Redirect URLs**:
   - `https://[your-app].vercel.app/auth/callback`
   - `https://[your-app].vercel.app/dashboard`

## ✅ Testing

### Test manuale completo

1. **Signup:**
   - Vai su `/signup`
   - Registra nuovo account
   - Controlla email (se email confirmation abilitata)
   - Verifica redirect a `/dashboard`

2. **Dashboard:**
   - Verifica nome utente visibile
   - Verifica piano "Starter" e status "Trial attivo"
   - Verifica "Articoli questo mese: 0 / 12"
   - Verifica data scadenza trial (7 giorni da oggi)

3. **Logout:**
   - Click "Logout"
   - Verifica redirect a `/login`
   - Prova ad accedere a `/dashboard` → dovrebbe redirectare a `/login`

4. **Login:**
   - Vai su `/login`
   - Accedi con credenziali create
   - Verifica redirect a `/dashboard`

5. **RLS (Database):**
   - Crea secondo utente
   - Verifica che User A non veda dati di User B nel SQL Editor

### Verifica database

```sql
-- Dopo signup, controlla che i dati siano creati:
SELECT * FROM auth.users WHERE email = 'test@example.com';
SELECT * FROM public.profiles WHERE email = 'test@example.com';
SELECT * FROM public.subscriptions WHERE user_id = '[user-id]';
SELECT * FROM public.usage WHERE user_id = '[user-id]';
```

## 📝 TODO (Prossimi step)

- [ ] Upload podcast (URL + file)
- [ ] Integrazione OpenAI per trascrizione + generazione articolo
- [ ] Storage Supabase per file audio
- [ ] Integrazione Stripe per pagamenti
- [ ] Webhook Stripe per aggiornare subscriptions
- [ ] Dashboard articoli (lista + dettaglio)
- [ ] Export articolo (Markdown, HTML)
- [ ] Settings utente
- [ ] Admin panel

## 🐛 Troubleshooting

### Errore "Invalid API key"
- Controlla che le env vars siano configurate correttamente
- Verifica che Supabase URL sia corretto

### Redirect loop su /dashboard
- Controlla che middleware.ts sia configurato
- Verifica che session sia valida (prova a fare logout e re-login)

### RLS policies bloccano query
- Verifica che l'utente sia autenticato
- Controlla policies in Supabase Table Editor

### Build error con auth-helpers
- `@supabase/auth-helpers-nextjs` è deprecato
- Considera migrazione a `@supabase/ssr` (future update)

## 📄 Licenza

Proprietario - PodBlog AI (2026)

## 🤝 Contatti

Per domande: [your-email@example.com]

---

**Status:** MVP Day 1-2 ✅ (Setup + Auth + Database)  
**Next:** Day 3-4 (Upload + AI Processing)
# Testing hook
