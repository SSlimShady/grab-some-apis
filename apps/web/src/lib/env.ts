/**
 * Environment Configuration
 * Type-safe environment variables with fallbacks
 */

// Environment variables with type safety and fallbacks
export const ENV = {
  NASA_API_KEY: process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY',
  NASA_BASE_URL:
    process.env.NEXT_PUBLIC_NASA_BASE_URL || 'https://api.nasa.gov',
  APOD_BASE_URL:
    process.env.NEXT_PUBLIC_APOD_BASE_URL || 'https://apod.nasa.gov/apod',
  BACKEND_API_BASE_URL:
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const

// Validate required environment variables
if (typeof window === 'undefined') {
  // Server-side validation
  const requiredEnvVars = ['NEXT_PUBLIC_NASA_API_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`)
  }
}
