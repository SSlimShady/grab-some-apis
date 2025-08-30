/**
 * NASA API service functions
 * Uses centralized constants and configuration
 */

import { CONFIG } from '@/lib/config'
import { NASAEndpoint } from '@/lib/enums'
import { ENV } from '@/lib/env'
import { APIError, APODRequest, APODResponse } from '@/types/nasa'

// Use environment variable for API base URL
const API_BASE_URL = ENV.BACKEND_API_BASE_URL || 'http://localhost:8000'

class NASAAPIError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
    this.name = 'NASAAPIError'
  }
}

/**
 * Fetch Astronomy Picture of the Day from NASA API
 */
export async function fetchAPOD(
  params?: APODRequest
): Promise<APODResponse | APODResponse[]> {
  const searchParams = new URLSearchParams()

  if (params?.date) {
    searchParams.append('date', params.date)
  }
  if (params?.start_date) {
    searchParams.append('start_date', params.start_date)
  }
  if (params?.end_date) {
    searchParams.append('end_date', params.end_date)
  }
  if (params?.count) {
    searchParams.append('count', params.count.toString())
  }
  if (params?.thumbs !== undefined) {
    searchParams.append('thumbs', params.thumbs.toString())
  }

  // Use enum for endpoint
  const url = `${API_BASE_URL}/api/v1/nasa${NASAEndpoint.APOD}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 3600 }, // Cache for 1 hour
      // Use config for timeout
      signal: AbortSignal.timeout(CONFIG.nasa.timeout),
    })

    if (!response.ok) {
      let errorDetail = 'Failed to fetch NASA APOD data'

      try {
        const errorData: APIError = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        // If we can't parse error response, use default message
      }

      throw new NASAAPIError(response.status, errorDetail)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof NASAAPIError) {
      throw error
    }

    // Network or other errors
    throw new NASAAPIError(500, 'Network error: Unable to connect to NASA API')
  }
}

/**
 * Format date for NASA API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Parse date from NASA API format
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Get today's date in NASA API format
 */
export function getTodayFormatted(): string {
  return formatDateForAPI(new Date())
}

/**
 * Get date N days ago in NASA API format
 */
export function getDaysAgoFormatted(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateForAPI(date)
}

export { NASAAPIError }
