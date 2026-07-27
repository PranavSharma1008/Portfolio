import { useEffect, useRef } from 'react'

const InteractiveGridBackground = ({
  gridSize = 50,
  gridColor = '#cbcbcb',
  effectColor = 'rgba(0, 0, 0, 0.6)',
  trailLength = 3,
  width,
  height,
  idleSpeed = 0.2,
  glow = true,
  glowRadius = 20,
  children,
  showFade = true,
  fadeIntensity = 20,
  idleRandomCount = 5,
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const lineColor = gridColor

  const trailRef = useRef([])
  const idleTargetsRef = useRef([])
  const idlePositionsRef = useRef([])
  const mouseActiveRef = useRef(false)
  const lastMouseTimeRef = useRef(Date.now())

  useEffect(() => {
    let rect = null
    const container = containerRef.current

    const updateRect = () => {
      if (container) rect = container.getBoundingClientRect()
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })

    const handleMouseMove = (e) => {
      if (!container) return
      if (!rect) rect = container.getBoundingClientRect()

      const rawX = e.clientX - rect.left
      const rawY = e.clientY - rect.top

      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height) return

      mouseActiveRef.current = true
      lastMouseTimeRef.current = Date.now()

      const snappedX = Math.floor(rawX / gridSize)
      const snappedY = Math.floor(rawY / gridSize)

      const last = trailRef.current[0]
      if (!last || last.x !== snappedX || last.y !== snappedY) {
        trailRef.current.unshift({ x: snappedX, y: snappedY })
        if (trailRef.current.length > trailLength) trailRef.current.pop()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gridSize, trailLength])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasWidth = width || window.innerWidth
    const canvasHeight = height || window.innerHeight
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const cols = Math.floor(canvasWidth / gridSize)
    const rows = Math.floor(canvasHeight / gridSize)

    const glowColor = effectColor

    idleTargetsRef.current = Array.from({ length: idleRandomCount }, () => ({
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }))
    idlePositionsRef.current = idleTargetsRef.current.map((p) => ({ ...p }))

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      const idleThreshold = 2000
      if (Date.now() - lastMouseTimeRef.current > idleThreshold) {
        mouseActiveRef.current = false

        idlePositionsRef.current.forEach((pos, i) => {
          const target = idleTargetsRef.current[i]
          const dx = target.x - pos.x
          const dy = target.y - pos.y

          if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            idleTargetsRef.current[i] = {
              x: Math.floor(Math.random() * cols),
              y: Math.floor(Math.random() * rows),
            }
          } else {
            pos.x += dx * idleSpeed
            pos.y += dy * idleSpeed
          }

          const roundedX = Math.round(pos.x)
          const roundedY = Math.round(pos.y)
          const last = trailRef.current[0]
          if (!last || last.x !== roundedX || last.y !== roundedY) {
            trailRef.current.unshift({ x: roundedX, y: roundedY })
            if (trailRef.current.length > trailLength * idleRandomCount)
              trailRef.current.pop()
          }
        })
      }

      trailRef.current.forEach((cell, idx) => {
        const alpha = 1 - idx * (1 / (trailLength + 1))
        const rgbaColor = glowColor.replace(/[\d.]+\)$/, `${alpha})`)

        ctx.fillStyle = rgbaColor
        if (glow) {
          ctx.shadowColor = rgbaColor
          ctx.shadowBlur = glowRadius
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize)
      })

      requestAnimationFrame(draw)
    }

    draw()
  }, [
    gridSize, width, height, gridColor,
    effectColor, trailLength,
    idleSpeed, glow, glowRadius, idleRandomCount,
  ])

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: -1,
          width: width || '100vw', height: height || '100vh',
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, zIndex: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(to right, ${lineColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />

      {showFade && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            pointerEvents: 'none',
            background: 'var(--background-white)',
            maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
            WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
          }}
        />
      )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  )
}

export default InteractiveGridBackground
