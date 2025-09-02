import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type RnMTab = 'characters' | 'locations' | 'episodes'

interface RickAndMortyStore {
  selectedTab: RnMTab
  setSelectedTab: (tab: RnMTab) => void
}

export const useRickAndMortyStore = create<RickAndMortyStore>()(
  persist(
    set => ({
      selectedTab: 'characters',
      setSelectedTab: tab => set({ selectedTab: tab }),
    }),
    {
      name: 'rickandmorty-store',
      partialize: state => ({ selectedTab: state.selectedTab }),
    }
  )
)
