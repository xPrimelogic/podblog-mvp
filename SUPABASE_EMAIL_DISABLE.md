# Disable Email Confirmation in Supabase

## Quick Steps (2 minutes)

1. Go to https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps
2. Click **Authentication** in left menu
3. Click **Email Auth** tab
4. Find **"Confirm email"** setting
5. **Toggle OFF** (disable)
6. Click **Save**

## What This Does

- Users can login immediately after signup
- No email verification required
- Improves UX for MVP testing

## Alternative (If Setting Not Found)

Update Supabase config manually:
1. Go to **Project Settings** → **Configuration**
2. Find `auth.enable_email_confirmations`
3. Set to `false`

---

**Status:** Code already updated to bypass email (register API)
**This setting:** Makes it work universally
