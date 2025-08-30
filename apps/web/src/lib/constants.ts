/**
 * Application Constants
 * Centralized location for all constant values used throughout the app
 */

// Image Constants
export const IMAGES = {
  FALLBACK: '/placeholder.jpg',
  PLACEHOLDER_BLUR:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAGAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD4x8KfEvwR4S8OSXLeFJNY8RXUYija/wBjW1u2AGYDOX5BxkDHHXFeTXGtW0txK5sIQWYtwo7miitOrFfQ/9k=',
} as const

// NASA API Constants
export const NASA = {
  MEDIA_TYPES: {
    IMAGE: 'image',
    VIDEO: 'video',
  },
  FILE_EXTENSIONS: {
    GIF: '.gif',
    JPG: '.jpg',
    JPEG: '.jpeg',
    PNG: '.png',
  },
} as const

// UI Constants
export const UI = {
  LOADING_MESSAGES: {
    IMAGE: 'Loading image...',
    GIF: 'Loading GIF...',
    GENERAL: 'Loading...',
    NASA: 'Loading awesome NASA data...',
  },
  DATE_FORMAT: {
    LOCALE: 'en-US',
    OPTIONS: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
    },
  },
} as const

// Error Messages
export const ERRORS = {
  IMAGE_LOAD_FAILED: 'Failed to load image',
  NETWORK_ERROR: 'Network error occurred',
  GENERIC: 'Something went wrong',
  NASA_DATA_LOAD_FAILED: 'Failed to Load NASA Data',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
} as const
