'use client'

import { useGiphyStore } from '@/stores/giphy-store'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const navItems = [
  { label: 'Home', href: '/giphy' },
  { label: 'Search GIFs', href: '/giphy/search' },
  { label: 'Trending GIFs', href: '/giphy/trending' },
  { label: 'Translate to GIF', href: '/giphy/translate' },
]

export default function GiphyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isGif, setIsGif } = useGiphyStore()
  return (
    <div>
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            'rounded p-2 transition hover:bg-blue-200',
            pathname === item.href && 'bg-blue-300 font-bold'
          )}
        >
          {isGif ? item.label.replace('GIF', 'Sticker') : item.label}
        </Link>
      ))}
      <button onClick={() => setIsGif(!isGif)}>
        Switch to {isGif ? 'Sticker' : 'Gif'}
      </button>

      {children}
    </div>
  )
}
