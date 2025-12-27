import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { generationInputSchema } from '@/lib/validations/generation'
import { addGenerationJob } from '@/lib/queue/queue'
import { CREDIT_COSTS } from '@/lib/stripe'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const generations = await db.generation.findMany({
      where: { teamId: session.user.teamId },
      include: {
        brand: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(generations)
  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId || !session.user.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const input = generationInputSchema.parse(body)

    // Check credits
    const team = await db.team.findUnique({
      where: { id: session.user.teamId },
    })

    if (!team) {
      return NextResponse.json({ error: 'Team nicht gefunden' }, { status: 404 })
    }

    if (team.credits < CREDIT_COSTS.fullPack) {
      return NextResponse.json(
        { error: 'Nicht genuegend Credits' },
        { status: 402 }
      )
    }

    // Verify brand belongs to team
    const brand = await db.brand.findFirst({
      where: {
        id: input.brandId,
        teamId: session.user.teamId,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand nicht gefunden' }, { status: 404 })
    }

    // Create generation record
    const generation = await db.generation.create({
      data: {
        teamId: session.user.teamId,
        userId: session.user.id,
        brandId: input.brandId,
        productId: input.productId,
        templateId: input.templateId,
        platform: input.platform,
        goal: input.goal,
        style: input.style,
        duration: input.duration,
        language: input.language,
        status: 'PENDING',
      },
    })

    // Add to queue
    const jobId = await addGenerationJob({
      generationId: generation.id,
      teamId: session.user.teamId,
      userId: session.user.id,
      brandId: input.brandId,
      productId: input.productId,
      templateId: input.templateId,
      input,
    })

    // Update with job ID
    await db.generation.update({
      where: { id: generation.id },
      data: { jobId },
    })

    return NextResponse.json({
      id: generation.id,
      jobId,
      status: 'PENDING',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungueltige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating generation:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
