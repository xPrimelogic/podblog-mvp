# WordPress Integration Setup

## Prerequisites
- WordPress site (self-hosted or wordpress.com Business plan)
- REST API enabled (default su WP 4.7+)
- Application Password generato

## Step 1: Generate Application Password
1. WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords"
3. Name: "PodBlog AI"
4. Click "Add New Application Password"
5. Copy password (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)

## Step 2: Configure PodBlog
Dashboard → Settings → WordPress Integration:
- **Site URL**: https://yourblog.com
- **Username**: your-username
- **App Password**: paste here

## Step 3: Test Connection
Click "Test Connection" - should show: ✅ Connected

## Troubleshooting
- 401 error: check username/password
- 404 error: verify site URL (no trailing slash)
- CORS error: add to wp-config.php:
  ```php
  define('WP_REST_API_DEBUG', true);
  ```

## What Gets Published
- Title: from generated article
- Content: full HTML article
- Categories: "Podcast" (auto-created)
- Featured Image: first quote card
- Status: "draft" (review before publish)
