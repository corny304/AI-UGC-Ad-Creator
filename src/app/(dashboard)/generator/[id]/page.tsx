import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { GenerationResult } from '@/components/generator/result'

interface Props {
  params: { id: string }
}

export default async function GenerationResultPage({ params }: Props) {
  const session = await getSession()

  if (!session?.user?.teamId) {
    notFound()
  }

  const generation = await db.generation.findFirst({
    where: {
      id: params.id,
      teamId: session.user.teamId,
    },
    include: {
      brand: true,
      product: true,
    },
  })

  if (!generation) {
    notFound()
  }

  return <GenerationResult generation={generation} />
}
