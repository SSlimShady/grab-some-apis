'use client'
import { useGiphyStore } from '@/stores/giphy-store'
import { GiphyFetch } from '@giphy/js-fetch-api'

export const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '')

const getEndpointType = () => {
  const { isGif } = useGiphyStore.getState()
  return isGif ? 'gifs' : 'stickers'
}

export const fetchTrendingGifs = async (
  offset: number = 0,
  limit: number = 10
) => {
  const endpointType = getEndpointType()
  if (endpointType === 'stickers') {
    return gf.trending({ offset, limit, type: 'stickers' })
  } else {
    return gf.trending({
      offset,
      limit,
    })
  }
}

export const translateToGif = async (searchText: string) => {
  const endpointType = getEndpointType()
  const response = await fetch(
    `https://api.giphy.com/v1/${endpointType}/translate?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&s=${searchText}`
  )
  const data = await response.json()
  return data.data
}

export const fetchRandomGif = async () => {
  const endpointType = getEndpointType()
  const response = await fetch(
    `https://api.giphy.com/v1/${endpointType}/random?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}`
  )
  const data = await response.json()
  return data.data
}
