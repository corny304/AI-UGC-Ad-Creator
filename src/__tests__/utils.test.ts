import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCredits,
  formatCurrency,
  slugify,
  generateId,
  truncate,
  hashProductBrief,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('formatCredits', () => {
    it('should format credits with German locale', () => {
      expect(formatCredits(1000)).toBe('1.000')
      expect(formatCredits(100)).toBe('100')
      expect(formatCredits(1234567)).toBe('1.234.567')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in EUR', () => {
      const result = formatCurrency(2900, 'EUR')
      expect(result).toContain('29')
      expect(result).toContain('EUR') || expect(result).toContain('€')
    })

    it('should handle cents correctly', () => {
      const result = formatCurrency(999, 'EUR')
      expect(result).toContain('9,99') || expect(result).toContain('9.99')
    })
  })

  describe('slugify', () => {
    it('should create valid slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Foo  Bar')).toBe('foo-bar')
    })

    it('should handle German umlauts', () => {
      expect(slugify('Muehlstraße')).toBe('muehlstrasse')
      expect(slugify('Suess')).toBe('suess')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world')
    })

    it('should trim leading/trailing dashes', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should accept prefix', () => {
      const id = generateId('user')
      expect(id.startsWith('user_')).toBe(true)
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('Hello World', 5)
      expect(result).toBe('Hello...')
    })

    it('should not truncate short strings', () => {
      const result = truncate('Hello', 10)
      expect(result).toBe('Hello')
    })

    it('should handle exact length', () => {
      const result = truncate('Hello', 5)
      expect(result).toBe('Hello')
    })
  })

  describe('hashProductBrief', () => {
    it('should generate consistent hash', () => {
      const brief = { name: 'Product', price: '29.99' }
      const hash1 = hashProductBrief(brief)
      const hash2 = hashProductBrief(brief)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hash for different inputs', () => {
      const brief1 = { name: 'Product A' }
      const brief2 = { name: 'Product B' }
      expect(hashProductBrief(brief1)).not.toBe(hashProductBrief(brief2))
    })

    it('should be order-independent', () => {
      const brief1 = { name: 'Product', price: '29.99' }
      const brief2 = { price: '29.99', name: 'Product' }
      expect(hashProductBrief(brief1)).toBe(hashProductBrief(brief2))
    })
  })
})
