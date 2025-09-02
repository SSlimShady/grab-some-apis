import {
  RickAndMortyCharacterRequest,
  RickAndMortyCharacterResponse,
  RickAndMortyEpisodeRequest,
  RickAndMortyEpisodeResponse,
  RickAndMortyLocationRequest,
  RickAndMortyLocationResponse,
} from '@/types/rickandmorty'
import { CONFIG } from '../config'
import { RickAndMortyEndpoint } from '../enums'
import { ENV } from '../env'

const API_BASE_URL = ENV.BACKEND_API_BASE_URL || 'http://localhost:8000'

class RickAndMortyAPIError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
    this.name = 'RickAndMortyAPIError'
  }
}

export const fetchRickAndMortyCharacters = async (
  params: RickAndMortyCharacterRequest
): Promise<RickAndMortyCharacterResponse> => {
  try {
    const searchParams = new URLSearchParams()
    const pathParams =
      params.ids && params.ids.length > 0 ? params.ids.join(',') : null
    if (params.name) searchParams.append('name', params.name)
    if (params.gender) searchParams.append('gender', params.gender)
    if (params.status) searchParams.append('status', params.status)
    if (params.species) searchParams.append('species', params.species)
    if (params.type) searchParams.append('type', params.type)
    if (params.page) searchParams.append('page', params.page.toString())

    const url = `${API_BASE_URL}/${RickAndMortyEndpoint.CHARACTERS}${pathParams ? `/${pathParams}` : ''}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(CONFIG.api.timeout),
    })

    if (!response.ok) {
      throw new RickAndMortyAPIError(
        response.status,
        'Failed to fetch Rick and Morty characters'
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RickAndMortyAPIError) {
      throw error
    }
    throw new RickAndMortyAPIError(
      500,
      'Network error: Unable to connect to Rick and Morty API'
    )
  }
}

export const fetchRickAndMortyEpisodes = async (
  params: RickAndMortyEpisodeRequest & { page?: number }
): Promise<RickAndMortyEpisodeResponse> => {
  try {
    const searchParams = new URLSearchParams()
    if (params.name) searchParams.append('name', params.name)
    if (params.episode) searchParams.append('episode', params.episode)
    if (params.page) searchParams.append('page', params.page.toString())

    const url = `${API_BASE_URL}/${RickAndMortyEndpoint.EPISODES}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(CONFIG.api.timeout),
    })

    if (!response.ok) {
      throw new RickAndMortyAPIError(
        response.status,
        'Failed to fetch Rick and Morty episodes'
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RickAndMortyAPIError) {
      throw error
    }
    throw new RickAndMortyAPIError(
      500,
      'Network error: Unable to connect to Rick and Morty API'
    )
  }
}

export const fetchRickAndMortyLocations = async (
  params: RickAndMortyLocationRequest & { page?: number }
): Promise<RickAndMortyLocationResponse> => {
  try {
    const searchParams = new URLSearchParams()
    if (params.name) searchParams.append('name', params.name)
    if (params.type) searchParams.append('type', params.type)
    if (params.dimension) searchParams.append('dimension', params.dimension)
    if (params.page) searchParams.append('page', params.page.toString())

    const url = `${API_BASE_URL}/${RickAndMortyEndpoint.LOCATIONS}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(CONFIG.api.timeout),
    })

    if (!response.ok) {
      throw new RickAndMortyAPIError(
        response.status,
        'Failed to fetch Rick and Morty locations'
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RickAndMortyAPIError) {
      throw error
    }
    throw new RickAndMortyAPIError(
      500,
      'Network error: Unable to connect to Rick and Morty API'
    )
  }
}
