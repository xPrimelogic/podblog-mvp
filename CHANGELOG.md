# Changelog

## [1.0.0] - 2026-02-16

### 🎉 Initial MVP Release

Complete implementation of 9-content generation from podcasts.

### Features Added

#### Core Processing
- **Audio Transcription** - Deepgram Nova-2 integration
- **Article Generation** - GPT-4 SEO-optimized blog posts (1500+ words)
- **Social Content** - 5 platform-specific posts (Twitter, LinkedIn, Instagram, TikTok, YouTube)
- **Newsletter** - HTML email template generation
- **Quote Cards** - CSS gradient PNG images (1080x1080)
- **Timestamps** - Video chapter extraction
- **WordPress Integration** - Auto-publish via REST API

#### Dashboard & UI
- Complete article viewer with 6 tabs
- Upload form (YouTube, Spotify, direct file)
- Processing status monitoring
- Copy-to-clipboard functionality
- Download quote cards
- WordPress publishing form

#### API Routes
- `POST /api/upload` - File/URL upload
- `POST /api/process` - Background processing
- `POST /api/generate-social` - Social content generation
- `POST /api/generate-newsletter` - Newsletter generation
- `POST /api/generate-quotes` - Quote cards generation
- `POST /api/publish-wordpress` - WordPress publishing

#### Infrastructure
- Supabase database schema
- Authentication system (temporarily disabled for MVP testing)
- Usage tracking
- Subscription management
- Git pre-push hook for task completion enforcement

### Technical Details
- **Framework:** Next.js 16
- **AI Models:** OpenAI GPT-4, Deepgram Nova-2
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Image Processing:** Sharp

### Costs
- €0.30 per episode processed
- €30-60/month for 100 episodes

### Documentation
- README.md - Setup guide
- DEPLOYMENT.md - Production deployment
- WORDPRESS_SETUP.md - WordPress integration
- .env.example - Environment template

### Performance
- Processing time: 10-15 seconds per episode
- Concurrent processing supported
- Edge deployment for low latency

### Known Issues
None reported.

---

**Contributors:** Builder AI, Prime (Strategist), Opus (Architecture)
**Repository:** https://github.com/xPrimelogic/podblog-mvp
**Live Demo:** https://podblog-mvp.vercel.app
