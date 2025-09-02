export enum CharacterStatus {
  ALIVE = 'Alive',
  DEAD = 'Dead',
  UNKNOWN = 'unknown',
}

export enum CharacterGender {
  MALE = 'Male',
  FEMALE = 'Female',
  GENDERLESS = 'Genderless',
  UNKNOWN = 'unknown',
}

export type CharacterStatusValue = `${CharacterStatus}`
export type CharacterGenderValue = `${CharacterGender}`

export interface RickAndMortyCharacterRequest {
  name?: string | null
  status?: CharacterStatusValue | null
  species?: string | null
  type?: string | null
  gender?: CharacterGenderValue | null
  page?: number | null
  ids?: number[] | null
}

export interface LocationReference {
  name: string
  url: string
}

export interface RickAndMortyCharacter {
  id: number
  name?: string | null
  status?: CharacterStatusValue | null
  species?: string | null
  type?: string | null
  gender?: CharacterGenderValue | null
  origin?: LocationReference | null
  location?: LocationReference | null
  image?: string | null
  episode?: string[] | null
  url?: string | null
  created?: string | null
}

export interface RickAndMortyPagination {
  count: number
  pages: number
  next?: string | null
  prev?: string | null
}

export interface RickAndMortyCharacterResponse {
  info: RickAndMortyPagination
  results?: RickAndMortyCharacter[] | null
}

export interface RickAndMortyLocationRequest {
  name?: string | null
  type?: string | null
  dimension?: string | null
}

export interface RickAndMortyLocation {
  id: number
  name?: string | null
  type?: string | null
  dimension?: string | null
  residents?: string[] | null
  url?: string | null
  created?: string | null
}

export interface RickAndMortyLocationResponse {
  info: RickAndMortyPagination
  results?: RickAndMortyLocation[] | null
}

export interface RickAndMortyEpisodeRequest {
  name?: string | null
  episode?: string | null
}

export interface RickAndMortyEpisode {
  id: number
  name?: string | null
  air_date?: string | null
  episode?: string | null
  characters?: string[] | null
  url?: string | null
  created?: string | null
}

export interface RickAndMortyEpisodeResponse {
  info: RickAndMortyPagination
  results?: RickAndMortyEpisode[] | null
}
