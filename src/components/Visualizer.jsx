import React, { useEffect, useRef, useCallback } from 'react'

export default function Visualizer({ isPlaying, volume = 0.8 }) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const phaseRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const barCount = 36
    const barWidth = (W / barCount) * 0.65
    const gap = (W / barCount) * 0.35
    let x = 0

    phaseRef.current += 0.08
    const phase = phaseRef.current

    for (let i = 0; i < barCount; i++) {
      const normalizedPos = i / barCount
      const envelope = Math.sin(normalizedPos * Math.PI)
      const wave1 = Math.sin(phase + i * 0.35) * 0.5 + 0.5
      const wave2 = Math.cos(phase * 1.3 - i * 0.25) * 0.5 + 0.5
      const combined = (wave1 * 0.6 + wave2 * 0.4) * envelope

      const minH = 3
      const maxH = H * 0.95
      const activeHeight = minH + combined * (maxH - minH) * Math.max(0.2, volume)

      const r = Math.round(74 + combined * 120)
      const g = Math.round(108 - combined * 30)
      const b = Math.round(247)
      const alpha = 0.5 + combined * 0.5

      const gradient = ctx.createLinearGradient(0, H, 0, H - activeHeight)
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(${r + 30}, ${g + 20}, ${b - 20}, ${alpha * 0.85})`)
      gradient.addColorStop(1, `rgba(236, 72, 153, ${alpha * 0.7})`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, H - activeHeight, barWidth, activeHeight, [2, 2, 0, 0])
      ctx.fill()

      if (combined > 0.65) {
        ctx.shadowBlur = 6
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`
        ctx.fill()
        ctx.shadowBlur = 0
      }

      x += barWidth + gap
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [volume])

  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const barCount = 36
    const barWidth = (W / barCount) * 0.65
    const gap = (W / barCount) * 0.35
    let x = 0

    for (let i = 0; i < barCount; i++) {
      const idleH = 2.5 + Math.sin((i / barCount) * Math.PI) * 2.5
      ctx.fillStyle = 'rgba(74, 108, 247, 0.25)'
      ctx.beginPath()
      ctx.roundRect(x, H - idleH, barWidth, idleH, [1, 1, 0, 0])
      ctx.fill()
      x += barWidth + gap
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(draw)
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      drawIdle()
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isPlaying, draw, drawIdle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = Math.round(width * window.devicePixelRatio)
        canvas.height = Math.round(height * window.devicePixelRatio)
        const ctx = canvas.getContext('2d')
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        if (!isPlaying) drawIdle()
      }
    })

    resizeObserver.observe(canvas)
    return () => resizeObserver.disconnect()
  }, [isPlaying, drawIdle])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
      title="Canlı ses görselleştiricisi"
    />
  )
}
