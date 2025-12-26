import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await createCustomerPortalSession({
      teamId: session.user.teamId,
      returnUrl: `${appUrl}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
