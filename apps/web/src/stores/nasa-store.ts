/**
 * NASA Store using Zustand for global state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'date' | 'random'

interface NASAPreferences {
  viewMode: ViewMode
  randomCount: number
  selectedDate: string
}

interface NASAStore {
  // Favorites
  favorites: string[]
  addToFavorites: (date: string) => void
  removeFromFavorites: (date: string) => void
  isFavorite: (date: string) => boolean
  toggleFavorite: (date: string) => void

  // Preferences
  preferences: NASAPreferences
  setViewMode: (mode: ViewMode) => void
  setRandomCount: (count: number) => void
  setSelectedDate: (date: string) => void

  // Date navigation helpers
  goToPreviousDay: () => void
  goToNextDay: () => void
  goToToday: () => void

  // Computed values
  isToday: () => boolean
  isFirstAPOD: () => boolean
  canGoNext: () => boolean
  canGoPrevious: () => boolean
}

const FIRST_APOD_DATE = '1995-06-16'

const getTodayString = () => new Date().toISOString().split('T')[0]

export const useNASAStore = create<NASAStore>()(
  persist(
    (set, get) => ({
      // Favorites state
      favorites: [],

      addToFavorites: (date: string) =>
        set(state => ({
          favorites: [...state.favorites.filter(d => d !== date), date],
        })),

      removeFromFavorites: (date: string) =>
        set(state => ({
          favorites: state.favorites.filter(d => d !== date),
        })),

      isFavorite: (date: string) => get().favorites.includes(date),

      toggleFavorite: (date: string) => {
        const { isFavorite, addToFavorites, removeFromFavorites } = get()
        if (isFavorite(date)) {
          removeFromFavorites(date)
        } else {
          addToFavorites(date)
        }
      },

      // Preferences state
      preferences: {
        viewMode: 'date',
        randomCount: 1,
        selectedDate: getTodayString(),
      },

      setViewMode: (mode: ViewMode) =>
        set(state => ({
          preferences: { ...state.preferences, viewMode: mode },
        })),

      setRandomCount: (count: number) =>
        set(state => ({
          preferences: { ...state.preferences, randomCount: count },
        })),

      setSelectedDate: (date: string) =>
        set(state => ({
          preferences: { ...state.preferences, selectedDate: date },
        })),

      // Date navigation
      goToPreviousDay: () => {
        const { preferences, setSelectedDate } = get()
        const currentDate = new Date(preferences.selectedDate)
        currentDate.setDate(currentDate.getDate() - 1)
        setSelectedDate(currentDate.toISOString().split('T')[0])
      },

      goToNextDay: () => {
        const { preferences, setSelectedDate, canGoNext } = get()
        if (canGoNext()) {
          const currentDate = new Date(preferences.selectedDate)
          currentDate.setDate(currentDate.getDate() + 1)
          setSelectedDate(currentDate.toISOString().split('T')[0])
        }
      },

      goToToday: () => {
        const { setSelectedDate } = get()
        setSelectedDate(getTodayString())
      },

      // Computed values
      isToday: () => get().preferences.selectedDate === getTodayString(),

      isFirstAPOD: () => get().preferences.selectedDate === FIRST_APOD_DATE,

      canGoNext: () => !get().isToday(),

      canGoPrevious: () => !get().isFirstAPOD(),
    }),
    {
      name: 'nasa-store',
      partialize: state => ({
        favorites: state.favorites,
        preferences: state.preferences,
      }),
    }
  )
)
