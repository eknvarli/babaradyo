import React, { useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'

export default function SearchBar({ query, onChange, onClear, isSearching }) {
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onClear()
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClear])

  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
        {isSearching ? (
          <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
        ) : (
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="w-3.5 h-3.5 text-neutral-400 group-focus-within:text-white transition-colors"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Radyo ara... (Ctrl+K)"
        className="
          w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 sm:py-2.5
          bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a]
          rounded-full text-xs sm:text-sm text-white placeholder-neutral-400
          outline-none border border-transparent focus:border-white/20
          transition-all duration-150 caret-white
        "
      />

      {query && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors"
          aria-label="Aramayı temizle"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}
    </div>
  )
}
