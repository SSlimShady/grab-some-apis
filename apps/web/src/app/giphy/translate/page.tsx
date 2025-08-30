'use client'

import { translateToGif } from '@/lib/api/giphy-api'
import { useGiphyStore } from '@/stores/giphy-store'
import { Gif } from '@giphy/react-components'
import { useEffect, useState } from 'react'

export default function GiphyTranslatePage() {
  const [text, setText] = useState('')
  const [gif, setGif] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const { isGif } = useGiphyStore()

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      setGif(null)
      const result = await translateToGif(text)
      setGif(result)
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = () => {
    setGif(null)
  }

  useEffect(() => {
    handleModeChange()
  }, [isGif])

  return (
    <div className='space-y-4 p-4'>
      <h1 className='text-2xl font-bold'>
        Translate to {isGif ? 'GIF' : 'Sticker'}
      </h1>

      <div className='flex gap-2'>
        <input
          type='text'
          placeholder={`Enter text to translate to ${isGif ? 'GIF' : 'Sticker'}`}
          value={text}
          onChange={e => setText(e.target.value)}
          className='w-full rounded border p-2'
        />
        <button
          onClick={handleTranslate}
          disabled={loading || !text.trim()}
          className='rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {loading && (
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p>Loading {isGif ? 'GIF' : 'Sticker'}...</p>
        </div>
      )}

      {gif && !loading && (
        <div key={`${isGif ? 'gif' : 'sticker'}-${gif.id}`}>
          <Gif gif={gif} width={800} />
        </div>
      )}
    </div>
  )
}
