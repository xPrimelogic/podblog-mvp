/**
 * Geo-based pricing selector
 * Detects user region and returns appropriate Stripe price IDs
 */

export type Region = 'europa' | 'usa_uk' | 'latam'
export type Tier = 'starter' | 'creator' | 'pro'

// Price IDs from Stripe
const PRICE_IDS: Record<Region, Record<Tier, string>> = {
  europa: {
    starter: process.env.STRIPE_PRICE_EUROPA_STARTER!,
    creator: process.env.STRIPE_PRICE_EUROPA_CREATOR!,
    pro: process.env.STRIPE_PRICE_EUROPA_PRO!,
  },
  usa_uk: {
    starter: process.env.STRIPE_PRICE_USA_UK_STARTER!,
    creator: process.env.STRIPE_PRICE_USA_UK_CREATOR!,
    pro: process.env.STRIPE_PRICE_USA_UK_PRO!,
  },
  latam: {
    starter: process.env.STRIPE_PRICE_LATAM_STARTER!,
    creator: process.env.STRIPE_PRICE_LATAM_CREATOR!,
    pro: process.env.STRIPE_PRICE_LATAM_PRO!,
  },
}

// Display prices by region
const DISPLAY_PRICES: Record<Region, Record<Tier, { amount: string; currency: string }>> = {
  europa: {
    starter: { amount: '9', currency: '€' },
    creator: { amount: '19', currency: '€' },
    pro: { amount: '49', currency: '€' },
  },
  usa_uk: {
    starter: { amount: '10', currency: '$' },
    creator: { amount: '20', currency: '$' },
    pro: { amount: '50', currency: '$' },
  },
  latam: {
    starter: { amount: '7', currency: '$' },
    creator: { amount: '15', currency: '$' },
    pro: { amount: '35', currency: '$' },
  },
}

// Country to region mapping
const COUNTRY_TO_REGION: Record<string, Region> = {
  // Europa
  IT: 'europa', FR: 'europa', DE: 'europa', ES: 'europa', PT: 'europa',
  NL: 'europa', BE: 'europa', AT: 'europa', CH: 'europa', SE: 'europa',
  DK: 'europa', NO: 'europa', FI: 'europa', PL: 'europa', CZ: 'europa',
  GR: 'europa', IE: 'europa', HU: 'europa', RO: 'europa', BG: 'europa',
  
  // USA/UK
  US: 'usa_uk', GB: 'usa_uk', CA: 'usa_uk', AU: 'usa_uk', NZ: 'usa_uk',
  
  // LATAM
  BR: 'latam', MX: 'latam', AR: 'latam', CL: 'latam', CO: 'latam',
  PE: 'latam', VE: 'latam', EC: 'latam', UY: 'latam', PY: 'latam',
  BO: 'latam', CR: 'latam', PA: 'latam', DO: 'latam', GT: 'latam',
}

/**
 * Detect user region from IP (server-side)
 * Uses Vercel's geo headers or fallback to IP lookup
 */
export async function detectRegion(request: Request): Promise<Region> {
  // Try Vercel geo header first
  const country = request.headers.get('x-vercel-ip-country')
  
  if (country && COUNTRY_TO_REGION[country]) {
    return COUNTRY_TO_REGION[country]
  }
  
  // Fallback: try ipapi.co (free, no key needed)
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip')
    
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      const response = await fetch(`https://ipapi.co/${ip}/country/`, {
        headers: { 'User-Agent': 'PodBlog-AI' },
      })
      
      if (response.ok) {
        const countryCode = (await response.text()).trim()
        if (COUNTRY_TO_REGION[countryCode]) {
          return COUNTRY_TO_REGION[countryCode]
        }
      }
    }
  } catch (error) {
    console.error('IP geolocation failed:', error)
  }
  
  // Default to Europa (largest market)
  return 'europa'
}

/**
 * Get Stripe price ID for user region and tier
 */
export function getPriceId(region: Region, tier: Tier): string {
  return PRICE_IDS[region][tier]
}

/**
 * Get display price for region and tier
 */
export function getDisplayPrice(region: Region, tier: Tier) {
  return DISPLAY_PRICES[region][tier]
}

/**
 * Get all pricing for a region (for pricing page)
 */
export function getRegionPricing(region: Region) {
  return {
    region,
    currency: region === 'europa' ? '€' : '$',
    tiers: [
      {
        name: 'Starter',
        tier: 'starter' as Tier,
        price: DISPLAY_PRICES[region].starter,
        priceId: PRICE_IDS[region].starter,
        episodes: 10,
        features: [
          '10 episodi al mese',
          'Trascrizione Deepgram Nova-2',
          'Articoli SEO ottimizzati',
          'Export Markdown/HTML',
        ],
      },
      {
        name: 'Creator',
        tier: 'creator' as Tier,
        price: DISPLAY_PRICES[region].creator,
        priceId: PRICE_IDS[region].creator,
        episodes: 30,
        popular: true,
        features: [
          '30 episodi al mese',
          'Tutto di Starter, più:',
          'Immagini AI generate',
          'Post social automatici',
          'Newsletter templates',
        ],
      },
      {
        name: 'Pro',
        tier: 'pro' as Tier,
        price: DISPLAY_PRICES[region].pro,
        priceId: PRICE_IDS[region].pro,
        episodes: 100,
        features: [
          '100 episodi al mese',
          'Tutto di Creator, più:',
          'API access',
          'Webhooks',
          'Priority support',
          'White-label option',
        ],
      },
    ],
  }
}
