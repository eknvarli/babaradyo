import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchTurkeyStations,
  fetchTopWorldStations,
  fetchStationsByTag,
  searchStations,
} from '../utils/api.js'

export const CATEGORIES = {
  TURKEY: 'turkey',
  WORLD: 'world',
  GENRES: 'genres',
  FAVORITES: 'favorites',
}

export const TURKEY_CITIES = [
  'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin',
  'Kayseri', 'Diyarbakır', 'Samsun', 'Eskişehir', 'Trabzon',
]

export const MUSIC_GENRES = [
  { label: 'Pop', tag: 'pop' },
  { label: 'Rock', tag: 'rock' },
  { label: 'Jazz', tag: 'jazz' },
  { label: 'Classical', tag: 'classical' },
  { label: 'Electronic', tag: 'electronic' },
  { label: 'Hip-Hop', tag: 'hiphop' },
  { label: 'R&B', tag: 'rnb' },
  { label: 'Country', tag: 'country' },
  { label: 'Metal', tag: 'metal' },
  { label: 'Reggae', tag: 'reggae' },
  { label: 'Blues', tag: 'blues' },
  { label: 'Latin', tag: 'latin' },
  { label: 'Dance', tag: 'dance' },
  { label: 'Folk', tag: 'folk' },
  { label: 'News', tag: 'news' },
  { label: 'Talk', tag: 'talk' },
]

export function useRadio(favorites = []) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState(CATEGORIES.TURKEY)
  const [selectedCity, setSelectedCity] = useState('Tümü')
  const [selectedGenre, setSelectedGenre] = useState(MUSIC_GENRES[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const [failedIds, setFailedIds] = useState(() => new Set())

  const searchTimerRef = useRef(null)

  const removeStation = useCallback((stationId) => {
    if (!stationId) return
    setFailedIds((prev) => {
      const next = new Set(prev)
      next.add(stationId)
      return next
    })
    setStations((prev) => prev.filter((s) => s.id !== stationId))
  }, [])

  const getNextStation = useCallback(
    (currentStationId) => {
      if (!stations || stations.length <= 1) return null
      const currentIndex = stations.findIndex((s) => s.id === currentStationId)
      if (currentIndex === -1) {
        return stations[0] || null
      }
      const nextIndex = (currentIndex + 1) % stations.length
      return stations[nextIndex] || null
    },
    [stations]
  )

  const loadStations = useCallback(async () => {
    if (isSearching) return

    setLoading(true)
    setError(null)

    try {
      let data = []

      if (category === CATEGORIES.TURKEY) {
        data = await fetchTurkeyStations({ city: selectedCity })
      } else if (category === CATEGORIES.WORLD) {
        data = await fetchTopWorldStations({ limit: 120 })
      } else if (category === CATEGORIES.GENRES) {
        data = await fetchStationsByTag({ tag: selectedGenre.tag })
      } else if (category === CATEGORIES.FAVORITES) {
        data = favorites
      }

      const validStations = data.filter((s) => !failedIds.has(s.id))
      setStations(validStations)
    } catch (err) {
      console.error('Failed to load stations:', err)
      setError('Radyo istasyonları yüklenemedi. Lütfen tekrar deneyin.')
      setStations([])
    } finally {
      setLoading(false)
    }
  }, [category, selectedCity, selectedGenre, isSearching, favorites, failedIds])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    if (!query || query.trim().length < 2) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setLoading(true)

    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchStations({ query, limit: 60 })
        const validResults = results.filter((s) => !failedIds.has(s.id))
        setStations(validResults)
        setError(null)
      } catch (err) {
        console.error('Search failed:', err)
        setError('Arama sırasında bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [failedIds])

  const clearSearch = useCallback(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setSearchQuery('')
    setIsSearching(false)
  }, [])

  useEffect(() => {
    if (!isSearching) {
      loadStations()
    }
  }, [loadStations, isSearching])

  useEffect(() => {
    if (category === CATEGORIES.FAVORITES) {
      const validFavs = favorites.filter((s) => !failedIds.has(s.id))
      setStations(validFavs)
    }
  }, [favorites, category, failedIds])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  return {
    stations,
    loading,
    error,
    category,
    setCategory,
    selectedCity,
    setSelectedCity,
    selectedGenre,
    setSelectedGenre,
    searchQuery,
    handleSearch,
    clearSearch,
    isSearching,
    removeStation,
    getNextStation,
    reload: loadStations,
  }
}
