export const DEFAULT_RADIO_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="radioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a6cf7"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#radioGrad)"/>
  <circle cx="50" cy="50" r="32" fill="rgba(255,255,255,0.1)"/>
  <path d="M38 34c-6.627 0-12 5.373-12 12v12c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V46c0-6.627-5.373-12-12-12H38zm0 5h24c3.866 0 7 3.134 7 7v12c0 3.866-3.134 7-7 7H38c-3.866 0-7-3.134-7-7V46c0-3.866 3.134-7 7-7zm25 4a3 3 0 100 6 3 3 0 000-6zm-19 3a7 7 0 100 14 7 7 0 000-14zm0 3a4 4 0 110 8 4 4 0 010-8z" fill="#ffffff"/>
  <circle cx="50" cy="53" r="2.5" fill="#ffffff"/>
</svg>
`)}`;

export function safeFaviconUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed
}

export function getPlaceholderSvg(name = '') {
  const PALETTES = [
    ['#4a6cf7', '#7c3aed'],
    ['#ec4899', '#be123c'],
    ['#10b981', '#0d9488'],
    ['#f97316', '#d97706'],
    ['#06b6d4', '#0284c7'],
    ['#8b5cf6', '#7c3aed'],
    ['#ef4444', '#dc2626'],
    ['#14b8a6', '#0891b2'],
  ]
  const idx = name ? name.charCodeAt(0) % PALETTES.length : 0
  const [c1, c2] = PALETTES[idx]

  const initials = name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'BR'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <text x="32" y="41" font-size="${initials.length > 1 ? '22' : '26'}"
    font-family="system-ui, -apple-system, sans-serif" font-weight="700"
    fill="white" text-anchor="middle" opacity="0.95">${initials}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
