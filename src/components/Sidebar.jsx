import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faRadio,
  faGlobe,
  faHeart as faHeartSolid,
  faMapLocationDot,
  faLocationDot,
  faMusic,
  faXmark,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import { CATEGORIES, TURKEY_CITIES, MUSIC_GENRES } from '../hooks/useRadio.js'

function SidebarSection({ title, icon, children }) {
  return (
    <div className="mb-1">
      <div className="px-4 py-2 flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className="text-white/20 text-xs" />}
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-150 text-left
        ${active
          ? 'text-white border-l-[3px] border-white pl-[13px]'
          : 'text-spotify-muted hover:text-white border-l-[3px] border-transparent pl-[13px]'
        }`}
      style={{ background: active ? 'rgba(255,255,255,0.07)' : undefined }}
    >
      <span className={`w-4 text-center text-sm ${active ? 'text-white' : 'text-spotify-subtle'}`}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className="text-[10px] font-bold bg-white/10 text-white/70 px-1.5 py-0.5 rounded-sm min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({
  category,
  setCategory,
  selectedCity,
  setSelectedCity,
  selectedGenre,
  setSelectedGenre,
  favoritesCount,
  isOpen,
  onClose,
}) {
  const handleCategoryClick = (cat) => {
    setCategory(cat)
    if (window.innerWidth < 768) onClose?.()
  }

  const handleCityClick = (city) => {
    setCategory(CATEGORIES.TURKEY)
    setSelectedCity(city)
    if (window.innerWidth < 768) onClose?.()
  }

  const handleGenreClick = (genre) => {
    setCategory(CATEGORIES.GENRES)
    setSelectedGenre(genre)
    if (window.innerWidth < 768) onClose?.()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto md:h-auto md:flex
        `}
        style={{ background: '#121212', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-black text-sm shadow-md">
            <FontAwesomeIcon icon={faRadio} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">BabaRadyo</h1>
            <p className="text-[10px] text-spotify-subtle">Canlı Radyo Platformu</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto md:hidden text-spotify-subtle hover:text-white p-1 rounded transition-colors"
            aria-label="Menüyü kapat"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <SidebarSection title="Keşfet" icon={faLayerGroup}>
            <NavItem
              icon={faGlobe}
              label="Dünya Radyoları"
              active={category === CATEGORIES.WORLD}
              onClick={() => handleCategoryClick(CATEGORIES.WORLD)}
            />
            <NavItem
              icon={faHeartSolid}
              label="Favorilerim"
              active={category === CATEGORIES.FAVORITES}
              onClick={() => handleCategoryClick(CATEGORIES.FAVORITES)}
              badge={favoritesCount > 0 ? favoritesCount : undefined}
            />
          </SidebarSection>

          <SidebarSection title="Türkiye" icon={faMapLocationDot}>
            {TURKEY_CITIES.map((city) => {
              const isAll = city === 'Tümü'
              const isSelected = category === CATEGORIES.TURKEY && selectedCity === city
              return (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition-all duration-150 text-left
                    border-l-[3px] pl-[13px]
                    ${isSelected
                      ? 'text-white border-white'
                      : 'text-spotify-muted hover:text-white border-transparent'
                    }`}
                  style={{ background: isSelected ? 'rgba(255,255,255,0.07)' : undefined }}
                >
                  <FontAwesomeIcon
                    icon={isAll ? faMapLocationDot : faLocationDot}
                    className={`w-3.5 text-xs ${isSelected ? 'text-white' : 'text-spotify-subtle'}`}
                  />
                  <span className="truncate">{isAll ? 'Tüm Türkiye' : city}</span>
                </button>
              )
            })}
          </SidebarSection>

          <SidebarSection title="Müzik Türleri" icon={faMusic}>
            {MUSIC_GENRES.map((genre) => {
              const isSelected = category === CATEGORIES.GENRES && selectedGenre.tag === genre.tag
              return (
                <button
                  key={genre.tag}
                  onClick={() => handleGenreClick(genre)}
                  className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition-all duration-150 text-left
                    border-l-[3px] pl-[13px]
                    ${isSelected
                      ? 'text-white border-white'
                      : 'text-spotify-muted hover:text-white border-transparent'
                    }`}
                  style={{ background: isSelected ? 'rgba(255,255,255,0.07)' : undefined }}
                >
                  <FontAwesomeIcon
                    icon={faMusic}
                    className={`w-3.5 text-xs ${isSelected ? 'text-white' : 'text-spotify-subtle'}`}
                  />
                  <span className="truncate">{genre.label}</span>
                </button>
              )
            })}
          </SidebarSection>
        </div>

        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] text-spotify-subtle font-medium">
            Radio Browser · hls.js
          </p>
        </div>
      </aside>
    </>
  )
}
