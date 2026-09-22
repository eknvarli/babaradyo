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
    return <FontAwesomeIcon icon={faVolumeXmark} className="w-3.5 h-3.5 text-neutral-400" />
  }
  if (volume < 0.5) {
    return <FontAwesomeIcon icon={faVolumeLow} className="w-3.5 h-3.5 text-neutral-400" />
  }
  return <FontAwesomeIcon icon={faVolumeHigh} className="w-3.5 h-3.5 text-neutral-400" />
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
      className="w-full h-full object-cover"
      onError={handleError}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
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
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/[0.08] h-12 sm:h-14 flex items-center justify-center px-4 select-none">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRadio} className="text-neutral-400 text-xs sm:text-sm" />
          <p className="text-neutral-400 text-xs sm:text-sm font-normal">
            Bir radyo istasyonu seçin ve canlı dinleyin
          </p>
        </div>
      </footer>
    )
  }

  const volPct = (isMuted ? 0 : volume) * 100

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/[0.08] h-16 sm:h-20 select-none shadow-2xl">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 max-w-full overflow-hidden">
        
        {/* Sol Alan: Kapak, Bilgiler ve Favori */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-[44%] sm:max-w-[32%] flex-shrink-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-md overflow-hidden bg-[#242424] shadow-sm">
            <PlayerLogo station={station} />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-white font-semibold text-xs sm:text-sm truncate leading-snug" title={station.name}>
              {station.name}
            </p>
            {error ? (
              <p className="text-amber-400 text-[10px] sm:text-xs truncate leading-normal" title={error}>
                {error}
              </p>
            ) : isLoading ? (
              <p className="text-neutral-400 text-[10px] sm:text-xs truncate leading-normal animate-pulse">
                Bağlanıyor...
              </p>
            ) : (
              <p className="text-neutral-400 text-[10px] sm:text-xs truncate leading-normal">
                {station.country || 'Canlı Yayın'}
                {station.bitrate > 0 && ` • ${station.bitrate}k`}
              </p>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(station)}
            className={`flex-shrink-0 p-1 transition-all duration-150 active:scale-90
              ${isFavorite ? 'text-pink-500' : 'text-neutral-400 hover:text-white'}`}
            aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
          >
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
              className="text-xs sm:text-sm"
            />
          </button>
        </div>

        {/* Orta Alan: Denetimler & Visualizer */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={onStop}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors duration-150"
            aria-label="Durdur"
            title="Durdur"
          >
            <FontAwesomeIcon icon={faStop} className="text-xs sm:text-sm" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={isLoading && !isPlaying}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-black
              transition-all duration-150 active:scale-95 shadow-md flex-shrink-0
              ${(isLoading && !isPlaying)
                ? 'bg-neutral-600 cursor-wait'
                : 'bg-white hover:scale-105'
              }`}
            aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
          >
            {isLoading && !isPlaying ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-xs" />
            ) : isPlaying ? (
              <FontAwesomeIcon icon={faPause} className="text-xs sm:text-sm" />
            ) : (
              <FontAwesomeIcon icon={faPlay} className="text-xs sm:text-sm ml-0.5" />
            )}
          </button>

          <div className="hidden md:block w-24 lg:w-32 h-6 flex-shrink-0 opacity-80">
            <Visualizer isPlaying={isPlaying} volume={isMuted ? 0 : volume} />
          </div>
        </div>

        {/* Sağ Alan: Ses Çubuğu */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0 sm:min-w-[130px]">
          <button
            onClick={onToggleMute}
            className="text-neutral-400 hover:text-white transition-colors duration-150 p-1.5"
            aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
          >
            <VolumeControlIcon muted={isMuted} volume={volume} />
          </button>

          <div className="hidden sm:flex items-center w-20 sm:w-24">
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #ffffff ${volPct}%, rgba(255,255,255,0.2) ${volPct}%)`,
              }}
              aria-label="Ses seviyesi"
            />
          </div>
        </div>

      </div>
    </footer>
  )
}
