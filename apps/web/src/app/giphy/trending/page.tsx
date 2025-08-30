import { fetchTrendingGifs } from '@/lib/api/giphy-api'
import { Grid } from '@giphy/react-components'

export default function GiphyTrendingPage() {
  return (
    <div>
      <Grid
        fetchGifs={fetchTrendingGifs}
        width={1200}
        columns={5}
        gutter={6}
        borderRadius={4}
      />
    </div>
  )
}
