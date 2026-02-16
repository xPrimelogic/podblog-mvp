import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * 
 * Tests the complete login flow with the fixed redirect behavior
 * using window.location.href for full page reload
 */

test.describe('Authentication Flow', () => {
  // Clean state before each test
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage to ensure clean state
    await page.context().clearCookies()
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
  })

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    console.log('🧪 Test: Login and redirect')
    
    // Fill login form
    await page.fill('input[type="email"]', 'test-e2e@podblog.ai')
    await page.fill('input[type="password"]', 'your-test-password-here')
    
    // Click submit button
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard (full page reload)
    // Increased timeout for headless browser
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // Verify URL
    expect(page.url()).toContain('/dashboard')
    
    // Verify dashboard content loaded
    const heading = page.locator('h1')
    await expect(heading).toContainText('Benvenuto', { timeout: 5000 })
    
    console.log('✅ Login successful, dashboard loaded')
  })

  test('should persist session after page reload', async ({ page }) => {
    console.log('🧪 Test: Session persistence')
    
    // First, login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test-e2e@podblog.ai')
    await page.fill('input[type="password"]', 'your-test-password-here')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // Now reload the page
    await page.reload({ waitUntil: 'networkidle' })
    
    // Should still be on dashboard (no redirect to login)
    expect(page.url()).toContain('/dashboard')
    
    // Dashboard content should be visible
    const heading = page.locator('h1')
    await expect(heading).toContainText('Benvenuto')
    
    console.log('✅ Session persisted after reload')
  })

  test('should redirect logged-in users from login page to dashboard', async ({ page }) => {
    console.log('🧪 Test: Redirect logged-in user from /login')
    
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test-e2e@podblog.ai')
    await page.fill('input[type="password"]', 'your-test-password-here')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // Try to navigate back to login page
    await page.goto('/login')
    
    // Middleware should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
    
    console.log('✅ Logged-in user correctly redirected from /login to /dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    console.log('🧪 Test: Invalid login credentials')
    
    // Try to login with wrong password
    await page.fill('input[type="email"]', 'test-e2e@podblog.ai')
    await page.fill('input[type="password"]', 'wrong-password')
    await page.click('button[type="submit"]')
    
    // Should show error message
    const errorMessage = page.locator('text=/Email o password non corretti/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
    
    // Should still be on login page
    expect(page.url()).toContain('/login')
    
    console.log('✅ Error correctly displayed for invalid credentials')
  })

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    console.log('🧪 Test: Protected route redirect')
    
    // Try to access dashboard directly without logging in
    await page.goto('/dashboard')
    
    // Middleware should redirect to login
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
    
    console.log('✅ Unauthenticated user correctly redirected from /dashboard to /login')
  })
})

/**
 * Test Configuration Notes:
 * 
 * Run with:
 * npx playwright test EXAMPLE_auth_test.spec.ts --headed
 * 
 * For debugging:
 * npx playwright test EXAMPLE_auth_test.spec.ts --debug
 * 
 * Generate trace:
 * npx playwright test EXAMPLE_auth_test.spec.ts --trace on
 * 
 * Remember to:
 * 1. Replace 'your-test-password-here' with actual test password
 * 2. Ensure test-e2e@podblog.ai exists in Supabase and is verified
 * 3. Configure Supabase env vars in .env.local
 */
