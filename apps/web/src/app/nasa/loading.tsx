import { LoadingSpinner } from '@/components/ui/nasa-components'

export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Navigation placeholder */}
      <nav className='border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-8'>
              <div className='h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Loading content */}
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header skeleton */}
        <div className='border-b border-gray-200 pb-6 dark:border-gray-800'>
          <div className='h-8 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
          <div className='mt-2 h-6 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
        </div>

        {/* Loading spinner */}
        <div className='flex justify-center py-24'>
          <div className='text-center'>
            <LoadingSpinner size='lg' className='mx-auto mb-4' />
            <p className='text-gray-600 dark:text-gray-400'>
              Loading NASA astronomy data...
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
