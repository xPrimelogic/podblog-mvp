# Opus Post-Mortem - Auth Failure Analysis

> Analisi: 2026-02-16 | Stack: Next.js 16.1.6, @supabase/ssr 0.9.0-rc.2, Vercel

---

## Perché createBrowserClient è fallito

### Ipotesi 1 (ALTA PROBABILITÀ): Conflitto con @supabase/auth-helpers-nextjs

Il `package.json` include **sia** `@supabase/auth-helpers-nextjs` (^0.15.0) **sia** `@supabase/ssr` (^0.9.0-rc.2). Questo è un conflitto noto:

- `auth-helpers-nextjs` usa un proprio sistema di gestione cookies
- `@supabase/ssr` ne usa un altro
- Entrambi scrivono cookies con nomi simili (`sb-<ref>-auth-token*`)
- Possono sovrascriversi a vicenda o creare stati inconsistenti

**Azione:** Rimuovere completamente `@supabase/auth-helpers-nextjs` dal progetto. È deprecato e sostituito da `@supabase/ssr`.

### Ipotesi 2 (MEDIA PROBABILITÀ): Cookies chunked + attributi errati

Supabase SSR scrive token in cookies chunked (`sb-xxx-auth-token.0`, `.1`, ecc.). Se gli attributi cookie (SameSite, Secure, Path, Domain) non sono allineati tra browser-client e middleware, il middleware non li vede. In particolare:

- Vercel forza HTTPS → `Secure: true` necessario
- `SameSite: Lax` è il default browser, ma potrebbe servire esplicito
- `createBrowserClient` senza opzioni custom usa `document.cookie` con attributi default

### Ipotesi 3 (BASSA PROBABILITÀ): Next.js 16.x breaking change

Next.js 16.x è molto recente. Possibili cambiamenti interni nel modo in cui middleware legge cookies o nel lifecycle delle request. Ma poiché il problema si presenta anche su localhost, è meno probabile che sia Vercel-specific.

### Ipotesi 4: `getSession()` vs `getUser()` nel middleware

Il middleware usa `supabase.auth.getSession()`. Supabase docs dicono esplicitamente di usare `getUser()` nel middleware per validazione sicura. `getSession()` potrebbe non refreshare correttamente i token dal cookie, causando una sessione "vuota" anche con cookies presenti.

---

## Root Cause Più Profondo

**La root cause è quasi certamente il conflitto tra i due pacchetti Supabase** (`auth-helpers-nextjs` + `ssr`). Questo è documentato come problema noto nella migration guide di Supabase stessa.

Sequenza probabile:
1. `createBrowserClient` (da `@supabase/ssr`) scrive cookies ✅
2. Ma `auth-helpers-nextjs` ha intercettato o interferito con il flow auth
3. I cookies vengono scritti con namespace/formato diverso da quello che il middleware si aspetta
4. Middleware legge cookies → non trova sessione → redirect → loop

**Compounding factor:** il middleware matcher cattura TUTTO (`/((?!_next/static|_next/image|favicon.ico).*)`), incluse risorse che non dovrebbero passare per l'auth check. Questo amplifica il loop.

---

## Validazione Server Actions

### Verdetto: ✅ Approccio CORRETTO, ma con riserve

**Pro:**
- Bypassa completamente il client-side cookie problem
- `cookies()` di Next.js è il modo canonico per scrivere cookies server-side
- `createServerClient` + `cookies()` è l'approccio ufficiale Supabase per Next.js App Router
- Redirect server-side con cookies già impostati = zero race condition

**Contro:**
- Non risolve la root cause (conflitto pacchetti)
- Se `auth-helpers-nextjs` è ancora installato, potrebbe comunque interferire
- Il middleware deve comunque leggere i cookies correttamente
- Perdi l'auth client-side per OAuth/magic links (servono solo per email+password)

### ⚠️ ATTENZIONE CRITICA

Server Actions risolve la **scrittura** dei cookies, ma il **middleware** deve comunque funzionare. Se il middleware usa ancora `getSession()` e il conflitto pacchetti persiste, il loop continuerà.

**Fix necessari PRIMA del test:**
1. `npm uninstall @supabase/auth-helpers-nextjs`
2. Nel middleware: sostituire `getSession()` con `getUser()`
3. Restringere il matcher del middleware (vedi sotto)

---

## Fallback Plan Dettagliato

### Se Server Actions fallisce:

### Opzione A: Fix Pulito (RACCOMANDATA - 1h)

1. **Rimuovere** `@supabase/auth-helpers-nextjs`
2. **Sostituire** `getSession()` → `getUser()` nel middleware
3. **Restringere** il middleware matcher:
```typescript
export const config = {
  matcher: ['/dashboard/:path*']  // SOLO le route protette
}
```
4. **Pulire** cookies browser (DevTools → Application → Cookies → Clear All)
5. **Testare** con `createBrowserClient` originale (non Server Actions)

Questa opzione potrebbe risolvere TUTTO senza Server Actions.

### Opzione B: Auth Middleware-Free (2h)

Eliminare il middleware auth. Proteggere le route con:
```typescript
// app/dashboard/layout.tsx
import { createServerClient } from './lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
```

Pro: nessun middleware, nessun loop possibile. Contro: check auth su ogni render.

### Opzione C: Switch a Clerk (4-6h)

Se Supabase auth è irrimediabilmente rotto con Next.js 16:
- Clerk ha supporto first-class per Next.js App Router
- Middleware auth gestito dal loro SDK
- Supabase rimane come database (Row Level Security con JWT Clerk)
- Più costoso ma elimina il problema

### Opzione D: Downgrade Next.js a 15.x (30min)

Se confermato che è un problema Next.js 16-specific:
```bash
npm install next@15.3.3
```
Rischio: potrebbe rompere altre cose. Ma isola la variabile.

---

## Decisione Strategica

### Raccomandazione: Proseguire con test, MA fare i fix prima

**NON testare Server Actions così com'è.** Prima:

1. ⏱️ **5 min:** `npm uninstall @supabase/auth-helpers-nextjs`
2. ⏱️ **5 min:** Middleware: `getSession()` → `getUser()`
3. ⏱️ **5 min:** Restringere middleware matcher a solo `/dashboard/:path*`
4. ⏱️ **2 min:** Clear cookies nel browser
5. ⏱️ **5 min:** Deploy e test

**Se dopo questi fix il loop persiste** → Opzione B (layout-based auth, elimina middleware).

**Se anche Opzione B fallisce** → Escalare a Biso con raccomandazione: switch a Clerk o downgrade Next.js.

**NON spendere altre 6 ore su questo.** I fix sopra richiedono 20 minuti. Se non funzionano, il problema è più profondo e serve una decisione architetturale.

---

## Cosa Avresti Fatto Diversamente

Se dovessi ricominciare da zero:

1. **Mai installare due pacchetti auth Supabase** - solo `@supabase/ssr`, mai `auth-helpers-nextjs`
2. **Middleware minimale** - matcher solo su route protette, non catch-all
3. **`getUser()` sempre** nel middleware, mai `getSession()`
4. **Test locale PRIMA** di deploy su Vercel
5. **Approccio Opzione B** (layout-based auth) come default - il middleware auth è fragile per definizione
6. **Next.js 15.x stabile** invece di 16.x per un MVP - bleeding edge + MVP = rischio inutile

---

## Checklist Immediata

- [ ] `npm uninstall @supabase/auth-helpers-nextjs`
- [ ] Middleware: `getSession()` → `getUser()`
- [ ] Middleware matcher: solo `/dashboard/:path*`
- [ ] Clear browser cookies
- [ ] Deploy + test
- [ ] Se fallisce → Opzione B (layout auth)
- [ ] Se fallisce → Escalare a Biso
