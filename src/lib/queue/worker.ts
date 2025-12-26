import { Worker, Job } from 'bullmq'
import { redisConnection, QUEUE_NAME } from './config'
import { GenerationJobData, RegenerateSectionJobData } from './queue'
import { runGenerationPipeline, regenerateSection } from '@/lib/ai/pipeline'
import { db } from '@/lib/db'
import { deductCredits, refundCredits, CREDIT_COSTS } from '@/lib/stripe'

async function processGenerationJob(job: Job<GenerationJobData>) {
  const { generationId, teamId, userId, input } = job.data

  console.log(`Processing generation job ${job.id} for generation ${generationId}`)

  try {
    // Update status to processing
    await db.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING', jobId: job.id },
    })

    // Deduct credits
    await deductCredits({
      teamId,
      userId,
      amount: CREDIT_COSTS.fullPack,
      description: `Creative Pack Generierung`,
      metadata: { generationId },
    })

    // Get brand and product info
    const generation = await db.generation.findUnique({
      where: { id: generationId },
      include: { brand: true, product: true },
    })

    if (!generation) {
      throw new Error('Generation nicht gefunden')
    }

    // Build product brief
    const brief = {
      productName: generation.product?.name || input.productName || '',
      productDescription: generation.product?.description || input.productDescription || '',
      productPrice: generation.product?.price || input.productPrice,
      benefits: generation.product?.benefits || input.productBenefits || [],
      objections: generation.product?.objections || input.productObjections || [],
      reviews: generation.product?.reviews || [],
      brandName: generation.brand.name,
      targetAudience: generation.brand.targetAudience || '',
      tonality: generation.brand.tonality,
      usps: generation.brand.usps,
      noGos: generation.brand.noGos,
      industry: generation.brand.industry,
    }

    const config = {
      platform: generation.platform,
      goal: generation.goal,
      style: generation.style,
      duration: generation.duration,
      language: generation.language,
    }

    // Run the generation pipeline
    await runGenerationPipeline(
      generationId,
      brief,
      config,
      async (step, progress) => {
        await job.updateProgress({ step, progress })
      }
    )

    // Update credits used
    await db.generation.update({
      where: { id: generationId },
      data: { creditsUsed: CREDIT_COSTS.fullPack },
    })

    // Log analytics event
    await db.analyticsEvent.create({
      data: {
        teamId,
        eventType: 'generation_completed',
        metadata: {
          generationId,
          platform: generation.platform,
          style: generation.style,
        },
      },
    })

    console.log(`Generation job ${job.id} completed successfully`)
  } catch (error) {
    console.error(`Generation job ${job.id} failed:`, error)

    // Refund credits on failure
    await refundCredits({
      teamId,
      userId,
      amount: CREDIT_COSTS.fullPack,
      description: `Rückerstattung: Generierung fehlgeschlagen`,
    })

    // Update generation status
    await db.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
    })

    throw error
  }
}

async function processRegenerateSectionJob(job: Job<RegenerateSectionJobData>) {
  const { generationId, teamId, userId, section, instructions } = job.data

  console.log(`Processing regenerate section job ${job.id} for ${section}`)

  try {
    // Determine credit cost
    const creditCost =
      section === 'hooks'
        ? CREDIT_COSTS.hookOnly
        : section === 'scripts'
          ? CREDIT_COSTS.scriptOnly
          : CREDIT_COSTS.sectionRegen

    // Deduct credits
    await deductCredits({
      teamId,
      userId,
      amount: creditCost,
      description: `Regenerierung: ${section}`,
      metadata: { generationId, section },
    })

    // Regenerate the section
    await regenerateSection(generationId, section as any, instructions)

    console.log(`Regenerate section job ${job.id} completed`)
  } catch (error) {
    console.error(`Regenerate section job ${job.id} failed:`, error)
    throw error
  }
}

// Create and start the worker
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    if (job.name === 'generate') {
      await processGenerationJob(job as Job<GenerationJobData>)
    } else if (job.name === 'regenerate-section') {
      await processRegenerateSectionJob(job as Job<RegenerateSectionJobData>)
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('Worker started and listening for jobs...')

export { worker }
