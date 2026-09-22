import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faPause,
  faStop,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faHeart as faHeartSolid,
  faRadio,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import Visualizer from './Visualizer.jsx'
import { safeFaviconUrl, DEFAULT_RADIO_SVG, getPlaceholderSvg } from '../utils/imageHelper.js'

function VolumeControlIcon({ muted, volume }) {
  if (muted || volume === 0) {
    return <FontAwesomeIcon icon={faVolumeXmark} className="w-4 h-4 text-white/50" />
  }
  if (volume < 0.5) {
    return <FontAwesomeIcon icon={faVolumeLow} className="w-4 h-4 text-white/70" />
  }
  return <FontAwesomeIcon icon={faVolumeHigh} className="w-4 h-4 text-white/80" />
}

function PlayerLogo({ station }) {
  const safeUrl = safeFaviconUrl(station?.favicon)
  const placeholder = getPlaceholderSvg(station?.name)
  const [imgSrc, setImgSrc] = useState(safeUrl || placeholder)

  const handleError = useCallback((e) => {
    e.currentTarget.onerror = null
    setImgSrc(DEFAULT_RADIO_SVG)
  }, [])

  return (
    <img
      key={station?.id}
      src={imgSrc}
      alt={station?.name || 'Radyo'}
      className="w-full h-full object-cover rounded-xl"
      onError={handleError}
      loading="eager"
      decoding="async"
    />
  )
}

export default function Player({
  station,
  isPlaying,
  isLoading,
  volume,
  isMuted,
  error,
  isFavorite,
  onTogglePlay,
  onStop,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
}) {
  if (!station) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/8">
        <div className="flex items-center justify-center py-4 gap-2.5">
          <FontAwesomeIcon icon={faRadio} className="text-brand-400 text-sm" />
          <p className="text-white/40 text-sm font-medium">
            Bir radyo istasyonu seçin ve canlı dinleyin
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10 animate-slide-up shadow-2xl">
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 opacity-90" />

      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-dark-600">
            <PlayerLogo station={station} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <span className="relative flex-shrink-0 h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                </span>
              )}
              <p className="text-white font-semibold text-sm truncate">{station.name}</p>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {error ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <p className="text-amber-300 text-xs truncate max-w-[200px]">{error}</p>
                </div>
              ) : isLoading ? (
                <p className="text-brand-400 text-xs animate-pulse font-medium">Yayın yükleniyor...</p>
              ) : (
                <p className="text-white/40 text-xs truncate">
                  {station.country || 'Canlı Yayın'}
                  {station.bitrate > 0 && ` • ${station.bitrate}kbps`}
                  {station.codec && ` • ${station.codec.toUpperCase()}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block w-44 h-10 flex-shrink-0">
          <Visualizer isPlaying={isPlaying} volume={isMuted ? 0 : volume} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleFavorite(station)}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center
              ${isFavorite
                ? 'text-pink-500 bg-pink-500/15 hover:bg-pink-500/25 shadow-sm shadow-pink-500/20'
                : 'text-white/35 hover:text-pink-400 hover:bg-pink-500/10'
              }`}
            aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
          >
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
              className={`text-base transition-transform duration-200 ${isFavorite ? 'scale-110' : 'hover:scale-105'}`}
            />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={isLoading && !isPlaying}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              transition-all duration-200 shadow-lg text-white text-base
              ${(isLoading && !isPlaying)
                ? 'bg-dark-600 cursor-wait text-brand-400'
                : 'bg-gradient-to-br from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 glow-brand active:scale-95'
              }
            `}
            aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
          >
            {isLoading && !isPlaying ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
            ) : isPlaying ? (
              <FontAwesomeIcon icon={faPause} className="text-base" />
            ) : (
              <FontAwesomeIcon icon={faPlay} className="text-base ml-0.5" />
            )}
          </button>

          <button
            onClick={onStop}
            className="p-2.5 rounded-xl text-white/35 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
            aria-label="Durdur"
            title="Durdur"
          >
            <FontAwesomeIcon icon={faStop} className="text-sm" />
          </button>

          <div className="hidden sm:flex items-center gap-2 ml-1">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-white/50 hover:text-white transition-colors"
              aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
            >
              <VolumeControlIcon muted={isMuted} volume={volume} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24"
              style={{
                background: `linear-gradient(to right, rgb(74,108,247) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`,
              }}
              aria-label="Ses seviyesi"
            />
            <span className="text-xs text-white/30 w-6 text-right font-medium">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
