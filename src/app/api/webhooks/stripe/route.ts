import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, grantCredits, getPlanByPriceId, getCreditPackByPriceId } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { teamId, userId } = session.metadata || {}

        if (!teamId) break

        if (session.mode === 'subscription') {
          // Handle subscription checkout
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const priceId = subscription.items.data[0]?.price.id
          const plan = getPlanByPriceId(priceId)

          await db.subscription.upsert({
            where: { teamId },
            create: {
              teamId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })

          await db.team.update({
            where: { id: teamId },
            data: {
              subscriptionStatus: 'ACTIVE',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              planId: plan?.id,
            },
          })

          // Grant subscription credits
          if (plan) {
            await grantCredits({
              teamId,
              userId,
              amount: plan.credits,
              type: 'SUBSCRIPTION_GRANT',
              description: `${plan.name} Abo - Monatliche Credits`,
            })
          }

          // Log analytics
          await db.analyticsEvent.create({
            data: {
              teamId,
              eventType: 'subscription_created',
              metadata: { planId: plan?.id, priceId },
            },
          })
        } else if (session.mode === 'payment') {
          // Handle one-time credit pack purchase
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
          const priceId = lineItems.data[0]?.price?.id

          if (priceId) {
            const pack = getCreditPackByPriceId(priceId)

            if (pack) {
              await grantCredits({
                teamId,
                userId,
                amount: pack.credits,
                type: 'PURCHASE',
                description: `Credit-Paket: ${pack.name}`,
              })

              // Log analytics
              await db.analyticsEvent.create({
                data: {
                  teamId,
                  eventType: 'credits_purchased',
                  metadata: { packId: pack.id, credits: pack.credits },
                },
              })
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.billing_reason === 'subscription_cycle') {
          // Recurring subscription payment
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          const teamId = subscription.metadata?.teamId
          if (!teamId) break

          const priceId = subscription.items.data[0]?.price.id
          const plan = getPlanByPriceId(priceId)

          if (plan) {
            await grantCredits({
              teamId,
              amount: plan.credits,
              type: 'SUBSCRIPTION_GRANT',
              description: `${plan.name} Abo - Monatliche Credits`,
            })
          }

          // Update subscription
          await db.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })

          await db.team.update({
            where: { id: teamId },
            data: {
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const teamId = subscription.metadata?.teamId

        if (!teamId) break

        const status =
          subscription.status === 'active'
            ? 'ACTIVE'
            : subscription.status === 'past_due'
              ? 'PAST_DUE'
              : subscription.status === 'canceled'
                ? 'CANCELED'
                : subscription.status === 'trialing'
                  ? 'TRIALING'
                  : 'INACTIVE'

        await db.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })

        await db.team.update({
          where: { id: teamId },
          data: {
            subscriptionStatus: status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const teamId = subscription.metadata?.teamId

        if (!teamId) break

        await db.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELED' },
        })

        await db.team.update({
          where: { id: teamId },
          data: {
            subscriptionStatus: 'CANCELED',
            planId: null,
          },
        })

        await db.analyticsEvent.create({
          data: {
            teamId,
            eventType: 'subscription_canceled',
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }
}
