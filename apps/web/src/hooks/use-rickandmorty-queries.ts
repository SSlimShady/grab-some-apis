import {
  fetchRickAndMortyCharacters,
  fetchRickAndMortyEpisodes,
  fetchRickAndMortyLocations,
} from '@/lib/api/rickandmorty-api'
import {
  RickAndMortyCharacterRequest,
  RickAndMortyEpisodeRequest,
  RickAndMortyLocationRequest,
} from '@/types/rickandmorty'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export const rickandmortyKeys = {
  all: ['rickandmorty'] as const,

  characters: (params: RickAndMortyCharacterRequest) =>
    [...rickandmortyKeys.all, 'characters', 'search', params] as const,

  charactersInfinite: (params: Omit<RickAndMortyCharacterRequest, 'page'>) =>
    [...rickandmortyKeys.all, 'characters', 'infinite', params] as const,

  charactersByIds: (params: RickAndMortyCharacterRequest) => {
    const ids = params.ids
    const normalizedIds = Array.isArray(ids) ? ids.sort().join(',') : ids
    return [
      ...rickandmortyKeys.all,
      'characters',
      'byIds',
      normalizedIds,
    ] as const
  },

  locations: (params: RickAndMortyLocationRequest) =>
    [...rickandmortyKeys.all, 'locations', 'search', params] as const,

  locationsInfinite: (params: RickAndMortyLocationRequest) =>
    [...rickandmortyKeys.all, 'locations', 'infinite', params] as const,

  episodes: (params: RickAndMortyEpisodeRequest) =>
    [...rickandmortyKeys.all, 'episodes', 'search', params] as const,

  episodesInfinite: (params: RickAndMortyEpisodeRequest) =>
    [...rickandmortyKeys.all, 'episodes', 'infinite', params] as const,
}

export const useRickAndMortyCharacters = (
  params: RickAndMortyCharacterRequest
) => {
  return useQuery({
    queryKey: rickandmortyKeys.characters(params),
    queryFn: () => fetchRickAndMortyCharacters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: (params.ids?.length ?? 0) == 0,
  })
}

// Get specific characters by IDs
export const useRickAndMortyCharactersByIds = (
  params: RickAndMortyCharacterRequest
) => {
  return useQuery({
    queryKey: rickandmortyKeys.charactersByIds(params),
    queryFn: () => fetchRickAndMortyCharacters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: (params.ids?.length ?? 0) > 0,
  })
}

// Infinite query for characters with pagination
export const useRickAndMortyCharactersInfinite = (
  params: Omit<RickAndMortyCharacterRequest, 'page'> = {}
) => {
  return useInfiniteQuery({
    queryKey: rickandmortyKeys.charactersInfinite(params),
    queryFn: ({ pageParam = 1 }) =>
      fetchRickAndMortyCharacters({ ...params, page: pageParam }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: (params.ids?.length ?? 0) === 0, // Don't run if IDs are provided
    getNextPageParam: lastPage => {
      // Extract page number from the next URL
      if (lastPage.info.next) {
        const url = new URL(lastPage.info.next)
        const nextPage = url.searchParams.get('page')
        return nextPage ? parseInt(nextPage, 10) : undefined
      }
      return undefined
    },
    getPreviousPageParam: firstPage => {
      // Extract page number from the prev URL
      if (firstPage.info.prev) {
        const url = new URL(firstPage.info.prev)
        const prevPage = url.searchParams.get('page')
        return prevPage ? parseInt(prevPage, 10) : undefined
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

// Infinite query for episodes with pagination
export const useRickAndMortyEpisodesInfinite = (
  params: RickAndMortyEpisodeRequest = {}
) => {
  return useInfiniteQuery({
    queryKey: rickandmortyKeys.episodesInfinite(params),
    queryFn: ({ pageParam = 1 }) =>
      fetchRickAndMortyEpisodes({ ...params, page: pageParam }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    getNextPageParam: lastPage => {
      if (lastPage.info.next) {
        const url = new URL(lastPage.info.next)
        const nextPage = url.searchParams.get('page')
        return nextPage ? parseInt(nextPage, 10) : undefined
      }
      return undefined
    },
    getPreviousPageParam: firstPage => {
      if (firstPage.info.prev) {
        const url = new URL(firstPage.info.prev)
        const prevPage = url.searchParams.get('page')
        return prevPage ? parseInt(prevPage, 10) : undefined
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

// Infinite query for locations with pagination
export const useRickAndMortyLocationsInfinite = (
  params: RickAndMortyLocationRequest = {}
) => {
  return useInfiniteQuery({
    queryKey: rickandmortyKeys.locationsInfinite(params),
    queryFn: ({ pageParam = 1 }) =>
      fetchRickAndMortyLocations({ ...params, page: pageParam }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    getNextPageParam: lastPage => {
      if (lastPage.info.next) {
        const url = new URL(lastPage.info.next)
        const nextPage = url.searchParams.get('page')
        return nextPage ? parseInt(nextPage, 10) : undefined
      }
      return undefined
    },
    getPreviousPageParam: firstPage => {
      if (firstPage.info.prev) {
        const url = new URL(firstPage.info.prev)
        const prevPage = url.searchParams.get('page')
        return prevPage ? parseInt(prevPage, 10) : undefined
      }
      return undefined
    },
    initialPageParam: 1,
  })
}
