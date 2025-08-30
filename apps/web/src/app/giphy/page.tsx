'use client'
import { fetchRandomGif } from '@/lib/api/giphy-api'
import { Gif } from '@giphy/react-components'
import { useEffect, useState } from 'react'

export default function GiphyPage() {
  const [gif, setGif] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchGif = async () => {
      setLoading(true)
      const data = await fetchRandomGif()
      setGif(data)
      setLoading(false)
    }
    fetchGif()
  }, [])

  const handleRandomGif = async () => {
    setLoading(true)
    const data = await fetchRandomGif()
    setGif(data)
    setLoading(false)
  }

  return (
    <div>
      <h1>A Random GIF For you</h1>
      <button onClick={handleRandomGif}>Get Random GIF</button>
      {loading && <p>Loading...</p>}
      {gif && !loading && <Gif gif={gif} width={300} />}
    </div>
  )
}
