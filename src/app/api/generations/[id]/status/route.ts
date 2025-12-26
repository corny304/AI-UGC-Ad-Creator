import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getJobStatus } from '@/lib/queue/queue'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const generation = await db.generation.findFirst({
      where: {
        id: params.id,
        teamId: session.user.teamId,
      },
    })

    if (!generation) {
      return NextResponse.json({ error: 'Generierung nicht gefunden' }, { status: 404 })
    }

    let progress = null
    if (generation.jobId && (generation.status === 'PENDING' || generation.status === 'PROCESSING')) {
      const jobStatus = await getJobStatus(generation.jobId)
      if (jobStatus) {
        progress = jobStatus.progress
      }
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      progress,
      error: generation.errorMessage,
    })
  } catch (error) {
    console.error('Error fetching generation status:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
