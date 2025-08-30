'use client'
import { fetchRandomGif } from '@/lib/api/giphy-api'
import { useGiphyStore } from '@/stores/giphy-store'
import { Gif } from '@giphy/react-components'
import { useEffect, useState } from 'react'

export default function GiphyPage() {
  const [gif, setGif] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isGif } = useGiphyStore()

  useEffect(() => {
    const fetchGif = async () => {
      setLoading(true)
      const data = await fetchRandomGif()
      setGif(data)
      setLoading(false)
    }
    fetchGif()
  }, [isGif])

  const handleRandomGif = async () => {
    setLoading(true)
    const data = await fetchRandomGif()
    setGif(data)
    setLoading(false)
  }

  return (
    <div>
      <h1>A Random {isGif ? 'GIF' : 'Sticker'} For you</h1>
      <button onClick={handleRandomGif}>
        Get Random {isGif ? 'GIF' : 'Sticker'}
      </button>
      {loading && <p>Loading...</p>}
      {gif && !loading && <Gif gif={gif} width={300} />}
    </div>
  )
}
