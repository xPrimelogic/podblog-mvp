# Blog Hosting - Deployment & Testing Checklist

## 🗄️ STEP 1: Apply Database Schema

**⚠️ CRITICAL: Must be done before testing**

### Option A: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select project: `jhdrsyqayqoumvbukjps`
3. Click "SQL Editor" in left sidebar
4. Click "New query"
5. Copy contents of `blog-schema-updates.sql`
6. Paste and click "Run"
7. Verify: "Success. No rows returned"

### Option B: Command Line (if psql available)
```bash
psql postgresql://postgres:[PASSWORD]@db.jhdrsyqayqoumvbukjps.supabase.co:5432/postgres \
  -f blog-schema-updates.sql
```

### Verification
Run this query to verify schema:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('username', 'bio', 'blog_visibility');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND column_name = 'slug';
```

Expected: 4 rows returned (3 from profiles, 1 from articles)

---

## 🚀 STEP 2: Deploy to Production

### Vercel Deployment
```bash
cd /home/node/projects/podblog-mvp
git add .
git commit -m "feat: Add public blog hosting with SEO"
git push origin main
```

### Verify Deployment
- Check Vercel dashboard for build status
- Wait for deployment to complete (~2-3 minutes)
- Check build logs for errors

---

## 🧪 STEP 3: Testing Checklist

### Test 1: User Signup with Username Generation
- [ ] Go to `/signup`
- [ ] Register with email: `test-blog-001@example.com`
- [ ] Password: `test123456`
- [ ] Name: `Test User`
- [ ] Verify: No errors during signup
- [ ] Check console: Should log "Generated username: test-blog-001" (or similar)
- [ ] Expected username: `test-blog-001` (from email)

### Test 2: Blog Settings Page
- [ ] Navigate to `/dashboard/settings/blog`
- [ ] Verify: Form loads with auto-generated username
- [ ] Change username to: `testuser`
- [ ] Verify: Green checkmark shows "Username disponibile"
- [ ] Add bio: "This is my test bio"
- [ ] Add avatar URL: `https://i.pravatar.cc/150?img=1`
- [ ] Set visibility: Public
- [ ] Click "Salva Impostazioni"
- [ ] Verify: Success message appears

### Test 3: Create Test Article
- [ ] Go to `/dashboard`
- [ ] Upload a test podcast or URL
- [ ] Wait for processing to complete
- [ ] Check article in database has `slug` field populated
- [ ] Example slug: `my-first-podcast` (from title "My First Podcast")

### Test 4: Public Blog Listing
- [ ] **Log out or use incognito window**
- [ ] Navigate to `/blog/testuser`
- [ ] Verify: Blog page loads
- [ ] Verify: Author name, bio, avatar visible
- [ ] Verify: Article appears in list
- [ ] Verify: Article excerpt visible (~200 chars)
- [ ] Verify: Publication date formatted correctly

### Test 5: Public Article Page
- [ ] From blog listing, click on article
- [ ] Navigate to `/blog/testuser/[slug]`
- [ ] Verify: Article loads with full content
- [ ] Verify: Share buttons present (Twitter, LinkedIn, Copy)
- [ ] Click "Copy link" button
- [ ] Verify: "Link copied!" alert appears
- [ ] Verify: Author bio box appears at bottom
- [ ] Verify: "Back to blog" link works

### Test 6: SEO Verification
- [ ] View source of article page (Ctrl+U / Cmd+U)
- [ ] Verify: `<title>` tag present with article title
- [ ] Verify: `<meta name="description">` present
- [ ] Verify: `<meta property="og:title">` present (Open Graph)
- [ ] Verify: `<meta property="og:image">` present
- [ ] Verify: `<meta name="twitter:card">` present
- [ ] Verify: `<script type="application/ld+json">` present (Schema.org)

### Test 7: Private Blog Visibility
- [ ] Log back in
- [ ] Go to `/dashboard/settings/blog`
- [ ] Change visibility to "Private"
- [ ] Save
- [ ] Log out
- [ ] Try to access `/blog/testuser`
- [ ] Verify: 404 page or "Blog not found" message

### Test 8: Username Uniqueness
- [ ] Create new account: `test-blog-002@example.com`
- [ ] Verify: Gets username `test-blog-002`
- [ ] Try to change username to `testuser` (already taken)
- [ ] Verify: Red "Username non disponibile" message
- [ ] Change to unique username: `testuser2`
- [ ] Verify: Green "Username disponibile" and save succeeds

---

## 🔧 STEP 4: Optional - Disable Email Confirmation

### Supabase Settings
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Find "Enable email confirmations"
4. Toggle OFF
5. Click "Save"

### Test Instant Signup
- [ ] Register new user
- [ ] Verify: Redirected to dashboard immediately (no email check)
- [ ] Verify: Profile created with username

---

## 🐛 STEP 5: Troubleshooting

### Issue: "slug not found" error
**Solution:** Run migration script again, check articles table has `slug` column

### Issue: Blog page shows 404
**Solutions:**
- Check username is set in profile
- Check blog_visibility is 'public'
- Check RLS policies applied correctly

### Issue: Share buttons not working
**Solution:** Check NEXT_PUBLIC_APP_URL in .env (needed for absolute URLs)

### Issue: Avatar not loading
**Solution:** Use valid image URL, check CORS if self-hosted

### Issue: Username already taken
**Solution:** This is expected behavior - use different username

---

## ✅ SUCCESS CRITERIA

All tests passed when:
- [x] User signup generates username automatically
- [x] Blog settings page functional
- [x] Article slug generated during processing
- [x] Public blog listing accessible without login
- [x] Article page loads with full content
- [x] SEO meta tags present in HTML
- [x] Share buttons work
- [x] Private blog returns 404 when logged out
- [x] Username uniqueness enforced

---

## 📊 Post-Deployment Verification

### Database Check
```sql
-- Check profiles have usernames
SELECT id, email, username, blog_visibility 
FROM profiles 
LIMIT 5;

-- Check articles have slugs
SELECT id, title, slug, status 
FROM articles 
WHERE status = 'completed' 
LIMIT 5;
```

### Production URLs
- Blog listing: `https://yourapp.vercel.app/blog/[username]`
- Article: `https://yourapp.vercel.app/blog/[username]/[slug]`
- Settings: `https://yourapp.vercel.app/dashboard/settings/blog`

---

## 🎉 DONE!

When all tests pass:
1. Update `BLOG_HOSTING_IMPLEMENTATION.md` checkboxes
2. Document any issues encountered
3. Update README with new features
4. Share blog URL examples with team

**Estimated testing time:** 15-20 minutes
