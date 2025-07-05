// Security utilities for the application
import { auditLogger } from './auditLogger'

// Rate limiting
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private defaultLimit = 100 // requests per window
  private windowMs = 15 * 60 * 1000 // 15 minutes

  isAllowed(key: string, limit?: number): boolean {
    const now = Date.now()
    const currentLimit = limit || this.defaultLimit
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (entry.count >= currentLimit) {
      auditLogger.log('rate_limit_exceeded', 'security', { key, limit: currentLimit }, 'warning')
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(key: string, limit?: number): number {
    const currentLimit = limit || this.defaultLimit
    const entry = this.limits.get(key)
    
    if (!entry || Date.now() > entry.resetTime) {
      return currentLimit
    }
    
    return Math.max(0, currentLimit - entry.count)
  }
}

export const rateLimiter = new RateLimiter()

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .slice(0, 1000) // Limit length
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Content Security Policy headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://*.supabase.co",
      "font-src 'self' data:",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  }
}

// Data encryption utilities (client-side)
export class ClientCrypto {
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()

  async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  async encryptData(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedData = this.encoder.encode(data)
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    )

    return { encrypted, iv }
  }

  async decryptData(encrypted: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    )

    return this.decoder.decode(decrypted)
  }

  async hashData(data: string): Promise<string> {
    const encodedData = this.encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export const clientCrypto = new ClientCrypto()

// Session security
export class SessionManager {
  private readonly SESSION_KEY = 'app_session'
  private readonly MAX_IDLE_TIME = 30 * 60 * 1000 // 30 minutes

  setLastActivity(): void {
    localStorage.setItem(`${this.SESSION_KEY}_last_activity`, Date.now().toString())
  }

  isSessionValid(): boolean {
    const lastActivity = localStorage.getItem(`${this.SESSION_KEY}_last_activity`)
    if (!lastActivity) return false

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity < this.MAX_IDLE_TIME
  }

  clearSession(): void {
    localStorage.removeItem(`${this.SESSION_KEY}_last_activity`)
    auditLogger.log('session_expired', 'security', {}, 'info')
  }

  extendSession(): void {
    if (this.isSessionValid()) {
      this.setLastActivity()
    } else {
      this.clearSession()
    }
  }
}

export const sessionManager = new SessionManager()

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}