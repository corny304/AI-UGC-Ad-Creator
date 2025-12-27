import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { regenerateSectionSchema } from '@/lib/validations/generation'
import { addRegenerateSectionJob } from '@/lib/queue/queue'
import { CREDIT_COSTS } from '@/lib/stripe'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId || !session.user.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { section, instructions } = regenerateSectionSchema.omit({ generationId: true }).parse(body)

    // Check generation exists and belongs to team
    const generation = await db.generation.findFirst({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
    })

    if (!generation) {
      return NextResponse.json({ error: 'Generierung nicht gefunden' }, { status: 404 })
    }

    if (generation.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Generierung ist nicht abgeschlossen' },
        { status: 400 }
      )
    }

    // Determine credit cost
    const creditCost =
      section === 'hooks'
        ? CREDIT_COSTS.hookOnly
        : section === 'scripts'
          ? CREDIT_COSTS.scriptOnly
          : CREDIT_COSTS.sectionRegen

    // Check credits
    const team = await db.team.findUnique({
      where: { id: session.user.teamId },
    })

    if (!team || team.credits < creditCost) {
      return NextResponse.json(
        { error: 'Nicht genuegend Credits' },
        { status: 402 }
      )
    }

    // Add to queue
    const jobId = await addRegenerateSectionJob({
      generationId: params.id,
      teamId: session.user.teamId,
      userId: session.user.id,
      section,
      instructions,
    })

    return NextResponse.json({
      success: true,
      jobId,
      creditCost,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungueltige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error regenerating section:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
