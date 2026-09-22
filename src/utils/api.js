const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://fr1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
]

let currentServerIndex = 0

function getBaseUrl() {
  return API_SERVERS[currentServerIndex % API_SERVERS.length]
}

async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${getBaseUrl()}/json${endpoint}`)

  url.searchParams.set('hidebroken', 'true')
  url.searchParams.set('ssl_error', '0')
  url.searchParams.set('lastcheckok', '1')
  url.searchParams.set('order', 'votes')
  url.searchParams.set('reverse', 'true')
  url.searchParams.set('has_extended_info', 'false')

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BabaRadyo/1.0.0 (https://github.com/babaradyo)',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    return await res.json()
  } catch (err) {
    clearTimeout(timeout)
    currentServerIndex++
    if (currentServerIndex < API_SERVERS.length * 2) {
      return apiFetch(endpoint, params)
    }
    throw err
  }
}

function normalizeStation(station) {
  const streamUrl = (station.url_resolved || station.url || '').trim()

  return {
    id: station.stationuuid,
    name: station.name?.trim() || 'Bilinmeyen İstasyon',
    url: streamUrl,
    homepage: station.homepage,
    favicon: station.favicon || '',
    country: station.country,
    countryCode: station.countrycode,
    state: station.state,
    language: station.language,
    tags: station.tags || '',
    codec: station.codec,
    bitrate: station.bitrate,
    votes: station.votes || 0,
    clickCount: station.clickcount || 0,
    lastcheckok: station.lastcheckok === 1,
    sslError: station.ssl_error === 1,
  }
}

export async function fetchTurkeyStations({ city = '', limit = 150 } = {}) {
  const params = { limit, countrycode: 'TR' }

  if (city && city !== 'Tümü') {
    params.state = city
  }

  const data = await apiFetch('/stations/search', {
    ...params,
    order: 'votes',
    reverse: 'true',
  })
  return data.map(normalizeStation).filter(s => s.url && s.url.startsWith('http'))
}

export async function fetchTopWorldStations({ limit = 100 } = {}) {
  const data = await apiFetch('/stations/topvote', { limit })
  return data.map(normalizeStation).filter(s => s.url && s.url.startsWith('http'))
}

export async function fetchStationsByTag({ tag, limit = 100 } = {}) {
  const data = await apiFetch('/stations/bytag/' + encodeURIComponent(tag), {
    limit,
    order: 'votes',
    reverse: 'true',
  })
  return data.map(normalizeStation).filter(s => s.url && s.url.startsWith('http'))
}

export async function searchStations({ query, limit = 60 } = {}) {
  if (!query || query.trim().length < 2) return []

  const data = await apiFetch('/stations/search', {
    name: query.trim(),
    limit,
    order: 'votes',
    reverse: 'true',
  })
  return data.map(normalizeStation).filter(s => s.url && s.url.startsWith('http'))
}

export async function clickStation(stationId) {
  if (!stationId) return
  try {
    await apiFetch(`/url/${stationId}`)
  } catch {
  }
}
