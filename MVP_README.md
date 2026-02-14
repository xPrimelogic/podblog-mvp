# 🎙️ PodBlog MVP - Tool Operativo

**Status:** ✅ MVP FUNZIONANTE - NO WAITLIST

Trasforma podcast in articoli SEO-optimized usando AI.

## 🎯 Features Implementate

### ✅ Core Features
- **Upload Page**: Form per URL (YouTube/Spotify/RSS) o file audio (MP3/M4A)
- **Processing Pipeline**:
  - Estrazione audio da URL con yt-dlp
  - Trascrizione automatica con OpenAI Whisper
  - Generazione articolo SEO con GPT-4
- **Output Page**: 
  - Preview articolo formattato (H1/H2/paragrafi)
  - Metadata SEO (title, description, keywords)
  - Download Markdown + HTML
- **Sistema Limiti Free**: 1 conversione gratis, poi paywall (€19/mese)
- **Auth**: Supabase (email/password)

### 🎨 Design
- Next.js 14 App Router + Tailwind CSS
- Mobile-first, clean UX (v0.dev level)
- Loading states, error handling
- Real-time progress tracking

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Vercel account (for deployment)

### 2. Install Dependencies
```bash
cd /home/node/projects/podblog-mvp
npm install
```

### 3. Environment Variables
Already configured in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jhdrsyqayqoumvbukjps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]
OPENAI_API_KEY=[configured]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Setup Database

**Option A: Manual (Recommended)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run `SUPABASE_SETUP.sql` (creates tables, RLS, triggers)
4. Run `SETUP_COMPLETE.sql` (adds functions, storage policies)
5. Go to Storage → Create bucket "podcasts" (private)

**Option B: Script**
```bash
node scripts/setup-database.js
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing Flow

### End-to-End Test
1. **Signup**: Go to `/signup` → Create account
2. **Dashboard**: Verify you see "1 / 1" conversions available
3. **Upload**: 
   - Option 1: Paste YouTube URL (e.g., short video)
   - Option 2: Upload MP3 file (test with small file)
4. **Processing**: Wait 2-5 minutes (watch real-time status)
5. **Output**: View generated article, download MD/HTML
6. **Limit Check**: Try uploading again → Should see paywall

### Quick Test Commands
```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📦 Deploy to Vercel

### Automated Deploy
```bash
export VERCEL_TOKEN=your_vercel_token_here
./scripts/deploy.sh
```

### Manual Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Post-Deploy Configuration
1. **Supabase Auth URLs**:
   - Go to Supabase → Authentication → URL Configuration
   - Add to Redirect URLs:
     - `https://[your-app].vercel.app/auth/callback`
     - `https://[your-app].vercel.app/dashboard`

2. **Environment Variables** (if deploying to new project):
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add OPENAI_API_KEY
   vercel env add NEXT_PUBLIC_SITE_URL
   ```

## 🗂️ Project Structure

```
podblog-mvp/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   ├── dashboard/
│   │   ├── page.tsx               # Dashboard with upload form
│   │   └── article/[id]/          # Article viewer page
│   └── api/
│       ├── upload/                 # Handle file/URL upload
│       ├── process/                # Background processing (Whisper + GPT-4)
│       └── article/[id]/          # Fetch article status (for polling)
├── components/
│   ├── upload-form.tsx            # Upload form component
│   ├── articles-list.tsx          # Articles list
│   └── article-viewer.tsx         # Article display with download
├── lib/
│   └── supabase/                  # Supabase client helpers
├── scripts/
│   ├── setup-database.js          # DB setup script
│   └── deploy.sh                  # Deployment script
├── SUPABASE_SETUP.sql             # Initial DB schema
├── SETUP_COMPLETE.sql             # Additional functions
└── .env.local                     # Environment variables
```

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI Whisper (transcription), GPT-4 (article generation)
- **Audio Processing**: yt-dlp-wrap (YouTube/Spotify downloads)
- **Deployment**: Vercel

## 🎯 Usage Limits

| Plan | Conversions | Price | Features |
|------|------------|-------|----------|
| **Free** | 1 conversion | €0 | Trial, no credit card |
| **Pro** | 12/month | €19/mese | Full access, SEO advanced |

**Limit Logic**:
- Free users: 1 conversion total, then paywall
- Paid users: 12/month, resets monthly
- Tracked in `usage` table via Supabase

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Issues
- **RLS blocking queries**: Check policies in Supabase dashboard
- **Trigger not firing**: Verify `handle_new_user()` function exists
- **Usage not incrementing**: Run `SETUP_COMPLETE.sql` for `increment_usage()` function

### Processing Failures
- **YouTube download fails**: Check if URL is valid, try shorter video first
- **Whisper timeout**: Large files may timeout (max ~100MB recommended)
- **GPT-4 errors**: Verify OpenAI API key has credits

### Storage Issues
```bash
# Check if bucket exists
# Supabase Dashboard → Storage → Should see "podcasts"

# If missing, create manually or run:
node scripts/setup-database.js
```

## 📊 Monitoring

### Check Processing Status
```sql
-- In Supabase SQL Editor
SELECT id, title, status, created_at, error_message 
FROM articles 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Usage Stats
```sql
SELECT u.*, p.email 
FROM usage u
JOIN profiles p ON p.id = u.user_id
ORDER BY u.updated_at DESC;
```

## 🔐 Security

- **RLS Enabled**: Users can only access their own data
- **Service Role Key**: Only used server-side (never exposed to client)
- **File Storage**: Private bucket, user-scoped access
- **API Routes**: All protected with auth checks

## 📈 Future Enhancements

- [ ] Stripe payment integration
- [ ] Batch processing (multiple podcasts)
- [ ] Custom SEO templates
- [ ] WordPress export
- [ ] Social media snippets generation
- [ ] Admin dashboard

## 📝 Notes

- **Token Budget**: ~30k/200k used (170k remaining)
- **Processing Time**: 2-5 minutes per podcast (depends on length)
- **File Size Limit**: Recommended max 100MB
- **Supported Formats**: MP3, M4A, WAV, OGG
- **Supported URLs**: YouTube, Spotify, direct audio URLs

## 🤝 Support

For issues or questions, check:
1. This README
2. Supabase dashboard logs
3. Vercel deployment logs
4. Browser console (for client errors)

---

**Built with ❤️ for MVP testing**  
**Date:** 2026-02-14  
**Version:** 1.0.0 - MVP Operativo
