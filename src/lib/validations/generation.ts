import { z } from 'zod'

export const generationInputSchema = z.object({
  brandId: z.string().min(1, 'Brand erforderlich'),
  productId: z.string().optional(),
  templateId: z.string().optional(),
  platform: z.enum(['TIKTOK', 'INSTAGRAM_REELS', 'YOUTUBE_SHORTS']).default('TIKTOK'),
  goal: z.enum(['SALES', 'LEADS', 'APP_INSTALL', 'AWARENESS', 'ENGAGEMENT']).default('SALES'),
  style: z.enum(['CASUAL', 'PROFESSIONAL', 'GENZ', 'HUMOROUS', 'EMOTIONAL', 'EDUCATIONAL']).default('CASUAL'),
  duration: z.number().min(15).max(60).default(30),
  language: z.string().default('de'),

  // Optional product info if no productId
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  productPrice: z.string().optional(),
  productBenefits: z.array(z.string()).optional(),
  productObjections: z.array(z.string()).optional(),
})

export const regenerateSectionSchema = z.object({
  generationId: z.string().min(1),
  section: z.enum(['hooks', 'scripts', 'shotlist', 'voiceover', 'captions', 'ctas', 'objectionHandling', 'adCopy']),
  instructions: z.string().optional(),
})

export type GenerationInput = z.infer<typeof generationInputSchema>
export type RegenerateSectionInput = z.infer<typeof regenerateSectionSchema>

// Output schemas for AI generation
export const hookSchema = z.object({
  id: z.string(),
  text: z.string(),
  pattern: z.enum([
    'question', 'statistic', 'controversy', 'story', 'pain_point',
    'benefit', 'curiosity', 'social_proof', 'urgency', 'comparison'
  ]),
  reasoning: z.string(),
})

export const sceneSchema = z.object({
  sceneNumber: z.number(),
  duration: z.number(),
  visual: z.string(),
  audio: z.string(),
  text: z.string().optional(),
  bRoll: z.string().optional(),
})

export const scriptSchema = z.object({
  id: z.string(),
  variant: z.enum(['A', 'B', 'C']),
  hook: z.string(),
  scenes: z.array(sceneSchema),
  cta: z.string(),
  totalDuration: z.number(),
})

export const shotlistItemSchema = z.object({
  shotNumber: z.number(),
  type: z.enum(['talking_head', 'product_shot', 'b_roll', 'screen_recording', 'lifestyle']),
  description: z.string(),
  duration: z.number(),
  notes: z.string().optional(),
  equipment: z.array(z.string()).optional(),
})

export const ctaSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['primary', 'soft', 'urgency', 'benefit', 'social_proof']),
})

export const adCopySchema = z.object({
  platform: z.string(),
  primaryText: z.string(),
  headline: z.string(),
  description: z.string().optional(),
})

export type Hook = z.infer<typeof hookSchema>
export type Scene = z.infer<typeof sceneSchema>
export type Script = z.infer<typeof scriptSchema>
export type ShotlistItem = z.infer<typeof shotlistItemSchema>
export type CTA = z.infer<typeof ctaSchema>
export type AdCopy = z.infer<typeof adCopySchema>
