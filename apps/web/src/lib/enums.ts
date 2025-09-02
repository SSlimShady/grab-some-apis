/**
 * Type-safe enums for consistent values across the app
 */

// Media types enum
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
}

// Loading states enum
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Image sizes enum
export enum ImageSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

// NASA API endpoints enum
export enum NASAEndpoint {
  APOD = '/apod',
}

// Rick and Morty API endpoints enum
export enum RickAndMortyEndpoint {
  CHARACTERS = 'rickandmorty/character',
  LOCATIONS = 'rickandmorty/location',
  EPISODES = 'rickandmorty/episode',
}
