/**
 * TypeScript types for NASA API data
 */

export interface APODResponse {
  title: string
  date: string
  explanation: string
  url: string
  hdurl?: string
  media_type: string
  service_version: string
  copyright?: string
}

export interface APODRequest {
  date?: string
  start_date?: string
  end_date?: string
  count?: number
  thumbs?: boolean
}

export interface APIError {
  detail: string
  status_code?: number
}
