import { Queue } from 'bullmq'
import { redisConnection, QUEUE_NAME, defaultJobOptions } from './config'
import { GenerationInput } from '@/lib/validations/generation'

export interface GenerationJobData {
  generationId: string
  teamId: string
  userId: string
  brandId: string
  productId?: string
  templateId?: string
  input: GenerationInput
}

export interface RegenerateSectionJobData {
  generationId: string
  teamId: string
  userId: string
  section: string
  instructions?: string
}

const globalForQueue = globalThis as unknown as {
  generationQueue: Queue<GenerationJobData | RegenerateSectionJobData> | undefined
}

export const generationQueue = globalForQueue.generationQueue ?? new Queue<GenerationJobData | RegenerateSectionJobData>(
  QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions,
  }
)

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.generationQueue = generationQueue
}

export async function addGenerationJob(data: GenerationJobData): Promise<string> {
  const job = await generationQueue.add('generate', data, {
    jobId: `gen-${data.generationId}`,
  })
  return job.id!
}

export async function addRegenerateSectionJob(data: RegenerateSectionJobData): Promise<string> {
  const job = await generationQueue.add('regenerate-section', data, {
    jobId: `regen-${data.generationId}-${data.section}-${Date.now()}`,
  })
  return job.id!
}

export async function getJobStatus(jobId: string) {
  const job = await generationQueue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  const progress = job.progress

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  }
}
