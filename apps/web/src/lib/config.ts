/**
 * Application configuration with runtime validation
 */

interface AppConfig {
  readonly images: {
    readonly fallback: string
    readonly formats: readonly string[]
    readonly maxSize: number
  }
  readonly api: {
    readonly timeout: number
    readonly retries: number
  }
  readonly ui: {
    readonly debounceMs: number
    readonly animationDuration: number
  }
}

// Configuration object with defaults
export const CONFIG: AppConfig = {
  images: {
    fallback: '/next.svg',
    formats: ['webp', 'avif', 'jpeg', 'png', 'gif'] as const,
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  api: {
    timeout: 10000, // 10 seconds
    retries: 3,
  },
  ui: {
    debounceMs: 300,
    animationDuration: 200,
  },
} as const

// Type helper to ensure config keys exist
export type ConfigKey = keyof typeof CONFIG
export type ImageConfig = typeof CONFIG.images
export type APIConfig = typeof CONFIG.api

// Runtime validation function
export function validateConfig(): void {
  if (!CONFIG.images.fallback.startsWith('/')) {
    throw new Error('Image fallback must be an absolute path')
  }

  if (CONFIG.api.timeout <= 0) {
    throw new Error('API timeout must be positive')
  }
}
