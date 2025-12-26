import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { brandSchema } from '@/lib/validations/brand'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const brands = await db.brand.findMany({
      where: { teamId: session.user.teamId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const data = brandSchema.parse(body)

    const brand = await db.brand.create({
      data: {
        ...data,
        teamId: session.user.teamId,
      },
    })

    return NextResponse.json(brand)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungueltige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating brand:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
