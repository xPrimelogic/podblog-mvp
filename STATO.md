# PodBlog MVP - Stato Progetto

## Ultima modifica: 2026-02-16 19:48 UTC

---

## 📊 RIEPILOGO GENERALE

**Versione:** MVP Landing + Backend
**Deploy:** https://podblog-mvp.vercel.app
**Repository:** `/home/node/projects/podblog-mvp`
**Status:** 🟡 **AUTH DISABILITATO** - test feature core in corso

---

## ✅ COMPLETATO

### 1. Merge Landing Pages (16 Feb 15:49 UTC)
- ✅ Merge podblog-ai + podblog-mvp
- ✅ ROI Calculator interattivo
- ✅ Design system coerente (blue→purple gradient)
- ✅ 615 righe landing page completa

### 2. Fix SEO (16 Feb 16:44 UTC)
- ✅ Meta tags custom (title, description)
- ✅ JSON-LD Structured Data
- ✅ Open Graph + Twitter cards
- ✅ Favicon custom (gradient blu→purple)

### 3. Scout Report (16 Feb 16:40 UTC)
- ✅ Voto: 7.8/10 (→ target 9.5+)
- ✅ Lighthouse: 96/100

### 4. Database Supabase
- ✅ 4 tabelle operative (profiles, articles, subscriptions, usage)
- ✅ Test account: test-e2e@podblog.ai (verified)

### 5. Auth Disabilitato (16 Feb 19:18 UTC)
- ✅ Dopo 6 tentativi falliti, auth rimosso temporaneamente
- ✅ Dashboard accessibile direttamente senza login
- ✅ Banner warning "Testing Mode" visibile

### 6. Analisi Costi + Piano Ottimizzazione (16 Feb 19:42 UTC)
- ✅ Opus analysis: root cause $50 sforamento
- ✅ Piano implementato: batch spawn, 2-strike rule, compaction 50k
- ✅ SOUL.md aggiornato con regole budget
- ✅ Cost tracking attivo: `memory/costs-YYYY-MM-DD.json`

---

## 🟡 IN PROGRESS

### Test E2E Feature Core (PROSSIMO)
- ⏳ Upload YouTube
- ⏳ Deepgram transcription
- ⏳ GPT-4 content generation
- ⏳ Stripe checkout
- ⏳ Mobile responsive

---

## 🔴 BLOCCATO / DIFFERITO

### Auth Redirect Bug
- ❌ 6 tentativi falliti (8 ore, $43 spesi)
- ❌ Root cause: conflitto pacchetti Supabase + middleware issues
- 🟡 **SOLUZIONE:** Auth disabilitato temporaneamente per test feature
- 📅 **DIFFERITO:** Risoluzione auth a completamento test core

---

## 📁 STRUTTURA PROGETTO

```
/home/node/projects/podblog-mvp/
├── app/
│   ├── page.tsx                  # Landing (615 righe, ROI calc)
│   ├── layout.tsx                # Meta tags SEO + JSON-LD
│   ├── login/page.tsx            # ⚠️ Auth disabilitato
│   ├── signup/page.tsx           # ⚠️ Auth disabilitato
│   ├── dashboard/
│   │   ├── page.tsx              # ✅ Accessibile senza auth
│   │   ├── layout.tsx            # ⚠️ Auth check rimosso
│   │   └── article/[id]/page.tsx
│   ├── actions/
│   │   └── auth.ts               # Server Action (non usato)
│   └── api/
│       ├── upload/route.ts       # Upload episodi
│       ├── process/route.ts      # Deepgram + GPT-4 pipeline
│       └── create-checkout/route.ts  # Geo-pricing Stripe
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient (SSR)
│   │   ├── server.ts
│   │   └── middleware.ts         # ⚠️ Disabilitato (matcher: [])
│   └── geo-pricing.ts            # Multi-region Stripe
├── public/
│   ├── favicon.svg               # ✅ Custom icon
│   └── og-image.png              # ✅ OG image 1200x630
├── STATO.md                      # Questo file
├── COST_ANALYSIS_OPUS.md         # Analisi costi dettagliata
└── TEST_E2E_*.md                 # Report test (tutti falliti su auth)
```

---

## 🔧 CONFIGURAZIONE

### Environment Variables (Vercel)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY
- ✅ DEEPGRAM_API_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ 9 Stripe price IDs (EUR/USD/LATAM)

---

## 📊 METRICHE

### Costi AI
- **Oggi:** $50 ($43 Sonnet + $3.4 Opus + $3.5 Haiku)
- **Budget:** $11/giorno
- **Sforamento:** 5x (500%)
- **Target domani:** $11 con ottimizzazioni (-78%)

### Performance
- Lighthouse: 96/100
- SEO: 100/100
- Accessibility: 87/100

---

## 🎯 PROSSIMI STEP

### Priorità 1: Test E2E Feature Core (DOMANI)
1. Upload YouTube (19s video test)
2. Verifica Deepgram transcription
3. Verifica GPT-4 article generation
4. Test Stripe checkout
5. Mobile responsive check

**Budget max:** $5 (1 spawn Operator Haiku)

### Priorità 2: Fix Auth (DOPO test core)
**Opzioni:**
- A) Switch a Clerk ($25/mese)
- B) Downgrade Next.js 15.x
- C) Riscrivere auth custom

**Decisione:** Biso dopo vedere MVP funzionante

### Priorità 3: Scout Re-test (SE MVP OK)
- Lanciare Scout per nuovo voto post-fix SEO
- Target: >= 9.5/10

---

## ⚠️ ISSUE NOTI

### 🔴 CRITICO
**Auth non funziona** - Disabilitato temporaneamente

### 🟡 MEDIO
**Scout voto 7.8/10** - SEO fix applicati, atteso nuovo voto

### 🟢 RISOLTO
**Costi fuori controllo** - Piano ottimizzazione implementato

---

## 💰 BUDGET RULES (NUOVE - 16 Feb)

### Hard Limits
- Budget: $11/giorno
- Hard cap: STOP a $11
- Soft cap: Conferma Biso a $8
- Alert: Ogni $5

### Regole Operative
- **Batch spawn obbligatorio** (no 1 spawn per fix)
- **2-Strike Rule** (stop dopo 2 retry)
- **Compaction 50k** (non 200k)
- **Haiku-first** (Sonnet solo per complex)

### Cost Tracking
`/home/node/.openclaw/workspace-strategist/memory/costs-YYYY-MM-DD.json`

---

## 📝 DECISIONI IMPORTANTI

1. **Auth disabilitato temporaneamente** per sbloccare test feature core
2. **Budget ottimizzato** con regole Opus: batch spawn, 2-strike, Haiku-first
3. **Test E2E priorità** su fix auth (validare feature prima di sistemare accesso)

---

**Ultimo aggiornamento:** 2026-02-16 19:48 UTC
**Prossimo update:** Dopo test E2E feature core (domani)
**Responsabile:** Strategist (PM)
**Budget residuo oggi:** $0 (usato $50/$11)
**Budget domani:** $11 fresh start
