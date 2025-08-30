import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GiphyStore {
  isGif: boolean
  setIsGif: (isGif: boolean) => void
}

export const useGiphyStore = create<GiphyStore>()(
  persist(
    set => ({
      isGif: false,
      setIsGif: isGif => set({ isGif }),
    }),
    {
      name: 'giphy-store',
      partialize: state => ({ isGif: state.isGif }),
    }
  )
)
