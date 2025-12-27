import { describe, it, expect } from 'vitest'
import {
  generationInputSchema,
  hookSchema,
  scriptSchema,
  ctaSchema,
} from '@/lib/validations/generation'

describe('Generation Validation', () => {
  describe('generationInputSchema', () => {
    it('should validate correct input', () => {
      const validInput = {
        brandId: 'brand_123',
        platform: 'TIKTOK',
        goal: 'SALES',
        style: 'CASUAL',
        duration: 30,
        language: 'de',
      }

      const result = generationInputSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should use default values', () => {
      const minimalInput = {
        brandId: 'brand_123',
      }

      const result = generationInputSchema.safeParse(minimalInput)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.platform).toBe('TIKTOK')
        expect(result.data.goal).toBe('SALES')
        expect(result.data.style).toBe('CASUAL')
        expect(result.data.duration).toBe(30)
      }
    })

    it('should reject invalid platform', () => {
      const invalidInput = {
        brandId: 'brand_123',
        platform: 'INVALID_PLATFORM',
      }

      const result = generationInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject invalid duration', () => {
      const invalidInput = {
        brandId: 'brand_123',
        duration: 120, // max is 60
      }

      const result = generationInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject empty brandId', () => {
      const invalidInput = {
        brandId: '',
      }

      const result = generationInputSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe('hookSchema', () => {
    it('should validate correct hook', () => {
      const validHook = {
        id: 'hook_1',
        text: 'POV: Du hast endlich das perfekte Produkt gefunden',
        pattern: 'curiosity',
        reasoning: 'Weckt Neugier durch POV-Format',
      }

      const result = hookSchema.safeParse(validHook)
      expect(result.success).toBe(true)
    })

    it('should reject invalid pattern', () => {
      const invalidHook = {
        id: 'hook_1',
        text: 'Some hook text',
        pattern: 'invalid_pattern',
        reasoning: 'Some reasoning',
      }

      const result = hookSchema.safeParse(invalidHook)
      expect(result.success).toBe(false)
    })
  })

  describe('ctaSchema', () => {
    it('should validate correct CTA', () => {
      const validCta = {
        id: 'cta_1',
        text: 'Jetzt bestellen und 20% sparen',
        type: 'primary',
      }

      const result = ctaSchema.safeParse(validCta)
      expect(result.success).toBe(true)
    })

    it('should accept all CTA types', () => {
      const types = ['primary', 'soft', 'urgency', 'benefit', 'social_proof']

      types.forEach((type) => {
        const cta = {
          id: `cta_${type}`,
          text: 'Some CTA text',
          type,
        }

        const result = ctaSchema.safeParse(cta)
        expect(result.success).toBe(true)
      })
    })
  })
})
