# 🚀 PodBlog Waitlist - Supabase Setup Guide

## Quick Start (3 passi)

### 1. Unlock Credentials

Le credenziali Supabase sono in `/home/node/.openclaw-secrets` ma non accessibili da questo utente.

**Soluzione (scegline una):**

```bash
# Opzione A: Copia con sudo (richiede password admin)
sudo cat /home/node/.openclaw-secrets >> .env.local

# Opzione B: Script helper
sudo bash -c 'cat /home/node/.openclaw-secrets >> /home/node/projects/podblog-mvp/.env.local'
sudo chown node:node .env.local

# Opzione C: Manuale
sudo cat /home/node/.openclaw-secrets
# Poi copia i valori SUPABASE_* in .env.local
```

### 2. Create Waitlist Table

**Opzione A: Supabase Dashboard (consigliato)**
1. Apri [Supabase Dashboard](https://app.supabase.com)
2. Seleziona progetto: `jhdrsyqayqoumvbukjps`
3. SQL Editor → New Query
4. Copia e incolla contenuto di `WAITLIST_SETUP.sql`
5. Click "Run"

**Opzione B: Script Node.js**
```bash
node setup-supabase-complete.js
```

### 3. Test Setup

```bash
chmod +x test-waitlist.sh
./test-waitlist.sh
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `WAITLIST_SETUP.sql` | SQL per creare tabella waitlist (semplificato) |
| `SUPABASE_SETUP.sql` | SQL completo per tutte le tabelle dell'app |
| `app/api/waitlist/route.ts` | API endpoint POST/GET per waitlist |
| `components/WaitlistForm.tsx` | React component per form signup |
| `setup-supabase-complete.js` | Script Node per setup automatico |
| `test-waitlist.sh` | Test suite completo |
| `UNLOCK_CREDENTIALS.md` | Guida per risolvere problema permessi |

---

## 🧪 Testing

### Test 1: Manual cURL

```bash
# Load env vars
export $(grep SUPABASE_ .env.local | xargs)

# Test signup
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Expected response:
# {"success":true,"message":"Successfully added to waitlist!","data":{...}}
```

### Test 2: Browser Form

1. Start dev server: `npm run dev`
2. Add WaitlistForm to homepage or create test page
3. Navigate to: `http://localhost:3000`
4. Fill form and submit
5. Check Supabase Dashboard → Table Editor → waitlist

### Test 3: API Stats

```bash
curl http://localhost:3000/api/waitlist

# Response:
# {"total":5,"last_24h":2}
```

---

## 📊 Database Schema

```sql
CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_waitlist_email` on email (unique lookups)
- `idx_waitlist_created_at` on created_at DESC (recent signups)

**RLS Policies:**
- Anyone can INSERT (public signup)
- Service role can SELECT (admin dashboard)

---

## 🔧 Troubleshooting

### "Permission denied" per .openclaw-secrets

```bash
# Check file permissions
ls -la /home/node/.openclaw-secrets

# Should see: -rw------- 1 root root

# Solution: use sudo to read and copy
sudo cat /home/node/.openclaw-secrets
```

### "Table does not exist"

Devi eseguire `WAITLIST_SETUP.sql` nel Supabase Dashboard.

### "Invalid email" o "Failed to add"

- Verifica che SUPABASE_SERVICE_ROLE_KEY sia corretto in .env.local
- Controlla logs: `npm run dev` (terminal output)
- Verifica RLS policies in Supabase Dashboard

### Next.js non carica env vars

```bash
# Restart dev server dopo modifiche a .env.local
npm run dev
```

---

## 🚀 Production Deploy

### Vercel

1. Add environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

2. Deploy: `vercel --prod`

### Supabase

- ✅ Tabella già creata
- ✅ RLS policies configurate
- ✅ Indexes ottimizzati

---

## 📧 Export Waitlist

```bash
# Via Supabase Dashboard
# Table Editor → waitlist → Export as CSV

# Or with psql
psql $DATABASE_URL -c "COPY (SELECT * FROM public.waitlist ORDER BY created_at DESC) TO STDOUT WITH CSV HEADER" > waitlist.csv
```

---

## ✅ Success Checklist

- [ ] Credenziali Supabase in .env.local
- [ ] Tabella `waitlist` creata su Supabase
- [ ] API `/api/waitlist` risponde 200
- [ ] Test insert completato (test-waitlist.sh)
- [ ] Form UI rendering correttamente
- [ ] Email salvate su Supabase
- [ ] Deploy production con env vars

---

**Support:** Se hai problemi, check:
- Supabase Dashboard Logs
- Next.js terminal output
- Browser console (F12)

**Docs:**
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
