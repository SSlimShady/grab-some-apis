'use client'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useRickAndMortyCharactersInfinite } from '@/hooks/use-rickandmorty-queries'
import {
  CharacterGender,
  CharacterStatus,
  type RickAndMortyCharacterRequest,
} from '@/types/rickandmorty'
import Image from 'next/image'
import { Fragment, useEffect, useRef, useState } from 'react'

// Skeleton component for loading states
function CharacterSkeleton() {
  return (
    <div className='animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='mb-3 h-48 w-full rounded bg-gray-300'></div>
      <div className='mb-2 h-6 rounded bg-gray-300'></div>
      <div className='space-y-2'>
        <div className='flex justify-between'>
          <div className='h-4 w-16 rounded bg-gray-200'></div>
          <div className='h-4 w-20 rounded bg-gray-200'></div>
        </div>
        <div className='flex justify-between'>
          <div className='h-4 w-16 rounded bg-gray-200'></div>
          <div className='h-4 w-24 rounded bg-gray-200'></div>
        </div>
        <div className='flex justify-between'>
          <div className='h-4 w-16 rounded bg-gray-200'></div>
          <div className='h-4 w-20 rounded bg-gray-200'></div>
        </div>
      </div>
    </div>
  )
}

// Loading spinner component
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={`${sizeClasses[size]} animate-spin text-blue-500`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  )
}

export function CharacterSearch() {
  const [filters, setFilters] = useState<
    Omit<RickAndMortyCharacterRequest, 'page' | 'ids'>
  >({
    name: '',
    status: null,
    species: '',
    gender: null,
  })

  // Debounce name for API calls; keep immediate local state for input responsiveness
  const debouncedName = useDebouncedValue(filters.name, 400)
  const queryFilters = { ...filters, name: debouncedName }
  const isTyping = filters.name !== debouncedName

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useRickAndMortyCharactersInfinite(queryFilters)

  // Infinite scroll functionality
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | null
  ) => {
    const normalized = value === '' ? null : value
    setFilters(prev => ({ ...prev, [key]: normalized }))
  }

  const totalCharacters =
    data?.pages.reduce(
      (total, page) => total + (page.results?.length || 0),
      0
    ) || 0

  // Show initial loading with skeletons ONLY if we have no data yet
  // Preserve previous results while new query loads after first success
  const hasLoadedOnceRef = useRef(false)
  useEffect(() => {
    if (status === 'success' && data) hasLoadedOnceRef.current = true
  }, [status, data])
  const isInitialLoading = status === 'pending' && !hasLoadedOnceRef.current

  if (isInitialLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-7xl px-4 py-8'>
          {/* Skeleton filters */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <div className='mb-4 h-6 w-32 animate-pulse rounded bg-gray-200'></div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <div className='h-4 w-16 animate-pulse rounded bg-gray-200'></div>
                  <div className='h-10 animate-pulse rounded bg-gray-200'></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton grid */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <CharacterSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='max-w-md rounded-lg bg-white p-8 text-center shadow-sm'>
          <div className='mb-4 text-5xl text-red-500'>⚠️</div>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            Error loading characters
          </h2>
          <p className='mb-4 text-gray-600'>
            {error?.message || 'Something went wrong. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Search filters */}
        <form
          role='search'
          aria-label='Character search filters'
          className='mb-6 rounded-lg bg-white p-6 shadow-sm'
          onSubmit={e => e.preventDefault()}
        >
          <fieldset>
            <legend className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
              🔍 Search Filters
            </legend>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {/* Name field with inline indicator (no layout shift) */}
              <div className='relative'>
                <label
                  htmlFor='name-filter'
                  className='mb-2 block text-sm font-medium text-gray-700'
                >
                  Name
                </label>
                <div className='relative'>
                  <input
                    id='name-filter'
                    type='text'
                    value={filters.name || ''}
                    onChange={e => handleFilterChange('name', e.target.value)}
                    placeholder='Search by name...'
                    autoComplete='off'
                    aria-label='Search by character name'
                    aria-controls='character-results'
                    aria-describedby='name-hint'
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {(isTyping || (isFetching && !isFetchingNextPage)) && (
                    <span
                      className='pointer-events-none absolute inset-y-0 right-2 flex items-center'
                      aria-hidden='true'
                    >
                      <LoadingSpinner size='sm' />
                    </span>
                  )}
                  <p id='name-hint' className='sr-only'>
                    Type 2+ characters to refine results
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor='status-select'
                  className='mb-2 block text-sm font-medium text-gray-700'
                >
                  Status
                </label>
                <select
                  id='status-select'
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Statuses</option>
                  {Object.values(CharacterStatus).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Species
                </label>
                <input
                  type='text'
                  value={filters.species || ''}
                  onChange={e => handleFilterChange('species', e.target.value)}
                  placeholder='e.g., Human, Alien...'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label
                  htmlFor='gender-select'
                  className='mb-2 block text-sm font-medium text-gray-700'
                >
                  Gender
                </label>
                <select
                  id='gender-select'
                  value={filters.gender || ''}
                  onChange={e => handleFilterChange('gender', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Genders</option>
                  {Object.values(CharacterGender).map(gender => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        </form>

        {/* Results info */}
        <div
          className='mb-6 flex flex-wrap items-center justify-between gap-4'
          aria-live='polite'
        >
          <div className='text-sm text-gray-600' id='results-summary'>
            {totalCharacters > 0 && (
              <>
                Showing{' '}
                <span className='font-medium text-gray-900'>
                  {totalCharacters}
                </span>{' '}
                characters
                {data?.pages[0]?.info.count && (
                  <>
                    {' '}
                    of{' '}
                    <span className='font-medium text-gray-900'>
                      {data.pages[0].info.count}
                    </span>{' '}
                    total
                  </>
                )}
              </>
            )}
            {totalCharacters === 0 && status === 'success' && (
              <span>No characters match your filters.</span>
            )}
          </div>
          <div className='flex items-center gap-4'>
            {isFetching && !isFetchingNextPage && (
              <div
                className='flex items-center gap-2 text-sm text-blue-600'
                aria-live='polite'
              >
                <LoadingSpinner size='sm' />
                Updating…
              </div>
            )}
            {(filters.name ||
              filters.status ||
              filters.gender ||
              filters.species) && (
              <button
                type='button'
                onClick={() =>
                  setFilters({
                    name: '',
                    status: null,
                    species: '',
                    gender: null,
                  })
                }
                className='rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100'
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Character grid */}
        <div
          className='relative'
          id='character-results'
          {...(isFetching && { 'aria-busy': 'true' })}
        >
          {/* Overlay only when refetching and we have prior content */}
          {isFetching && !isFetchingNextPage && data && (
            <div
              className='absolute inset-0 z-10 bg-white/60 backdrop-blur-sm'
              aria-hidden='true'
            >
              <div className='grid h-full grid-cols-1 gap-6 overflow-hidden p-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {[...Array(8)].map((_, i) => (
                  <CharacterSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          <ul className='grid list-none grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {data?.pages.map((page, i) => (
              <Fragment key={i}>
                {page.results?.map(character => (
                  <li
                    key={character.id}
                    className='group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 hover:-translate-y-1 hover:shadow-md'
                  >
                    {character.image && (
                      <div className='relative mb-4'>
                        <Image
                          src={character.image}
                          alt={character.name || 'Character avatar'}
                          width={300}
                          height={192}
                          className='h-48 w-full rounded-lg object-cover'
                          loading='lazy'
                        />
                        <div
                          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                            character.status === 'Alive'
                              ? 'bg-green-100 text-green-800'
                              : character.status === 'Dead'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {character.status}
                        </div>
                      </div>
                    )}
                    <h3 className='mb-3 line-clamp-2 text-lg font-semibold text-gray-900'>
                      {character.name}
                    </h3>
                    <dl className='space-y-2 text-sm'>
                      <div className='flex items-center justify-between'>
                        <dt className='text-gray-500'>Species</dt>
                        <dd className='text-right font-medium text-gray-900'>
                          {character.species}
                        </dd>
                      </div>
                      <div className='flex items-center justify-between'>
                        <dt className='text-gray-500'>Gender</dt>
                        <dd className='font-medium text-gray-900'>
                          {character.gender}
                        </dd>
                      </div>
                      {character.location?.name && (
                        <div className='flex items-center justify-between'>
                          <dt className='text-gray-500'>Location</dt>
                          <dd className='text-right text-xs font-medium text-gray-900'>
                            {character.location.name}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </Fragment>
            ))}
          </ul>
        </div>

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className='mt-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <CharacterSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className='mt-8 h-10' />

        {/* No more results */}
        {!hasNextPage && totalCharacters > 0 && (
          <div className='mt-12 py-8 text-center'>
            <div className='mb-2 text-4xl'>🎉</div>
            <p className='mb-4 text-gray-500'>
              You&apos;ve seen all {totalCharacters} characters!
            </p>
          </div>
        )}

        {/* No results */}
        {totalCharacters === 0 && status === 'success' && (
          <div className='py-16 text-center'>
            <div className='mb-4 text-6xl'>🔍</div>
            <h3 className='mb-2 text-xl font-semibold text-gray-900'>
              No characters found
            </h3>
            <p className='mb-4 text-gray-500'>
              Try adjusting your search filters
            </p>
            <button
              onClick={() =>
                setFilters({
                  name: '',
                  status: null,
                  species: '',
                  gender: null,
                })
              }
              className='rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
