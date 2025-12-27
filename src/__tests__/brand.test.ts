import { describe, it, expect } from 'vitest'
import { brandSchema, productSchema } from '@/lib/validations/brand'

describe('Brand Validation', () => {
  describe('brandSchema', () => {
    it('should validate correct brand input', () => {
      const validInput = {
        name: 'Acme Corp',
        description: 'Eine tolle Firma',
        targetAudience: 'Junge Erwachsene 18-35',
        tonality: ['locker', 'professionell'],
        usps: ['Kostenloser Versand', 'Top Qualitaet'],
        noGos: ['Aggressive Werbung'],
        language: 'de',
        region: 'DE',
        industry: 'ECOMMERCE',
        websiteUrl: 'https://acme.com',
      }

      const result = brandSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept minimal input with defaults', () => {
      const minimalInput = {
        name: 'Acme Corp',
      }

      const result = brandSchema.safeParse(minimalInput)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.language).toBe('de')
        expect(result.data.region).toBe('DE')
        expect(result.data.industry).toBe('OTHER')
        expect(result.data.tonality).toEqual([])
      }
    })

    it('should reject too short name', () => {
      const invalidInput = {
        name: 'A',
      }

      const result = brandSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject invalid industry', () => {
      const invalidInput = {
        name: 'Acme Corp',
        industry: 'INVALID_INDUSTRY',
      }

      const result = brandSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should accept empty websiteUrl', () => {
      const input = {
        name: 'Acme Corp',
        websiteUrl: '',
      }

      const result = brandSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should reject invalid websiteUrl', () => {
      const input = {
        name: 'Acme Corp',
        websiteUrl: 'not-a-url',
      }

      const result = brandSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('productSchema', () => {
    it('should validate correct product input', () => {
      const validInput = {
        name: 'Premium Widget',
        description: 'Ein tolles Produkt',
        price: '29,99',
        currency: 'EUR',
        benefits: ['Langlebig', 'Umweltfreundlich'],
        objections: ['Zu teuer'],
        reviews: ['Super Produkt!'],
      }

      const result = productSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept minimal input', () => {
      const minimalInput = {
        name: 'Widget',
      }

      const result = productSchema.safeParse(minimalInput)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.currency).toBe('EUR')
        expect(result.data.benefits).toEqual([])
      }
    })

    it('should reject too short name', () => {
      const invalidInput = {
        name: 'W',
      }

      const result = productSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})
