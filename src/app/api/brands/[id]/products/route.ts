import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations/brand'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Verify brand belongs to team
    const brand = await db.brand.findFirst({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    const products = await db.product.findMany({
      where: { brandId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Verify brand belongs to team
    const brand = await db.brand.findFirst({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    const body = await request.json()
    const data = productSchema.parse(body)

    const product = await db.product.create({
      data: {
        ...data,
        brandId: params.id,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungueltige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
