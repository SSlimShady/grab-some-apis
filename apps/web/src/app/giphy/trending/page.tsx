'use client'

import { fetchTrendingGifs } from '@/lib/api/giphy-api'
import { useGiphyStore } from '@/stores/giphy-store'
import { Grid } from '@giphy/react-components'

export default function GiphyTrendingPage() {
  const { isGif } = useGiphyStore()
  return (
    <div>
      <Grid
        key={isGif ? 'gifs' : 'stickers'}
        fetchGifs={fetchTrendingGifs}
        width={1200}
        columns={5}
        gutter={6}
        borderRadius={4}
      />
    </div>
  )
}
