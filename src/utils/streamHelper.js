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

export function isPlaylistFile(url) {
  if (!url) return false
  const lower = url.toLowerCase().split('?')[0]
  return lower.endsWith('.pls') || lower.endsWith('.asx') || (lower.endsWith('.m3u') && !lower.endsWith('.m3u8'))
}

export function resetAudioElement(audio) {
  if (!audio) return
  try {
    audio.pause()
  } catch (_) {}
  try {
    audio.removeAttribute('src')
  } catch (_) {}
  try {
    audio.load()
  } catch (_) {}
}

export function describeMediaError(err) {
  if (!err) return 'Akış bağlantı hatası'
  if (typeof err === 'string') return err
  if (err.message && typeof err.message === 'string') return err.message
  if (err.code) {
    switch (err.code) {
      case 1:
        return 'Kullanıcı tarafından durduruldu'
      case 2:
        return 'Ağ bağlantısı zaman aşımına uğradı'
      case 3:
        return 'Ses çözme (PIPELINE_ERROR_DECODE) hatası'
      case 4:
        return 'Format desteklenmiyor veya sunucu kapalı'
      default:
        return `Medya hatası (kod: ${err.code})`
    }
  }
  return 'Geçici Olarak Kullanılamıyor'
}

export function setupStream(audioEl, originalUrl, onError) {
  if (!audioEl || !originalUrl) return () => {}

  let hlsInstance = null
  let isCleanedUp = false

  const streamUrl = originalUrl.trim()

  if (isPlaylistFile(streamUrl)) {
    if (onError) {
      onError({
        message: 'Doğrudan oynatılamayan çalma listesi (.pls/.m3u)',
        code: 4,
        originalUrl: streamUrl,
      })
    }
    return () => {}
  }

  resetAudioElement(audioEl)
  audioEl.preload = 'none'
  audioEl.crossOrigin = 'anonymous'

  const handleFatalError = (err) => {
    if (isCleanedUp) return
    const message = describeMediaError(err)
    if (onError) onError({ message, originalUrl: streamUrl, error: err })
  }

  const isHls = isHlsStream(streamUrl)

  if (isHls) {
    if (Hls.isSupported()) {
      try {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 10,
          maxBufferLength: 15,
          manifestLoadingTimeOut: 7000,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 7000,
          levelLoadingMaxRetry: 1,
          fragLoadingTimeOut: 8000,
          fragLoadingMaxRetry: 1,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false
          },
        })

        hls.attachMedia(audioEl)

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          if (isCleanedUp) return
          hls.loadSource(streamUrl)
        })

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isCleanedUp) return
          const playPromise = audioEl.play()
          if (playPromise !== undefined) {
            playPromise.catch((e) => {
              if (e.name !== 'NotAllowedError') {
                handleFatalError(e)
              }
            })
          }
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (isCleanedUp) return
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError()
                break
              default:
                hls.destroy()
                handleFatalError(data)
                break
            }
          }
        })

        hlsInstance = hls
      } catch (hlsInitErr) {
        handleFatalError(hlsInitErr)
      }
    } else if (audioEl.canPlayType('application/vnd.apple.mpegurl')) {
      try {
        audioEl.src = streamUrl
        audioEl.load()
        const playPromise = audioEl.play()
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            if (e.name !== 'NotAllowedError') {
              handleFatalError(e)
            }
          })
        }
      } catch (safariErr) {
        handleFatalError(safariErr)
      }
    } else {
      handleFatalError('Cihazınız HLS (.m3u8) akışlarını desteklemiyor')
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
    resetAudioElement(audioEl)
  }
}
