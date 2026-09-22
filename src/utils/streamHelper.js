import Hls from 'hls.js'

export function isHlsStream(url) {
  if (!url) return false
  const lower = url.toLowerCase()
  return (
    lower.includes('.m3u8') ||
    lower.includes('/hls/') ||
    lower.includes('live.m3u8') ||
    lower.includes('chunklist') ||
    lower.includes('format=m3u8')
  )
}

export function tryUpgradeToHttps(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (window.location.protocol === 'https:' && trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://')
  }
  return trimmed
}

export function describeMediaError(err) {
  if (!err) return 'Akış bağlantı hatası'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  if (err.code) {
    switch (err.code) {
      case 1: return 'Kullanıcı tarafından durduruldu'
      case 2: return 'Ağ bağlantısı koptu'
      case 3: return 'Ses çözme (codec) hatası'
      case 4: return 'Yayın sunucusu yanıt vermiyor veya format desteklenmiyor'
      default: return `Medya hatası (kod: ${err.code})`
    }
  }
  return 'Yayın şu an kullanılamıyor'
}

export function setupStream(audioEl, originalUrl, onError) {
  if (!audioEl || !originalUrl) return () => {}

  let hlsInstance = null
  let isCleanedUp = false

  const streamUrl = originalUrl.trim()
  const isHls = isHlsStream(streamUrl)

  const handleFatalError = (err) => {
    if (isCleanedUp) return
    const message = describeMediaError(err)
    if (onError) onError({ message, originalUrl: streamUrl, error: err })
  }

  if (isHls) {
    if (Hls.isSupported()) {
      try {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 15,
          maxLoadingDelay: 4,
          maxBufferLength: 20,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 8000,
          levelLoadingMaxRetry: 2,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 2,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false
          },
        })

        hls.loadSource(streamUrl)
        hls.attachMedia(audioEl)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isCleanedUp) return
          audioEl.play().catch((e) => {
            if (e.name !== 'NotAllowedError') {
              handleFatalError(e)
            }
          })
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (isCleanedUp) return
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('HLS ağ hatası:', data.details)
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('HLS medya kurtarma deneniyor:', data.details)
                hls.recoverMediaError()
                break
              default:
                console.error('HLS giderilemeyen hata:', data)
                hls.destroy()
                handleFatalError(data)
                break
            }
          }
        })

        hlsInstance = hls
      } catch (hlsInitErr) {
        console.error('HLS başlatılamadı:', hlsInitErr)
        handleFatalError(hlsInitErr)
      }
    } else if (audioEl.canPlayType('application/vnd.apple.mpegurl')) {
      audioEl.src = streamUrl
      audioEl.load()
      audioEl.play().catch((e) => {
        if (e.name !== 'NotAllowedError') {
          handleFatalError(e)
        }
      })
    } else {
      handleFatalError('Tarayıcınız HLS (.m3u8) akışlarını desteklemiyor')
    }
  } else {
    try {
      audioEl.src = streamUrl
      audioEl.load()
      const playPromise = audioEl.play()
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (isCleanedUp) return
          if (e.name !== 'NotAllowedError') {
            console.warn('HTML5 Audio oynatma hatası:', e.name, e.message)
            handleFatalError(e)
          }
        })
      }
    } catch (directErr) {
      handleFatalError(directErr)
    }
  }

  return () => {
    isCleanedUp = true
    if (hlsInstance) {
      try {
        hlsInstance.destroy()
      } catch (_) {}
      hlsInstance = null
    }
    try {
      audioEl.pause()
      audioEl.removeAttribute('src')
      audioEl.load()
    } catch (_) {}
  }
}
