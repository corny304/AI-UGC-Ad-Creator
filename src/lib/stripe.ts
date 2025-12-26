import Stripe from 'stripe'
import { db } from './db'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Pricing Plans
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfekt für Einzelunternehmer',
    price: 2900, // in cents
    credits: 100,
    features: [
      '100 Credits/Monat',
      '1 Brand',
      'Alle Vorlagen',
      'JSON + Markdown Export',
      'E-Mail Support',
    ],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Für wachsende Businesses',
    price: 7900,
    credits: 500,
    features: [
      '500 Credits/Monat',
      '5 Brands',
      'Alle Vorlagen',
      'Alle Export-Formate',
      'Priority Support',
      'Team-Zugang (3 Mitglieder)',
    ],
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    popular: true,
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'Für Agenturen & Teams',
    price: 19900,
    credits: 2000,
    features: [
      '2000 Credits/Monat',
      'Unbegrenzte Brands',
      'Alle Vorlagen',
      'Alle Export-Formate',
      'Webhook-Integration',
      'Whitelabel Export',
      'Dedizierter Support',
      'Unbegrenzte Team-Mitglieder',
    ],
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency',
  },
} as const

// Credit Packs (one-time purchases)
export const CREDIT_PACKS = {
  small: {
    id: 'small',
    name: '50 Credits',
    credits: 50,
    price: 990,
    stripePriceId: process.env.STRIPE_CREDITS_SMALL_PRICE_ID || 'price_credits_small',
  },
  medium: {
    id: 'medium',
    name: '150 Credits',
    credits: 150,
    price: 2490,
    stripePriceId: process.env.STRIPE_CREDITS_MEDIUM_PRICE_ID || 'price_credits_medium',
    popular: true,
  },
  large: {
    id: 'large',
    name: '500 Credits',
    credits: 500,
    price: 6990,
    stripePriceId: process.env.STRIPE_CREDITS_LARGE_PRICE_ID || 'price_credits_large',
  },
} as const

// Credit costs per generation type
export const CREDIT_COSTS = {
  fullPack: 10,      // Full creative pack
  hookOnly: 2,       // Just hooks regeneration
  scriptOnly: 3,     // Just script regeneration
  sectionRegen: 1,   // Any other section regeneration
} as const

export async function createCheckoutSession({
  teamId,
  userId,
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: {
  teamId: string
  userId: string
  priceId: string
  mode: 'subscription' | 'payment'
  successUrl: string
  cancelUrl: string
}) {
  // Get or create Stripe customer
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { subscription: true, owner: true },
  })

  if (!team) throw new Error('Team nicht gefunden')

  let customerId = team.subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: team.owner.email,
      name: team.name,
      metadata: {
        teamId,
        userId,
      },
    })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      teamId,
      userId,
    },
    subscription_data: mode === 'subscription' ? {
      metadata: { teamId, userId },
    } : undefined,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
  })

  return session
}

export async function createCustomerPortalSession({
  teamId,
  returnUrl,
}: {
  teamId: string
  returnUrl: string
}) {
  const subscription = await db.subscription.findUnique({
    where: { teamId },
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error('Kein aktives Abonnement gefunden')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

export async function grantCredits({
  teamId,
  userId,
  amount,
  type,
  description,
}: {
  teamId: string
  userId?: string
  amount: number
  type: 'SUBSCRIPTION_GRANT' | 'PURCHASE' | 'REFUND' | 'ADJUSTMENT' | 'BONUS'
  description: string
}) {
  return db.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: { id: teamId },
    })

    if (!team) throw new Error('Team nicht gefunden')

    const newBalance = team.credits + amount

    await tx.team.update({
      where: { id: teamId },
      data: { credits: newBalance },
    })

    await tx.creditLedger.create({
      data: {
        teamId,
        userId,
        amount,
        balance: newBalance,
        type,
        description,
      },
    })

    return newBalance
  })
}

export async function deductCredits({
  teamId,
  userId,
  amount,
  description,
  metadata,
}: {
  teamId: string
  userId: string
  amount: number
  description: string
  metadata?: Record<string, unknown>
}) {
  return db.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: { id: teamId },
    })

    if (!team) throw new Error('Team nicht gefunden')
    if (team.credits < amount) throw new Error('Nicht genügend Credits')

    const newBalance = team.credits - amount

    await tx.team.update({
      where: { id: teamId },
      data: { credits: newBalance },
    })

    await tx.creditLedger.create({
      data: {
        teamId,
        userId,
        amount: -amount,
        balance: newBalance,
        type: 'GENERATION',
        description,
        metadata: metadata as object,
      },
    })

    return newBalance
  })
}

export async function refundCredits({
  teamId,
  userId,
  amount,
  description,
}: {
  teamId: string
  userId: string
  amount: number
  description: string
}) {
  return grantCredits({
    teamId,
    userId,
    amount,
    type: 'REFUND',
    description,
  })
}

export function getPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find((plan) => plan.stripePriceId === priceId)
}

export function getCreditPackByPriceId(priceId: string) {
  return Object.values(CREDIT_PACKS).find((pack) => pack.stripePriceId === priceId)
}
