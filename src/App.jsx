import React, { useState, useCallback, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faRadio,
  faGlobe,
  faHeart as faHeartSolid,
  faMapLocationDot,
  faMusic,
  faMagnifyingGlass,
  faBars,
  faCircleExclamation,
  faTowerBroadcast,
} from '@fortawesome/free-solid-svg-icons'
import Sidebar from './components/Sidebar.jsx'
import SearchBar from './components/SearchBar.jsx'
import RadioCard from './components/RadioCard.jsx'
import Player from './components/Player.jsx'
import Toast from './components/Toast.jsx'
import { usePlayer } from './hooks/usePlayer.js'
import { useRadio, CATEGORIES } from './hooks/useRadio.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'

function SkeletonCard() {
  return (
    <div className="bg-[#181818] rounded-md p-2.5 sm:p-3 animate-pulse flex flex-col">
      <div className="aspect-square w-full rounded-md bg-[#282828] mb-2" />
      <div className="h-3.5 bg-[#282828] rounded w-3/4 mb-1.5" />
      <div className="h-3 bg-[#282828] rounded w-1/2" />
    </div>
  )
}

function EmptyState({ message, icon, iconColor = 'text-neutral-400', action }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 gap-3 animate-fade-in text-center">
      <div className={`text-4xl ${iconColor}`}>
        <FontAwesomeIcon icon={icon || faRadio} />
      </div>
      <p className="text-neutral-400 max-w-sm text-xs sm:text-sm leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

function CategoryHeader({ category, selectedCity, selectedGenre, stationCount, isSearching, searchQuery }) {
  const getHeaderContent = () => {
    if (isSearching) {
      return (
        <>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[#1db954] mr-2 text-base" />
          <span>"{searchQuery}" için sonuçlar</span>
        </>
      )
    }

    switch (category) {
      case CATEGORIES.TURKEY:
        return (
          <>
            <FontAwesomeIcon icon={faMapLocationDot} className="text-red-400 mr-2 text-base" />
            <span>Türkiye{selectedCity !== 'Tümü' ? ` — ${selectedCity}` : ''}</span>
          </>
        )
      case CATEGORIES.WORLD:
        return (
          <>
            <FontAwesomeIcon icon={faGlobe} className="text-sky-400 mr-2 text-base" />
            <span>Dünya Radyoları</span>
          </>
        )
      case CATEGORIES.GENRES:
        return (
          <>
            <FontAwesomeIcon icon={faMusic} className="text-purple-400 mr-2 text-base" />
            <span>{selectedGenre?.label || 'Müzik Türü'}</span>
          </>
        )
      case CATEGORIES.FAVORITES:
        return (
          <>
            <FontAwesomeIcon icon={faHeartSolid} className="text-pink-500 mr-2 text-base" />
            <span>Favorilerim</span>
          </>
        )
      default:
        return <span>Canlı Radyo</span>
    }
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
          {getHeaderContent()}
        </h2>
        {stationCount > 0 && (
          <p className="text-xs text-neutral-400 mt-0.5">{stationCount} aktif canlı istasyon</p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [favorites, setFavorites] = useLocalStorage('babaradyo_favorites', [])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const radio = useRadio(favorites)

  const playerRef = useRef(null)

  const handleStationFailure = useCallback(
    (failedStation) => {
      if (!failedStation) return
      const nextStation = radio.getNextStation(failedStation.id)
      radio.removeStation(failedStation.id)

      if (nextStation && nextStation.id !== failedStation.id) {
        setTimeout(() => {
          playerRef.current?.playStation(nextStation)
        }, 200)
      }
    },
    [radio]
  )

  const player = usePlayer({ onStationFailure: handleStationFailure })
  playerRef.current = player

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  )

  const toggleFavorite = useCallback(
    (station) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === station.id)
        if (exists) {
          return prev.filter((f) => f.id !== station.id)
        } else {
          return [station, ...prev]
        }
      })
    },
    [setFavorites]
  )

  const handlePlay = useCallback(
    (station) => {
      if (player.currentStation?.id === station.id) {
        player.togglePlay()
      } else {
        player.playStation(station)
      }
    },
    [player]
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      <div className="flex flex-1 relative min-h-0">
        <Sidebar
          category={radio.category}
          setCategory={radio.setCategory}
          selectedCity={radio.selectedCity}
          setSelectedCity={radio.setSelectedCity}
          selectedGenre={radio.selectedGenre}
          setSelectedGenre={radio.setSelectedGenre}
          favoritesCount={favorites.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-white/[0.06] px-3 sm:px-6 py-2.5 sm:py-3.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Menüyü aç"
              >
                <FontAwesomeIcon icon={faBars} className="text-sm" />
              </button>

              <div className="flex-1 max-w-md">
                <SearchBar
                  query={radio.searchQuery}
                  onChange={radio.handleSearch}
                  onClear={radio.clearSearch}
                  isSearching={radio.loading && radio.isSearching}
                />
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.06]">
                <FontAwesomeIcon icon={faTowerBroadcast} className="text-[#1db954] text-xs animate-pulse" />
                <span className="text-xs text-neutral-300 font-medium">Canlı</span>
              </div>

              <FontAwesomeIcon icon={faRadio} className="md:hidden text-white text-base ml-auto mr-1" />
            </div>
          </header>

          <div
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5"
            style={{ paddingBottom: player.currentStation ? '88px' : '32px' }}
          >
            {!radio.loading && radio.stations.length > 0 && (
              <CategoryHeader
                category={radio.category}
                selectedCity={radio.selectedCity}
                selectedGenre={radio.selectedGenre}
                stationCount={radio.stations.length}
                isSearching={radio.isSearching}
                searchQuery={radio.searchQuery}
              />
            )}

            {radio.error && !radio.loading && (
              <div className="mb-4 px-3.5 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
                <FontAwesomeIcon icon={faCircleExclamation} className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{radio.error}</span>
                <button
                  onClick={radio.reload}
                  className="ml-auto text-red-300 hover:text-red-200 underline text-xs"
                >
                  Tekrar dene
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3 lg:gap-3.5">
              {radio.loading && !radio.isSearching &&
                Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)
              }

              {!radio.loading && radio.stations.length === 0 && !radio.error && (
                radio.category === CATEGORIES.FAVORITES ? (
                  <EmptyState
                    icon={faHeartSolid}
                    iconColor="text-pink-500/60"
                    message="Henüz favori istasyonunuz yok. Radyo kartlarındaki kalp butonuna tıklayarak favorilere ekleyebilirsiniz."
                  />
                ) : radio.isSearching ? (
                  <EmptyState
                    icon={faMagnifyingGlass}
                    iconColor="text-neutral-400"
                    message={`"${radio.searchQuery}" için çalışan sonuç bulunamadı.`}
                    action={{ label: 'Aramayı temizle', onClick: radio.clearSearch }}
                  />
                ) : (
                  <EmptyState
                    icon={faRadio}
                    iconColor="text-neutral-400"
                    message="Bu kategoride aktif radyo bulunamadı."
                    action={{ label: 'Yenile', onClick: radio.reload }}
                  />
                )
              )}

              {!radio.loading &&
                radio.stations.map((station) => (
                  <RadioCard
                    key={station.id}
                    station={station}
                    isPlaying={player.isPlaying}
                    isCurrent={player.currentStation?.id === station.id}
                    isFavorite={favoriteIds.has(station.id)}
                    onPlay={handlePlay}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
            </div>
          </div>
        </main>
      </div>

      <Player
        station={player.currentStation}
        isPlaying={player.isPlaying}
        isLoading={player.isLoading}
        volume={player.volume}
        isMuted={player.isMuted}
        error={player.error}
        isFavorite={player.currentStation ? favoriteIds.has(player.currentStation.id) : false}
        onTogglePlay={player.togglePlay}
        onStop={player.stopStation}
        onVolumeChange={player.handleVolumeChange}
        onToggleMute={player.toggleMute}
        onToggleFavorite={toggleFavorite}
      />

      <Toast toast={player.toast} onDismiss={player.dismissToast} />
    </div>
  )
}
