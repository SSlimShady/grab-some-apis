'use client'

import { translateToGif } from '@/lib/api/giphy-api'
import { Gif } from '@giphy/react-components'
import { useState } from 'react'

export default function GiphyTranslatePage() {
  const [text, setText] = useState('')
  const [gif, setGif] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const result = await translateToGif(text)
      setGif(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='flex gap-2'>
        <input
          type='text'
          placeholder='Enter text to translate to GIF'
          value={text}
          onChange={e => setText(e.target.value)}
          className='w-full rounded border p-2'
        />
        <button
          onClick={handleTranslate}
          className='rounded bg-blue-500 px-4 py-2 text-white'
        >
          Translate
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {gif && !loading && <Gif gif={gif} width={800} />}
    </div>
  )
}
