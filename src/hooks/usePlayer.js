import { useState, useEffect, useRef, useCallback } from 'react'
import { setupStream, resetAudioElement, describeMediaError } from '../utils/streamHelper.js'
import { clickStation } from '../utils/api.js'

const STALL_TIMEOUT_MS = 7500

export function usePlayer({ onStationFailure } = {}) {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const audioRef = useRef(null)
  const cleanupRef = useRef(null)
  const stallTimerRef = useRef(null)
  const isMountedRef = useRef(true)
  const failureCallbackRef = useRef(onStationFailure)
  const activeStationRef = useRef(null)
  const currentUrlIndexRef = useRef(0)

  useEffect(() => {
    failureCallbackRef.current = onStationFailure
  }, [onStationFailure])

  const showToast = useCallback((message, type = 'error', duration = 3500) => {
    if (!isMountedRef.current) return
    setToast({ message, type, id: Date.now() })
    setTimeout(() => {
      if (isMountedRef.current) setToast(null)
    }, duration)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current)
      stallTimerRef.current = null
    }
  }, [])

  const handleStationError = useCallback(
    (station, errorInfo) => {
      clearStallTimer()
      if (!station || !isMountedRef.current) return

      const urls = []
      if (station.url_resolved) urls.push(station.url_resolved)
      if (station.url && !urls.includes(station.url)) urls.push(station.url)

      const nextUrlIndex = currentUrlIndexRef.current + 1

      if (nextUrlIndex < urls.length) {
        currentUrlIndexRef.current = nextUrlIndex
        const nextUrl = urls[nextUrlIndex]
        showToast(`"${station.name}" için alternatif akış deneniyor...`, 'info', 2500)

        const audio = audioRef.current
        if (audio) {
          resetAudioElement(audio)
          audio.preload = 'none'
          audio.crossOrigin = 'anonymous'
        }

        if (cleanupRef.current) {
          try {
            cleanupRef.current()
          } catch (_) {}
          cleanupRef.current = null
        }

        setIsLoading(true)
        setIsPlaying(false)

        stallTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return
          if (activeStationRef.current && activeStationRef.current.id === station.id) {
            handleStationError(station, { message: 'Zaman aşımı', code: 2 })
          }
        }, STALL_TIMEOUT_MS)

        if (audio) {
          cleanupRef.current = setupStream(audio, nextUrl, (err) => {
            if (!isMountedRef.current) return
            handleStationError(station, err)
          })
        }
        return
      }

      if (cleanupRef.current) {
        try {
          cleanupRef.current()
        } catch (_) {}
        cleanupRef.current = null
      }

      const audio = audioRef.current
      if (audio) {
        resetAudioElement(audio)
      }

      const errorText = 'Geçici Olarak Kullanılamıyor'
      setIsPlaying(false)
      setIsLoading(false)
      setError(errorText)

      showToast(`"${station.name}" geçici olarak kullanılamıyor, sıradaki radyoya geçiliyor...`, 'warn', 3500)

      if (failureCallbackRef.current) {
        failureCallbackRef.current(station)
      }
    },
    [clearStallTimer, showToast]
  )

  const startStallTimer = useCallback(
    (station) => {
      clearStallTimer()
      stallTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return
        if (activeStationRef.current && activeStationRef.current.id === station?.id) {
          handleStationError(station, { message: 'Yayın yanıt vermedi (ERR_CONNECTION_TIMED_OUT)', code: 2 })
        }
      }, STALL_TIMEOUT_MS)
    },
    [clearStallTimer, handleStationError]
  )

  useEffect(() => {
    isMountedRef.current = true

    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'none'
      audio.crossOrigin = 'anonymous'
      audio.volume = volume
      audioRef.current = audio
    }

    const audio = audioRef.current

    const onPlaying = () => {
      if (!isMountedRef.current) return
      clearStallTimer()
      setIsPlaying(true)
      setIsLoading(false)
      setError(null)
    }

    const onWaiting = () => {
      if (!isMountedRef.current) return
      setIsLoading(true)
      if (activeStationRef.current) {
        startStallTimer(activeStationRef.current)
      }
    }

    const onPause = () => {
      if (!isMountedRef.current) return
      clearStallTimer()
      setIsPlaying(false)
    }

    const onError = () => {
      if (!isMountedRef.current) return
      clearStallTimer()
      const mediaErr = audio.error
      const reason = describeMediaError(mediaErr)
      if (activeStationRef.current) {
        handleStationError(activeStationRef.current, {
          message: reason,
          code: mediaErr?.code,
          error: mediaErr,
        })
      }
    }

    const onCanPlay = () => {
      if (!isMountedRef.current) return
      clearStallTimer()
      setIsLoading(false)
    }

    const onStalled = () => {
      if (!isMountedRef.current) return
      setIsLoading(true)
      if (activeStationRef.current) {
        startStallTimer(activeStationRef.current)
      }
    }

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('stalled', onStalled)

    return () => {
      isMountedRef.current = false
      clearStallTimer()
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('stalled', onStalled)
      resetAudioElement(audio)
    }
  }, [])

  const playStation = useCallback(
    (station) => {
      if (!station) return

      const urls = []
      if (station.url_resolved) urls.push(station.url_resolved)
      if (station.url && !urls.includes(station.url)) urls.push(station.url)

      if (urls.length === 0) {
        showToast('Bu istasyonun akış adresi bulunamadı.', 'warn')
        return
      }

      currentUrlIndexRef.current = 0
      const initialUrl = urls[0]

      if (cleanupRef.current) {
        try {
          cleanupRef.current()
        } catch (_) {}
        cleanupRef.current = null
      }

      const audio = audioRef.current
      if (audio) {
        resetAudioElement(audio)
        audio.preload = 'none'
        audio.crossOrigin = 'anonymous'
      }

      clearStallTimer()
      activeStationRef.current = station
      setCurrentStation(station)
      setIsLoading(true)
      setError(null)
      setIsPlaying(false)

      if (!audio) return

      startStallTimer(station)

      const cleanup = setupStream(audio, initialUrl, (errInfo) => {
        if (!isMountedRef.current) return
        handleStationError(station, errInfo)
      })

      cleanupRef.current = cleanup

      if (station.id) {
        clickStation(station.id).catch(() => {})
      }
    },
    [clearStallTimer, startStallTimer, handleStationError, showToast]
  )

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      if (audio.src && audio.src !== window.location.href) {
        setIsLoading(true)
        if (currentStation) startStallTimer(currentStation)
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            if (!isMountedRef.current) return
            clearStallTimer()
            if (e.name === 'NotAllowedError') {
              setIsLoading(false)
            } else {
              if (currentStation) {
                handleStationError(currentStation, e)
              }
            }
          })
        }
      } else if (currentStation) {
        playStation(currentStation)
      }
    }
  }, [isPlaying, currentStation, playStation, startStallTimer, clearStallTimer, handleStationError])

  const stopStation = useCallback(() => {
    clearStallTimer()
    if (cleanupRef.current) {
      try {
        cleanupRef.current()
      } catch (_) {}
      cleanupRef.current = null
    }
    const audio = audioRef.current
    if (audio) {
      resetAudioElement(audio)
    }
    activeStationRef.current = null
    setIsPlaying(false)
    setIsLoading(false)
    setCurrentStation(null)
    setError(null)
  }, [clearStallTimer])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    try {
      audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume))
    } catch (_) {}
  }, [volume, isMuted])

  const handleVolumeChange = useCallback((v) => {
    setVolume(Math.max(0, Math.min(1, v)))
    setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => setIsMuted((m) => !m), [])

  return {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    toast,
    audioRef,
    playStation,
    togglePlay,
    stopStation,
    handleVolumeChange,
    toggleMute,
    dismissToast,
    showToast,
  }
}
