'use client'

/**
 * NASA Astronomy Picture of the Day (APOD) Page
 */

import {
  APODCard,
  DatePicker,
  ErrorMessage,
  LoadingSpinner,
  PageHeader,
} from '@/components/ui/nasa-components'
import {
  useAPODByDate,
  useAPODRandom,
  useAPODToday,
  usePrefetchAdjacentDates,
} from '@/hooks/use-nasa-queries'
import { useNASAStore } from '@/stores/nasa-store'
import { APODResponse } from '@/types/nasa'
import Link from 'next/link'
import { useEffect } from 'react'

export default function NASAPage() {
  const {
    favorites,
    preferences,
    toggleFavorite,
    isFavorite,
    setViewMode,
    setRandomCount,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isToday,
    canGoNext,
    canGoPrevious,
  } = useNASAStore()

  const { viewMode, randomCount, selectedDate } = preferences

  // Query hooks based on view mode
  const todayQuery = useAPODToday()
  const dateQuery = useAPODByDate(viewMode === 'date' ? selectedDate : '')
  const randomQuery = useAPODRandom(randomCount)

  // Prefetching for better UX
  const { prefetchAdjacent } = usePrefetchAdjacentDates(selectedDate)

  // Prefetch adjacent dates when viewing by date
  useEffect(() => {
    if (viewMode === 'date') {
      prefetchAdjacent()
    }
  }, [selectedDate, viewMode, prefetchAdjacent])

  // Get current query based on view mode
  const getCurrentQuery = () => {
    switch (viewMode) {
      case 'today':
        return todayQuery
      case 'date':
        return dateQuery
      case 'random':
        return randomQuery
      default:
        return todayQuery
    }
  }

  const currentQuery = getCurrentQuery()

  // Handle random APOD fetching
  const handleGetRandom = () => {
    randomQuery.refetch()
  }

  // Render single APOD with navigation
  const renderSingleAPOD = (apod: APODResponse, showNavigation = true) => (
    <div className='space-y-6'>
      {showNavigation && viewMode !== 'random' && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <button
              onClick={goToPreviousDay}
              disabled={!canGoPrevious()}
              className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
              Previous Day
            </button>

            <button
              onClick={goToNextDay}
              disabled={!canGoNext()}
              className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Next Day
              <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>

            {!isToday() && (
              <button
                onClick={goToToday}
                className='inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
              >
                <svg
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                Today
              </button>
            )}
          </div>

          <button
            onClick={() => toggleFavorite(apod.date)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isFavorite(apod.date)
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <svg
              className='h-4 w-4'
              viewBox='0 0 20 20'
              fill={isFavorite(apod.date) ? 'currentColor' : 'none'}
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            {isFavorite(apod.date) ? 'Favorited' : 'Add to Favorites'}
          </button>
        </div>
      )}

      <APODCard apod={apod} />
    </div>
  )

  // Render multiple APODs
  const renderMultipleAPODs = (apods: APODResponse[]) => (
    <div className='grid gap-8 lg:grid-cols-2'>
      {apods.map(apod => (
        <div key={apod.date}>{renderSingleAPOD(apod, false)}</div>
      ))}
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Navigation */}
      <nav className='border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-8'>
              <Link
                href='/'
                className='text-xl font-bold text-gray-900 dark:text-white'
              >
                Grab Some APIs
              </Link>
              <div className='hidden sm:flex sm:items-center sm:space-x-8'>
                <Link
                  href='/'
                  className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                >
                  Home
                </Link>
                <span className='font-medium text-blue-600 dark:text-blue-400'>
                  NASA ({favorites.length} favorites)
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <PageHeader
          title='NASA Astronomy Picture of the Day'
          description="Discover the universe through NASA's daily featured astronomy images and videos"
        >
          {/* View Mode Selector */}
          <div className='flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'>
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                viewMode === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('date')}
              className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                viewMode === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Browse by Date
            </button>
            <button
              onClick={() => setViewMode('random')}
              className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                viewMode === 'random'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Random
            </button>
          </div>
        </PageHeader>

        {/* Controls */}
        {viewMode === 'date' && (
          <div className='mb-8 flex items-end gap-4'>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              label='Select Date'
              min='1995-06-16'
              max={new Date().toISOString().split('T')[0]}
              className='w-48'
            />
          </div>
        )}

        {viewMode === 'random' && (
          <div className='mb-8 flex items-end gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Number of Images
              </label>
              <select
                value={randomCount}
                onChange={e => setRandomCount(Number(e.target.value))}
                className='mt-1 block w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
              </select>
            </div>
            <button
              onClick={handleGetRandom}
              disabled={currentQuery.isFetching}
              className='inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {currentQuery.isFetching ? (
                <LoadingSpinner size='sm' className='text-white' />
              ) : (
                <svg
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              Get Random
            </button>
          </div>
        )}

        {/* Content */}
        <div className='space-y-8'>
          {currentQuery.isLoading && (
            <div className='flex justify-center py-12'>
              <div className='text-center'>
                <LoadingSpinner size='lg' className='mx-auto mb-4' />
                <p className='text-gray-600 dark:text-gray-400'>
                  Loading astronomy data from NASA...
                </p>
              </div>
            </div>
          )}

          {currentQuery.isError && (
            <ErrorMessage
              title='Failed to Load NASA Data'
              message={
                currentQuery.error?.message || 'An unexpected error occurred'
              }
              onRetry={() => currentQuery.refetch()}
            />
          )}

          {currentQuery.data && !currentQuery.isLoading && (
            <>
              {Array.isArray(currentQuery.data)
                ? renderMultipleAPODs(currentQuery.data)
                : renderSingleAPOD(currentQuery.data)}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className='mt-16 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            About NASA APOD
          </h3>
          <div className='prose prose-sm prose-gray dark:prose-invert max-w-none'>
            <p className='text-gray-700 dark:text-gray-300'>
              The Astronomy Picture of the Day (APOD) is a popular website
              maintained by NASA and Michigan Technological University. Since
              June 16, 1995, APOD has featured a different astronomical image or
              video each day, accompanied by a detailed explanation written by
              professional astronomers.
            </p>
          </div>
          <div className='mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
            <a
              href='https://apod.nasa.gov/apod/astropix.html'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline dark:text-blue-400'
            >
              Visit Original NASA APOD
            </a>
            <span>•</span>
            <a
              href='https://api.nasa.gov/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline dark:text-blue-400'
            >
              NASA API Documentation
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
