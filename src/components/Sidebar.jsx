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
    <div className="mb-2">
      <div className="px-4 py-2 flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className="text-white/30 text-xs" />}
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, badge, iconColor }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group
        ${active
          ? 'bg-brand-600/20 text-brand-300 border-l-2 border-brand-500 pl-[14px] shadow-sm'
          : 'text-white/65 hover:text-white hover:bg-white/5 border-l-2 border-transparent pl-[14px]'
        }`}
    >
      <span className={`w-4 text-center text-sm transition-colors ${iconColor || (active ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70')}`}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className="text-xs font-semibold bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
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
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          glass border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto md:h-auto md:flex
        `}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-base shadow-lg glow-brand">
            <FontAwesomeIcon icon={faRadio} />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text">BabaRadyo</h1>
            <p className="text-xs text-white/30">Canlı Radyo Platformu</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto md:hidden text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Menüyü kapat"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
          <SidebarSection title="Ana Menü" icon={faLayerGroup}>
            <NavItem
              icon={faGlobe}
              label="Dünya Radyoları"
              active={category === CATEGORIES.WORLD}
              onClick={() => handleCategoryClick(CATEGORIES.WORLD)}
              iconColor="text-sky-400"
            />
            <NavItem
              icon={faHeartSolid}
              label="Favorilerim"
              active={category === CATEGORIES.FAVORITES}
              onClick={() => handleCategoryClick(CATEGORIES.FAVORITES)}
              badge={favoritesCount > 0 ? favoritesCount : undefined}
              iconColor="text-pink-500"
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
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-xl transition-all duration-150 border-l-2 pl-[14px] text-left
                    ${isSelected
                      ? 'bg-brand-600/20 text-brand-300 border-brand-500 font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                >
                  <FontAwesomeIcon
                    icon={isAll ? faMapLocationDot : faLocationDot}
                    className={`w-3.5 text-xs ${isSelected ? 'text-brand-400' : 'text-white/35'}`}
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
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-xl transition-all duration-150 border-l-2 pl-[14px] text-left
                    ${isSelected
                      ? 'bg-brand-600/20 text-brand-300 border-brand-500 font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                >
                  <FontAwesomeIcon
                    icon={faMusic}
                    className={`w-3.5 text-xs ${isSelected ? 'text-brand-400' : 'text-white/35'}`}
                  />
                  <span className="truncate">{genre.label}</span>
                </button>
              )
            })}
          </SidebarSection>
        </div>

        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 font-medium">
            Radio Browser • hls.js
          </p>
        </div>
      </aside>
    </>
  )
}
