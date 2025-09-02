'use client'
import { CharacterSearch } from '@/components/rickandmorty/character-search'
import { useRickAndMortyStore } from '@/stores/rickandmorty-store'

export default function RickAndMortyPage() {
  const { selectedTab, setSelectedTab } = useRickAndMortyStore()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Rick and Morty Database</h1>

      <div className='mb-6'>
        <div className='flex space-x-2'>
          <button
            onClick={() => setSelectedTab('characters')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              selectedTab === 'characters'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Characters
          </button>
          <button
            onClick={() => setSelectedTab('episodes')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              selectedTab === 'episodes'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Episodes
          </button>
          <button
            onClick={() => setSelectedTab('locations')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              selectedTab === 'locations'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Locations
          </button>
        </div>
      </div>

      {selectedTab === 'characters' && <CharacterSearch />}
      {selectedTab === 'episodes' && <div>Episodes coming soon...</div>}
      {selectedTab === 'locations' && <div>Locations coming soon...</div>}
    </div>
  )
}
