# PodBlog AI - MVP Complete

Trasforma podcast in 9 contenuti automaticamente: blog SEO, social posts, newsletter, quote cards.

## 🎯 Features Complete

- ✅ **Blog Article** (1500+ parole, SEO ottimizzato)
- ✅ **Social Content** (Twitter, LinkedIn, Instagram, TikTok, YouTube)
- ✅ **Newsletter** (HTML email formatted)
- ✅ **Quote Cards** (5 immagini PNG gradient)
- ✅ **Timestamps** (Capitoli YouTube-ready)
- ✅ **WordPress Integration** (Auto-publish)
- ✅ **Dashboard UI** (6 tab complete)

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/xPrimelogic/podblog-mvp.git
cd podblog-mvp
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Add your keys:
# - Supabase URL + Keys
# - OpenAI API key
# - Deepgram API key
```

### 3. Database Setup
Run SQL in Supabase dashboard:
```sql
-- See apply-schema.sql for full schema
```

### 4. Run Development
```bash
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
lib/
├── ai/
│   ├── social-content.ts    # GPT-4 social generation
│   ├── newsletter.ts         # Email HTML generation
│   └── timestamps.ts         # Video chapters
├── images/
│   └── quote-cards.ts        # PNG gradient cards
└── integrations/
    └── wordpress.ts          # REST API client

app/api/
├── generate-social/          # POST /api/generate-social
├── generate-newsletter/      # POST /api/generate-newsletter
├── generate-quotes/          # POST /api/generate-quotes
└── publish-wordpress/        # POST /api/publish-wordpress
```

## 💰 Cost per Episode

- Deepgram Nova-2: €0.13
- GPT-4 (article + social): €0.15
- Quote extraction: €0.02
- **Total: €0.30/episode**

## 📖 WordPress Setup

See `WORDPRESS_SETUP.md` for detailed integration instructions.

## 🧪 Testing

```bash
# Test all API routes
./test-mvp-complete.sh

# Manual test
npm run dev
# 1. Upload YouTube link
# 2. Wait for processing (~15s)
# 3. Click "Generate Social Content"
# 4. Click "Generate Newsletter"
# 5. Click "Generate Quote Cards"
```

## 🔧 Tech Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **AI:** OpenAI GPT-4, Deepgram Nova-2
- **Images:** Sharp (CSS gradients)
- **Deploy:** Vercel

## 📝 License

Proprietary - PodBlog AI

---

**Status:** ✅ MVP Complete  
**Version:** 1.0.0  
**Last Update:** 2026-02-16
