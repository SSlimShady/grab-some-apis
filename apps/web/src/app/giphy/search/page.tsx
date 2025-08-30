'use client'
import {
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
  SuggestionBar,
} from '@giphy/react-components'
import { useContext } from 'react'

export default function GiphySearchPage() {
  return (
    <SearchContextManager apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY || ''}>
      <SearchComponents />
    </SearchContextManager>
  )
}

const SearchComponents = () => {
  const { fetchGifs, searchKey } = useContext(SearchContext)
  return (
    <>
      <SearchBar />
      <SuggestionBar />
      <Grid key={searchKey} columns={3} width={800} fetchGifs={fetchGifs} />
    </>
  )
}
