import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  tonality: z.array(z.string()).default([]),
  usps: z.array(z.string()).default([]),
  noGos: z.array(z.string()).default([]),
  language: z.string().default('de'),
  region: z.string().default('DE'),
  industry: z.enum([
    'BEAUTY', 'FITNESS', 'SAAS', 'FOOD', 'LOCAL_SERVICE',
    'EVENTS', 'ECOMMERCE', 'FASHION', 'HEALTH', 'FINANCE',
    'EDUCATION', 'TRAVEL', 'OTHER'
  ]).default('OTHER'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  description: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().default('EUR'),
  benefits: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  reviews: z.array(z.string()).default([]),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  imageUrls: z.array(z.string()).default([]),
})

export type BrandInput = z.infer<typeof brandSchema>
export type ProductInput = z.infer<typeof productSchema>
