import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { brandSchema } from '@/lib/validations/brand'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const brand = await db.brand.findFirst({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
      include: {
        products: true,
        _count: {
          select: { generations: true },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const data = brandSchema.partial().parse(body)

    const brand = await db.brand.updateMany({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
      data,
    })

    if (brand.count === 0) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const brand = await db.brand.deleteMany({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
    })

    if (brand.count === 0) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
