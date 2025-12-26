import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerSchema, loginSchema } from '@/lib/validations/auth'

describe('Auth Validation', () => {
  describe('registerSchema', () => {
    it('should validate a correct registration input', () => {
      const validInput = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      }

      const result = registerSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidInput = {
        name: 'Max Mustermann',
        email: 'not-an-email',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      }

      const result = registerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase', () => {
      const invalidInput = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        password: 'securepass123',
        confirmPassword: 'securepass123',
      }

      const result = registerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const invalidInput = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        password: 'SecurePass',
        confirmPassword: 'SecurePass',
      }

      const result = registerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject mismatching passwords', () => {
      const invalidInput = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
      }

      const result = registerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject too short password', () => {
      const invalidInput = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        password: 'Short1',
        confirmPassword: 'Short1',
      }

      const result = registerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate a correct login input', () => {
      const validInput = {
        email: 'max@example.com',
        password: 'anypassword',
      }

      const result = loginSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidInput = {
        email: 'not-an-email',
        password: 'anypassword',
      }

      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidInput = {
        email: 'max@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})
