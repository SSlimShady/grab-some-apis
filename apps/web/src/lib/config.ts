/**
 * Application configuration with runtime validation
 */

interface AppConfig {
  readonly images: {
    readonly fallback: string
    readonly formats: readonly string[]
    readonly maxSize: number
  }
  readonly nasa: {
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
  nasa: {
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
export type NASAConfig = typeof CONFIG.nasa

// Runtime validation function
export function validateConfig(): void {
  if (!CONFIG.images.fallback.startsWith('/')) {
    throw new Error('Image fallback must be an absolute path')
  }

  if (CONFIG.nasa.timeout <= 0) {
    throw new Error('NASA timeout must be positive')
  }
}
