export const DEFAULT_RADIO_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" rx="16" fill="#242424"/>
  <circle cx="50" cy="50" r="30" fill="#2e2e2e"/>
  <path d="M36 36c-5.5 0-10 4.5-10 10v12c0 5.5 4.5 10 10 10h28c5.5 0 10-4.5 10-10V46c0-5.5-4.5-10-10-10H36zm0 4h28c3.3 0 6 2.7 6 6v12c0 3.3-2.7 6-6 6H36c-3.3 0-6-2.7-6-6V46c0-3.3 2.7-6 6-6zm24 3a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm-18 3a6 6 0 100 12 6 6 0 000-12zm0 2.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" fill="#888888"/>
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
  const initials = name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'BR'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="10" fill="#242424"/>
  <circle cx="32" cy="32" r="22" fill="#2d2d2d"/>
  <text x="32" y="38" font-size="${initials.length > 1 ? '18' : '22'}"
    font-family="system-ui, -apple-system, sans-serif" font-weight="600"
    fill="#b3b3b3" text-anchor="middle">${initials}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
