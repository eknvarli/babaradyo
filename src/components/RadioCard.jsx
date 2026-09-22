import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid, faPlay } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { safeFaviconUrl, DEFAULT_RADIO_SVG, getPlaceholderSvg } from '../utils/imageHelper.js'

function CardLogo({ name, favicon }) {
  const safeUrl = safeFaviconUrl(favicon)
  const placeholder = getPlaceholderSvg(name)
  const [imgSrc, setImgSrc] = useState(safeUrl || placeholder)

  const handleError = useCallback((e) => {
    e.currentTarget.onerror = null
    setImgSrc(DEFAULT_RADIO_SVG)
  }, [])

  return (
    <img
      src={imgSrc}
      alt={name ? `${name} logo` : 'Radyo logosu'}
      className="w-full h-full object-cover"
      onError={handleError}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}

export default function RadioCard({
  station,
  isPlaying,
  isCurrent,
  isFavorite,
  onPlay,
  onToggleFavorite,
}) {
  const handlePlay = useCallback(
    (e) => {
      e.stopPropagation()
      onPlay(station)
    },
    [station, onPlay]
  )

  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation()
      onToggleFavorite(station)
    },
    [station, onToggleFavorite]
  )

  return (
    <div
      className="relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 animate-fade-in group bg-[#181818] hover:bg-[#282828] p-2.5 sm:p-3 flex flex-col"
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay(e)}
      aria-label={`${station.name} radyosunu oynat`}
    >
      <div className="relative mb-2 w-full">
        <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#242424] shadow-sm">
          <CardLogo
            key={station.id}
            name={station.name}
            favicon={station.favicon}
          />

          {isCurrent && isPlaying ? (
            <div className="absolute inset-0 bg-black/50 flex items-end justify-start p-1.5 sm:p-2">
              <div className="equalizer">
                <div className="equalizer-bar" />
                <div className="equalizer-bar" />
                <div className="equalizer-bar" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-end justify-end p-1.5 sm:p-2">
              <button
                onClick={handlePlay}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg
                           opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0
                           transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                aria-label={`${station.name} oynat`}
              >
                <FontAwesomeIcon icon={faPlay} className="text-black text-xs ml-0.5" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleFavorite}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-150
            ${isFavorite
              ? 'opacity-100 text-pink-500 scale-105'
              : 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-pink-400'
            }`}
          aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
        >
          <FontAwesomeIcon
            icon={isFavorite ? faHeartSolid : faHeartRegular}
            className="text-xs"
          />
        </button>
      </div>

      <div className="min-w-0 w-full">
        <h3
          className={`font-semibold text-xs sm:text-sm leading-snug truncate mb-0.5
            ${isCurrent ? 'text-[#1db954]' : 'text-white group-hover:text-white'}`}
          title={station.name}
        >
          {station.name}
        </h3>
        <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
          {station.country || 'Canlı Yayın'}
          {station.bitrate > 0 && ` • ${station.bitrate}k`}
        </p>
      </div>
    </div>
  )
}
