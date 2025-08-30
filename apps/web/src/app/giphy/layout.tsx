'use client'

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
  return (
    <div>
      <ul>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'rounded p-2 transition hover:bg-gray-200',
              pathname === item.href && 'bg-gray-300 font-semibold'
            )}
          >
            {item.label}
          </Link>
        ))}
      </ul>
      {children}
    </div>
  )
}
