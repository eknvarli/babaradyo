import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid, faPlay, faSignal } from '@fortawesome/free-solid-svg-icons'
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

  const tags = station.tags
    ? station.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : []

  return (
    <div
      className={`
        relative glass glass-hover rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300 animate-fade-in group
        ${isCurrent
          ? 'border-brand-500/50 shadow-lg glow-brand playing-pulse'
          : 'border-white/5 hover:border-brand-500/30'
        }
      `}
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay(e)}
      aria-label={`${station.name} radyosunu oynat`}
    >
      {isCurrent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />
      )}

      <div className="p-4">
        <div className="relative mb-3 flex items-start justify-between">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0 shadow-md">
              <CardLogo
                key={station.id}
                name={station.name}
                favicon={station.favicon}
              />
            </div>

            {isCurrent && isPlaying && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleFavorite}
            className={`p-2 rounded-xl transition-all duration-200 z-10 flex items-center justify-center
              ${isFavorite
                ? 'text-pink-500 bg-pink-500/15 hover:bg-pink-500/25 shadow-sm shadow-pink-500/20'
                : 'text-white/30 hover:text-pink-400 hover:bg-pink-500/10'
              }`}
            aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
          >
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
              className={`text-base transition-transform duration-200 ${isFavorite ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </button>
        </div>

        <div className="flex-1 min-w-0 mb-3">
          <h3
            className={`font-semibold text-sm leading-tight truncate mb-1 transition-colors
              ${isCurrent ? 'text-brand-300' : 'text-white group-hover:text-brand-300'}`}
          >
            {station.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            {station.country && <span className="truncate">{station.countryCode || station.country}</span>}
            {station.bitrate > 0 && <><span>•</span><span>{station.bitrate}kbps</span></>}
            {station.codec && <><span>•</span><span className="uppercase">{station.codec}</span></>}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5 truncate max-w-[80px]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handlePlay}
          className={`
            w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold
            transition-all duration-200
            ${isCurrent && isPlaying
              ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30 shadow-sm'
              : 'bg-white/5 text-white/70 hover:bg-brand-600/20 hover:text-brand-300 border border-white/5 hover:border-brand-500/30'
            }
          `}
        >
          {isCurrent && isPlaying ? (
            <>
              <FontAwesomeIcon icon={faSignal} className="text-brand-400 animate-pulse text-xs" />
              <span>Çalıyor</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="text-xs" />
              <span>Oynat</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
