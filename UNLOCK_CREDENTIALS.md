# 🔐 Unlock Credentials - PodBlog Setup

## Problema
Il file `/home/node/.openclaw-secrets` contiene le credenziali Supabase ma non è accessibile all'utente `node` (owned by root, permissions 600).

## Soluzione rapida (1 comando)

Esegui come amministratore:

```bash
sudo cat /home/node/.openclaw-secrets >> /home/node/projects/podblog-mvp/.env.local && sudo chown node:node /home/node/projects/podblog-mvp/.env.local
```

**Oppure, per mantenere il file secrets sicuro:**

```bash
# Copia temporanea con permessi corretti
sudo cp /home/node/.openclaw-secrets /tmp/supabase-creds
sudo chmod 644 /tmp/supabase-creds
cat /tmp/supabase-creds
# Poi copia manualmente in .env.local
```

## Alternativa manuale

Apri `/home/node/.openclaw-secrets` (richiede sudo) e copia le righe che iniziano con `SUPABASE_` in `.env.local` sostituendo:

```
NEXT_PUBLIC_SUPABASE_URL=<valore di SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<valore di SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<valore di SUPABASE_SERVICE_ROLE_KEY>
```

---

**Una volta risolto, riesegui il task di setup del database.**
