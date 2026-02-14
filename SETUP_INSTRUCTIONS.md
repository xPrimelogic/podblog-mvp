# 🚀 PodBlog MVP - Setup Instructions

## ⚠️ IMPORTANTE: Prima di tutto, configura Supabase!

Il deploy su Vercel è già stato fatto, ma **l'app NON funzionerà** finché non configuri Supabase e aggiungi le credenziali.

---

## STEP 1: Crea Progetto Supabase

### A) Vai su [supabase.com](https://supabase.com)

1. Fai login (o crea account se non ce l'hai)
2. Click su "New Project"
3. Compila:
   - **Name:** `podblog-mvp`
   - **Database Password:** Genera una password sicura (salvala!)
   - **Region:** Europe (Frankfurt) o più vicina a te
   - **Pricing Plan:** Free (per ora)
4. Click "Create new project"
5. **Aspetta 2-3 minuti** che il database sia pronto

---

## STEP 2: Esegui Schema Database

### A) Apri SQL Editor

1. Nel dashboard Supabase, vai su **SQL Editor** (icona nella sidebar)
2. Click su "+ New query"

### B) Copia e incolla tutto il contenuto di `SUPABASE_SETUP.sql`

Apri il file `SUPABASE_SETUP.sql` nel progetto e copia TUTTO il contenuto.

### C) Esegui lo script

1. Incolla tutto nel SQL Editor
2. Click su "Run" (o Ctrl+Enter)
3. Dovresti vedere: "Success. No rows returned"

### D) Verifica che sia andato tutto bene

1. Vai su **Table Editor** nella sidebar
2. Dovresti vedere 4 tabelle:
   - `profiles`
   - `subscriptions`
   - `articles`
   - `usage`
3. Click su una tabella e verifica che ci sia l'icona del lucchetto 🔒 (RLS abilitato)

---

## STEP 3: Ottieni Credenziali Supabase

### A) Vai su Project Settings → API

1. Click sull'icona ingranaggio in basso a sinistra
2. Vai su **API**

### B) Copia questi 3 valori:

**1. Project URL:**
```
https://[your-project-ref].supabase.co
```

**2. anon public key:**
```
eyJhbGc....[lungo token]
```

**3. service_role key:**  
(Clicca su "Reveal" accanto a "service_role" sotto "Project API keys")
```
eyJhbGc....[altro lungo token]
```

⚠️ **IMPORTANTE:** Il service_role key è sensibile! Non committarlo su Git!

---

## STEP 4: Configura Vercel Environment Variables

### A) Vai su Vercel Dashboard

1. Apri [vercel.com/dashboard](https://vercel.com/dashboard)
2. Trova il progetto "podblog-mvp"
3. Click sul progetto

### B) Vai su Settings → Environment Variables

1. Click su "Settings" in alto
2. Click su "Environment Variables" nella sidebar

### C) Aggiungi le 3 variabili

Per **ognuna** di queste variabili:
- Click "Add New"
- Compila Name e Value
- Seleziona **Production**, **Preview**, **Development** (tutti e 3!)
- Click "Save"

**Variabile 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [il tuo Project URL da Supabase]
```

**Variabile 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [il tuo anon public key]
```

**Variabile 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [il tuo service_role key]
```

---

## STEP 5: Redeploy su Vercel

### Opzione A: Redeploy automatico (consigliato)

1. Vai su "Deployments" nel dashboard Vercel
2. Trova il deployment più recente
3. Click sui 3 puntini → "Redeploy"
4. Conferma

### Opzione B: Forzare rebuild (alternativa)

1. Fai un piccolo cambiamento nel codice (es: aggiungi uno spazio in README.md)
2. Commit e push:
   ```bash
   git add .
   git commit -m "Trigger rebuild"
   git push
   ```
3. Vercel ricostruirà automaticamente

---

## STEP 6: Testa l'applicazione!

### A) Apri l'URL di produzione

Il tuo URL Vercel è probabilmente qualcosa come:
```
https://podblog-[random].vercel.app
```

Trovi l'URL esatto in:
- Dashboard Vercel → Deployments → Click sul deployment → "Visit"

### B) Test completo

**1. Signup:**
- Vai su `/signup`
- Registra un nuovo account (usa una tua email vera)
- Se ricevi errore "Invalid API key" → env vars non configurate correttamente

**2. Email confirmation (se abilitata):**
- Controlla la tua email
- Click sul link di conferma
- Torna al sito

**3. Login:**
- Vai su `/login`
- Accedi con le credenziali
- Dovresti essere redirectato a `/dashboard`

**4. Dashboard:**
- Verifica che vedi:
  - Il tuo nome o email
  - Piano "Starter"
  - Status "Trial attivo"
  - "Articoli questo mese: 0 / 12"
  - Data scadenza trial (7 giorni da oggi)

**5. Logout:**
- Click su "Logout"
- Verifica redirect a `/login`
- Prova ad accedere manualmente a `/dashboard` → dovrebbe redirectarti a `/login`

---

## STEP 7: (Opzionale) Disabilita Email Confirmation

Se vuoi testare più velocemente senza dover confermare l'email:

### A) Vai su Supabase → Authentication → Settings

1. Nella sidebar, click su **Authentication**
2. Click su **Settings** (sotto Authentication)

### B) Trova "Email Confirmation"

Scrolla fino a vedere "Email Confirmation" o "Confirm email"

### C) Disabilita

- Toggle OFF l'opzione "Enable email confirmations"
- Click "Save"

Ora i nuovi utenti potranno accedere immediatamente dopo il signup.

---

## STEP 8: Verifica Database (avanzato)

### Nel Supabase Table Editor:

**1. Controlla `profiles`:**
```sql
SELECT * FROM public.profiles;
```
Dovresti vedere il tuo profilo creato.

**2. Controlla `subscriptions`:**
```sql
SELECT * FROM public.subscriptions WHERE user_id = '[your-user-id]';
```
Dovresti vedere:
- status: "trialing"
- plan_name: "starter"
- trial_end: (data 7 giorni nel futuro)

**3. Controlla `usage`:**
```sql
SELECT * FROM public.usage WHERE user_id = '[your-user-id]';
```
Dovresti vedere:
- articles_generated: 0
- articles_limit: 12

**4. Testa RLS:**
- Crea un secondo utente
- Prova a vedere i dati del primo utente → non dovrebbe funzionare (RLS blocca)

---

## ✅ Checklist Finale

Prima di considerare il setup completo:

- [ ] Database schema applicato su Supabase
- [ ] Verifica 4 tabelle create (profiles, subscriptions, articles, usage)
- [ ] RLS abilitato su tutte le tabelle (icona lucchetto)
- [ ] Credenziali Supabase ottenute (URL + 2 keys)
- [ ] Env vars configurate su Vercel (3 variabili)
- [ ] Redeploy su Vercel fatto
- [ ] Signup funziona (crea account test)
- [ ] Login funziona
- [ ] Dashboard mostra dati corretti
- [ ] Logout funziona
- [ ] Verifica database: profile, subscription e usage creati

---

## 🐛 Troubleshooting

### "Invalid API key" o "supabaseUrl is required"
→ Env vars non configurate su Vercel. Torna a STEP 4.

### "User already registered" ma non riesco a fare login
→ Probabilmente hai email confirmation abilitata. Controlla email o disabilita (STEP 7).

### Dashboard mostra "null" o dati vuoti
→ Trigger handle_new_user() non è stato eseguito. Controlla SQL Editor per errori.

### Redirect loop su /dashboard
→ Session non valida. Prova a:
1. Logout
2. Clear cookies del browser
3. Login di nuovo

### Build error su Vercel
→ Controlla Vercel logs: Deployments → Click sul deployment → "Building" → Vedi errori

---

## 📞 Supporto

Se qualcosa non funziona:

1. **Controlla Vercel logs**: Dashboard → Deployments → [latest] → View Function Logs
2. **Controlla Supabase logs**: Dashboard → Logs Explorer
3. **Controlla browser console**: F12 → Console (cerca errori rossi)

---

## 🎉 Prossimi step (dopo setup)

Una volta che tutto funziona:

- [ ] Configurare custom domain su Vercel (opzionale)
- [ ] Aggiungere OpenAI API key (per Day 3-4)
- [ ] Configurare Stripe per pagamenti (Day 5-6)
- [ ] Setup Supabase Storage per upload podcast

---

**Status:** Setup Instructions Complete ✅  
**Creato:** 2026-02-14

Buon lavoro! 🚀
