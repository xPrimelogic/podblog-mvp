# PodBlog AI - Database Schema

## Panoramica

Il database utilizza PostgreSQL tramite Supabase con Row Level Security (RLS) abilitato per proteggere i dati degli utenti.

## Tabelle

### 1. `profiles`

Estende la tabella `auth.users` di Supabase con informazioni aggiuntive del profilo utente.

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campi:**
- `id`: UUID univoco (FK a auth.users)
- `email`: Email dell'utente (unique)
- `full_name`: Nome completo
- `avatar_url`: URL avatar (futuro)
- `created_at`, `updated_at`: Timestamp

**RLS Policies:**
- Users can view own profile
- Users can update own profile

---

### 2. `subscriptions`

Gestisce gli abbonamenti e i piani degli utenti (integrazione Stripe).

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'trialing',
  plan_name TEXT NOT NULL DEFAULT 'starter',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campi:**
- `id`: UUID univoco
- `user_id`: FK a profiles
- `stripe_customer_id`: ID cliente Stripe (unique)
- `stripe_subscription_id`: ID subscription Stripe (unique)
- `status`: Stato abbonamento (trialing, active, canceled, past_due)
- `plan_name`: Nome piano (starter = €19/mese)
- `trial_end`: Fine periodo trial (7 giorni)
- `cancel_at_period_end`: Se cancellare a fine periodo

**RLS Policies:**
- Users can view own subscription

---

### 3. `articles`

Articoli generati dai podcast.

```sql
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  podcast_url TEXT,
  podcast_file_path TEXT,
  transcript TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  word_count INTEGER,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campi:**
- `id`: UUID univoco
- `user_id`: FK a profiles
- `title`: Titolo articolo
- `podcast_url`: URL podcast originale (opzionale)
- `podcast_file_path`: Path in Supabase Storage
- `transcript`: Trascrizione del podcast
- `content`: Articolo SEO finale
- `status`: pending, processing, completed, failed
- `word_count`: Conteggio parole
- `processing_started_at`, `processing_completed_at`: Timestamp elaborazione
- `error_message`: Messaggio errore (se failed)

**Indexes:**
- `idx_articles_user_id` su `user_id`
- `idx_articles_status` su `status`

**RLS Policies:**
- Users can view/edit/delete own articles

---

### 4. `usage`

Traccia l'uso mensile per limiti di billing.

```sql
CREATE TABLE public.usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  articles_generated INTEGER DEFAULT 0,
  articles_limit INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);
```

**Campi:**
- `id`: UUID univoco
- `user_id`: FK a profiles
- `period_start`, `period_end`: Inizio/fine periodo (mese)
- `articles_generated`: Articoli generati questo mese
- `articles_limit`: Limite mensile (12 per starter)

**Constraint:**
- UNIQUE su (user_id, period_start) - una sola riga per user per mese

**Index:**
- `idx_usage_user_period` su (user_id, period_start)

**RLS Policies:**
- Users can view own usage

---

## Trigger automatici

### `handle_new_user()`

Eseguito automaticamente alla registrazione di un nuovo utente (AFTER INSERT su auth.users).

**Azioni:**
1. Crea row in `profiles` con email e full_name
2. Crea subscription in stato "trialing" con trial_end = NOW() + 7 giorni
3. Crea row in `usage` per il mese corrente con limit 12

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.subscriptions (user_id, status, trial_end)
  VALUES (NEW.id, 'trialing', NOW() + INTERVAL '7 days');
  
  INSERT INTO public.usage (user_id, period_start, period_end)
  VALUES (
    NEW.id,
    DATE_TRUNC('month', NOW()),
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::DATE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato. Gli utenti possono vedere/modificare **solo i propri dati**.

### Esempio Policy

```sql
CREATE POLICY "Users can view own profile" 
  ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);
```

`auth.uid()` restituisce l'ID dell'utente autenticato corrente.

---

## Setup Supabase

### 1. Crea progetto
- Vai su [supabase.com](https://supabase.com)
- New Project: "podblog-mvp"
- Region: Europe (Frankfurt)
- Genera password DB sicura

### 2. Esegui SQL
- Vai su SQL Editor
- Copia tutto il contenuto SQL (vedi STEP 3 del task)
- Esegui

### 3. Verifica
- Vai su Table Editor
- Dovresti vedere: profiles, subscriptions, articles, usage
- Controlla che RLS sia abilitato (icona lucchetto)

### 4. Ottieni credenziali
- Project Settings → API
- Copia:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (sotto "Service role")

### 5. Configura .env.local
Incolla le credenziali nel file `.env.local`

---

## Test manuali

### Test 1: Signup crea dati
```sql
-- Dopo signup, verifica:
SELECT * FROM auth.users WHERE email = 'test@example.com';
SELECT * FROM public.profiles WHERE email = 'test@example.com';
SELECT * FROM public.subscriptions WHERE user_id = '[user-id]';
SELECT * FROM public.usage WHERE user_id = '[user-id]';
```

### Test 2: RLS funziona
```sql
-- Prova a fare query come user diverso - dovrebbe fallire o restituire vuoto
```

---

## Prossimi passi

1. **Stripe Integration**: Aggiungere webhook per aggiornare subscriptions
2. **Storage**: Configurare bucket per upload podcast
3. **Migrations**: Creare sistema di migration per future modifiche schema
4. **Backup**: Configurare backup automatici (Supabase Pro)

---

## Note tecniche

- **UUID Extension**: Necessaria per uuid_generate_v4()
- **SECURITY DEFINER**: Il trigger handle_new_user() gira con permessi elevati per inserire in tabelle protette da RLS
- **Timestamps**: Tutti in UTC con `TIMESTAMP WITH TIME ZONE`
- **Cascade Delete**: Se elimini un user, vengono eliminati tutti i suoi dati correlati

---

**Ultimo aggiornamento:** 2026-02-14
