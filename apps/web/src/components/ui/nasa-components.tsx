'use client'

/**
 * Reusable UI components for NASA page
 */

import { ERRORS, IMAGES, NASA, UI } from '@/lib/constants'
import { MediaType } from '@/lib/enums'
import { APODResponse } from '@/types/nasa'
import Image from 'next/image'
import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <div className='h-full w-full rounded-full border-2 border-blue-600 border-b-transparent'></div>
    </div>
  )
}

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = ERRORS.GENERIC,
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <svg
          className='h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400'
          viewBox='0 0 20 20'
          fill='currentColor'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z'
            clipRule='evenodd'
          />
        </svg>
        <div className='flex-1'>
          <h3 className='font-semibold'>{title}</h3>
          <p className='mt-1 text-sm'>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className='mt-3 inline-flex items-center gap-2 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
            >
              <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z'
                  clipRule='evenodd'
                />
              </svg>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface APODCardProps {
  apod: APODResponse
  className?: string
}

export function APODCard({ apod, className = '' }: APODCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(apod.url || '')

  // Memoize derived values to prevent unnecessary recalculations
  const { isVideo, imageUrl, hdImageUrl, isGif } = useMemo(
    () => ({
      isVideo: apod.media_type === MediaType.VIDEO,
      imageUrl: apod.url,
      hdImageUrl: apod.hdurl || apod.url,
      isGif:
        apod.url?.toLowerCase().endsWith(NASA.FILE_EXTENSIONS.GIF) ?? false,
    }),
    [apod.url, apod.hdurl, apod.media_type]
  )

  // Memoize formatted date to prevent unnecessary re-formatting
  const formattedDate = useMemo(
    () =>
      new Date(apod.date).toLocaleDateString(
        UI.DATE_FORMAT.LOCALE,
        UI.DATE_FORMAT.OPTIONS
      ),
    [apod.date]
  )

  // Optimize event handlers with useCallback
  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    console.error(ERRORS.IMAGE_LOAD_FAILED, imageSrc)
    setImageLoading(false)
    // If original image fails and we're not already using fallback, switch to fallback
    if (imageSrc !== IMAGES.FALLBACK) {
      setImageSrc(IMAGES.FALLBACK)
      setImageError(false) // Reset error state to try fallback
      setImageLoading(true) // Show loading again for fallback
    } else {
      // If fallback also fails, show error state
      setImageError(true)
    }
  }, [imageSrc])

  const handleShare = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.navigator?.share) {
        await window.navigator.share({
          title: apod.title,
          text: apod.explanation.slice(0, 200) + '...', // Truncate for sharing
          url: apod.url,
        })
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(apod.url)
        toast('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(apod.url)
        toast('Link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
      }
    }
  }, [apod.title, apod.explanation, apod.url])

  // Reset states when APOD changes (important for navigation)
  useEffect(() => {
    if (!isVideo) {
      setImageLoading(true)
      setImageError(false)
      // Set initial image source - use the actual URL or fallback to placeholder
      const initialSrc =
        imageUrl && imageUrl.trim() ? imageUrl : IMAGES.FALLBACK
      setImageSrc(initialSrc)
    }
  }, [imageUrl, isVideo, apod.date])

  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {/* Image/Video Container */}
      <div className='relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800'>
        {isVideo ? (
          <iframe
            src={apod.url}
            title={apod.title}
            className='h-full w-full border-0'
            allowFullScreen
            loading='lazy'
          />
        ) : (
          <>
            {imageSrc && imageSrc.trim() && (
              <Image
                key={`apod-image-${apod.date}`}
                src={imageSrc}
                alt={apod.title}
                width={800}
                height={450}
                className='h-full w-full object-cover transition-transform hover:scale-105'
                priority={false}
                placeholder='blur'
                blurDataURL={IMAGES.PLACEHOLDER_BLUR}
                // For GIFs, disable optimization to preserve animation
                unoptimized={isGif}
                // Add loading handlers
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}

            {/* Error state */}
            {imageError && !imageLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-950'>
                <div className='p-4 text-center'>
                  <svg
                    className='mx-auto mb-2 h-8 w-8 text-red-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {ERRORS.IMAGE_LOAD_FAILED}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Header */}
        <div className='mb-4'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            {apod.title}
          </h2>
          <div className='mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
            <time dateTime={apod.date} aria-label={`Date: ${formattedDate}`}>
              {formattedDate}
            </time>
            <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
              <svg className='h-3 w-3' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z'
                  clipRule='evenodd'
                />
              </svg>
              {apod.media_type}
              {isGif && <span className='ml-1'>• GIF</span>}
            </span>
          </div>
          {apod.copyright && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              © {apod.copyright}
            </p>
          )}
        </div>

        {/* Description */}
        <div className='prose prose-sm prose-gray dark:prose-invert max-w-none'>
          <p className='leading-relaxed text-gray-700 dark:text-gray-300'>
            {apod.explanation}
          </p>
        </div>

        {/* Actions */}
        <div className='mt-6 flex gap-3'>
          {!isVideo && hdImageUrl && (
            <a
              href={hdImageUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
              Download {isGif ? 'GIF' : 'HD'}
            </a>
          )}
          <button
            onClick={handleShare}
            aria-label={`Share ${apod.title}`}
            className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
              <path d='M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z' />
            </svg>
            Share
          </button>
        </div>
      </div>
    </article>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`border-b border-gray-200 pb-6 dark:border-gray-800 ${className}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {title}
          </h1>
          {description && (
            <p className='mt-2 text-lg text-gray-600 dark:text-gray-400'>
              {description}
            </p>
          )}
        </div>
        {children && <div className='flex items-center gap-3'>{children}</div>}
      </div>
    </div>
  )
}

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  label: string
  max?: string
  min?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  label,
  max,
  min,
  className = '',
}: DatePickerProps) {
  // Use React's useId hook for SSR-safe unique IDs
  const id = useId()

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 dark:text-gray-300'
      >
        {label}
      </label>
      <input
        id={id}
        type='date'
        value={value}
        onChange={e => onChange(e.target.value)}
        max={max}
        min={min}
        aria-label={label}
        className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
      />
    </div>
  )
}
