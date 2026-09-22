import React, { useState, useCallback, useMemo } from 'react'
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
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-16 h-16 skeleton rounded-xl" />
        <div className="w-7 h-7 skeleton rounded-lg" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
      <div className="flex gap-1 mb-3">
        <div className="h-5 skeleton rounded-full w-12" />
        <div className="h-5 skeleton rounded-full w-16" />
      </div>
      <div className="h-8 skeleton rounded-xl" />
    </div>
  )
}

function EmptyState({ message, icon, iconColor = 'text-white/40', action }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <div className={`text-5xl ${iconColor}`}>
        <FontAwesomeIcon icon={icon || faRadio} />
      </div>
      <p className="text-white/50 text-center max-w-sm text-sm leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 rounded-xl text-sm font-medium transition-all duration-200 border border-brand-500/25"
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
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-brand-400 mr-2.5 text-lg" />
          <span>"{searchQuery}" için sonuçlar</span>
        </>
      )
    }

    switch (category) {
      case CATEGORIES.TURKEY:
        return (
          <>
            <FontAwesomeIcon icon={faMapLocationDot} className="text-red-400 mr-2.5 text-lg" />
            <span>Türkiye{selectedCity !== 'Tümü' ? ` — ${selectedCity}` : ''}</span>
          </>
        )
      case CATEGORIES.WORLD:
        return (
          <>
            <FontAwesomeIcon icon={faGlobe} className="text-sky-400 mr-2.5 text-lg" />
            <span>Dünya Radyoları</span>
          </>
        )
      case CATEGORIES.GENRES:
        return (
          <>
            <FontAwesomeIcon icon={faMusic} className="text-purple-400 mr-2.5 text-lg" />
            <span>{selectedGenre?.label || 'Müzik Türü'}</span>
          </>
        )
      case CATEGORIES.FAVORITES:
        return (
          <>
            <FontAwesomeIcon icon={faHeartSolid} className="text-pink-500 mr-2.5 text-lg" />
            <span>Favorilerim</span>
          </>
        )
      default:
        return <span>Canlı Radyo</span>
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center">
          {getHeaderContent()}
        </h2>
        {stationCount > 0 && (
          <p className="text-sm text-white/35 mt-1">{stationCount} aktif canlı istasyon</p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [favorites, setFavorites] = useLocalStorage('babaradyo_favorites', [])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const radio = useRadio(favorites)

  const handleStationFailure = useCallback(
    (failedStation) => {
      if (!failedStation) return
      const nextStation = radio.getNextStation(failedStation.id)
      radio.removeStation(failedStation.id)

      if (nextStation && nextStation.id !== failedStation.id) {
        setTimeout(() => {
          player.playStation(nextStation)
        }, 150)
      }
    },
    [radio]
  )

  const player = usePlayer({ onStationFailure: handleStationFailure })

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

  const bgStyle = {
    background: `
      radial-gradient(ellipse 80% 60% at 20% 20%, rgba(74, 108, 247, 0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 60%),
      #050508
    `,
  }

  return (
    <div className="min-h-screen flex flex-col" style={bgStyle}>
      <div className="flex flex-1 relative">
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
          <header className="sticky top-0 z-20 glass border-b border-white/5 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Menüyü aç"
              >
                <FontAwesomeIcon icon={faBars} className="text-base" />
              </button>

              <div className="flex-1 max-w-xl">
                <SearchBar
                  query={radio.searchQuery}
                  onChange={radio.handleSearch}
                  onClear={radio.clearSearch}
                  isSearching={radio.loading && radio.isSearching}
                />
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <FontAwesomeIcon icon={faTowerBroadcast} className="text-green-400 text-xs animate-pulse" />
                <span className="text-xs text-white/70 font-medium">Canlı Yayınlar</span>
              </div>

              <FontAwesomeIcon icon={faRadio} className="md:hidden text-brand-400 text-lg ml-auto mr-1" />
            </div>
          </header>

          <div
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
            style={{ paddingBottom: player.currentStation ? '110px' : '24px' }}
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
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4 flex-shrink-0" />
                <span>{radio.error}</span>
                <button
                  onClick={radio.reload}
                  className="ml-auto text-red-300 hover:text-red-200 underline text-xs"
                >
                  Tekrar dene
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {radio.loading && !radio.isSearching &&
                Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
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
                    iconColor="text-brand-400/60"
                    message={`"${radio.searchQuery}" için çalışan sonuç bulunamadı.`}
                    action={{ label: 'Aramayı temizle', onClick: radio.clearSearch }}
                  />
                ) : (
                  <EmptyState
                    icon={faRadio}
                    iconColor="text-white/30"
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
