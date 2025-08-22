import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NASA APOD - Astronomy Picture of the Day | Grab Some APIs',
  description:
    "Explore the universe with NASA's Astronomy Picture of the Day. Browse stunning space images, learn about astronomical phenomena, and discover the cosmos.",
  keywords: [
    'NASA',
    'APOD',
    'astronomy',
    'space',
    'pictures',
    'universe',
    'cosmos',
    'API',
  ],
  openGraph: {
    title: 'NASA APOD - Astronomy Picture of the Day',
    description:
      "Explore the universe with NASA's daily astronomy images and videos.",
    type: 'website',
    siteName: 'Grab Some APIs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NASA APOD - Astronomy Picture of the Day',
    description:
      "Explore the universe with NASA's daily astronomy images and videos.",
  },
}

export default function NASALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
