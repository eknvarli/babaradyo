import React, { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

const ICONS = {
  error: <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4 text-red-400 flex-shrink-0" />,
  warn:  <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  info:  <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-brand-400 flex-shrink-0" />,
}

const STYLES = {
  error: 'bg-red-950/85 border-red-500/40 text-red-200',
  warn:  'bg-amber-950/85 border-amber-500/40 text-amber-200',
  info:  'bg-brand-950/85 border-brand-500/40 text-brand-200',
}

export default function Toast({ toast, onDismiss }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    timerRef.current = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timerRef.current)
  }, [toast?.id])

  if (!toast) return null

  const type = toast.type || 'error'

  return (
    <div
      className={`
        fixed bottom-24 right-4 z-50
        flex items-start gap-3
        max-w-sm w-full sm:w-auto
        px-4 py-3 rounded-2xl
        glass-strong border
        shadow-2xl
        animate-slide-up
        ${STYLES[type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <span className="mt-0.5">{ICONS[type]}</span>

      <p className="flex-1 text-sm leading-snug">{toast.message}</p>

      <button
        onClick={onDismiss}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
        aria-label="Bildirimi kapat"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
