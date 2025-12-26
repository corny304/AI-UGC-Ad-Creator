import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId || !session.user.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId, mode } = body

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: 'priceId und mode erforderlich' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutSession = await createCheckoutSession({
      teamId: session.user.teamId,
      userId: session.user.id,
      priceId,
      mode,
      successUrl: `${appUrl}/billing?success=true`,
      cancelUrl: `${appUrl}/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
