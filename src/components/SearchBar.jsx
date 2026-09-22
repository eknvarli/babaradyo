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
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isSearching ? (
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 text-brand-400 animate-spin" />
        ) : (
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="w-4 h-4 text-white/30 group-focus-within:text-brand-400 transition-colors"
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
          w-full pl-11 pr-10 py-3
          glass rounded-xl
          text-sm text-white placeholder-white/25
          outline-none border border-white/5
          focus:border-brand-500/50 focus:bg-white/6
          transition-all duration-200
          caret-brand-400
        "
      />

      {query && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white transition-colors"
          aria-label="Aramayı temizle"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
