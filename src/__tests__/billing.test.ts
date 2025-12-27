import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PLANS, CREDIT_PACKS, CREDIT_COSTS } from '@/lib/stripe'

describe('Billing Configuration', () => {
  describe('Plans', () => {
    it('should have three subscription plans', () => {
      expect(Object.keys(PLANS)).toHaveLength(3)
      expect(PLANS.starter).toBeDefined()
      expect(PLANS.professional).toBeDefined()
      expect(PLANS.agency).toBeDefined()
    })

    it('should have valid price for all plans', () => {
      Object.values(PLANS).forEach((plan) => {
        expect(plan.price).toBeGreaterThan(0)
        expect(typeof plan.price).toBe('number')
      })
    })

    it('should have credits for all plans', () => {
      Object.values(PLANS).forEach((plan) => {
        expect(plan.credits).toBeGreaterThan(0)
      })
    })

    it('should have increasing credits with price', () => {
      expect(PLANS.starter.credits).toBeLessThan(PLANS.professional.credits)
      expect(PLANS.professional.credits).toBeLessThan(PLANS.agency.credits)
    })

    it('should have stripe price IDs', () => {
      Object.values(PLANS).forEach((plan) => {
        expect(plan.stripePriceId).toBeDefined()
        expect(typeof plan.stripePriceId).toBe('string')
      })
    })
  })

  describe('Credit Packs', () => {
    it('should have three credit packs', () => {
      expect(Object.keys(CREDIT_PACKS)).toHaveLength(3)
      expect(CREDIT_PACKS.small).toBeDefined()
      expect(CREDIT_PACKS.medium).toBeDefined()
      expect(CREDIT_PACKS.large).toBeDefined()
    })

    it('should have valid prices', () => {
      Object.values(CREDIT_PACKS).forEach((pack) => {
        expect(pack.price).toBeGreaterThan(0)
      })
    })

    it('should have better value for larger packs', () => {
      const smallPricePerCredit = CREDIT_PACKS.small.price / CREDIT_PACKS.small.credits
      const mediumPricePerCredit = CREDIT_PACKS.medium.price / CREDIT_PACKS.medium.credits
      const largePricePerCredit = CREDIT_PACKS.large.price / CREDIT_PACKS.large.credits

      expect(mediumPricePerCredit).toBeLessThan(smallPricePerCredit)
      expect(largePricePerCredit).toBeLessThan(mediumPricePerCredit)
    })
  })

  describe('Credit Costs', () => {
    it('should have defined credit costs', () => {
      expect(CREDIT_COSTS.fullPack).toBe(10)
      expect(CREDIT_COSTS.hookOnly).toBe(2)
      expect(CREDIT_COSTS.scriptOnly).toBe(3)
      expect(CREDIT_COSTS.sectionRegen).toBe(1)
    })

    it('should have full pack cost higher than individual sections', () => {
      expect(CREDIT_COSTS.fullPack).toBeGreaterThan(CREDIT_COSTS.hookOnly)
      expect(CREDIT_COSTS.fullPack).toBeGreaterThan(CREDIT_COSTS.scriptOnly)
      expect(CREDIT_COSTS.fullPack).toBeGreaterThan(CREDIT_COSTS.sectionRegen)
    })
  })
})
