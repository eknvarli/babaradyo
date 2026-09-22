import { useState, useEffect, useRef, useCallback } from 'react'
import { setupStream, describeMediaError } from '../utils/streamHelper.js'
import { clickStation } from '../utils/api.js'

const STALL_TIMEOUT_MS = 8000

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

  useEffect(() => {
    failureCallbackRef.current = onStationFailure
  }, [onStationFailure])

  const showToast = useCallback((message, type = 'error', duration = 4000) => {
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

  const triggerStationFailure = useCallback(
    (station, reason = 'Yayın şu an kullanılamıyor') => {
      clearStallTimer()
      if (!station) return

      console.warn(`[BabaRadyo] İstasyon arızalı: ${station.name} (${reason})`)

      if (cleanupRef.current) {
        try { cleanupRef.current() } catch (_) {}
        cleanupRef.current = null
      }

      setIsPlaying(false)
      setIsLoading(false)
      setError(reason)

      showToast(`"${station.name}" yayını açılamadı, sıradaki radyoya geçiliyor...`, 'warn', 3500)

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
          triggerStationFailure(station, 'Yayın zaman aşımına uğradı')
        }
      }, STALL_TIMEOUT_MS)
    },
    [clearStallTimer, triggerStationFailure]
  )

  useEffect(() => {
    isMountedRef.current = true

    const audio = new Audio()
    audio.preload = 'none'
    audio.volume = volume
    audioRef.current = audio

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
      const reason = describeMediaError(audio.error)
      if (activeStationRef.current) {
        triggerStationFailure(activeStationRef.current, reason)
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
      audio.pause()
      try { audio.src = '' } catch (_) {}
      try { audio.load() } catch (_) {}
    }
  }, [])

  const playStation = useCallback(
    (station) => {
      if (!station || !station.url) {
        showToast('Bu istasyonun akış adresi bulunamadı.', 'warn')
        return
      }

      if (cleanupRef.current) {
        try { cleanupRef.current() } catch (_) {}
        cleanupRef.current = null
      }

      clearStallTimer()
      activeStationRef.current = station
      setCurrentStation(station)
      setIsLoading(true)
      setError(null)
      setIsPlaying(false)

      const audio = audioRef.current
      if (!audio) return

      startStallTimer(station)

      const cleanup = setupStream(audio, station.url, (errInfo) => {
        if (!isMountedRef.current) return
        const reason = errInfo?.message || 'Akış yüklenemedi'
        triggerStationFailure(station, reason)
      })

      cleanupRef.current = cleanup

      clickStation(station.id).catch(() => {})
    },
    [clearStallTimer, startStallTimer, triggerStationFailure, showToast]
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
        audio.play().catch((e) => {
          if (!isMountedRef.current) return
          clearStallTimer()
          if (e.name === 'NotAllowedError') {
            setIsLoading(false)
          } else {
            console.warn('Oynatma başlatılamadı:', e)
            if (currentStation) {
              triggerStationFailure(currentStation, 'Oynatma başlatılamadı')
            }
          }
        })
      } else if (currentStation) {
        playStation(currentStation)
      }
    }
  }, [isPlaying, currentStation, playStation, startStallTimer, clearStallTimer, triggerStationFailure])

  const stopStation = useCallback(() => {
    clearStallTimer()
    if (cleanupRef.current) {
      try { cleanupRef.current() } catch (_) {}
      cleanupRef.current = null
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
