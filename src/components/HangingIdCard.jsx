import { useRef, useEffect, useCallback, useState } from 'react'
import profileImage from '../assets/profile.png'

const SPRING_K = 0
const DAMPING = 0.9
const GRAVITY = 3000
const MASS = 1

const Lanyard = ({ length, color }) => {
  return (
    <svg
      width="36"
      height={length}
      viewBox={`0 0 36 ${length}`}
      style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
    >
      <circle cx="18" cy="0" r="6" fill={color} />
      <path d={`M 15 0 L 12 ${length}`} stroke={color} strokeWidth="7" opacity="0.9" />
      <path d={`M 21 0 L 24 ${length}`} stroke={color} strokeWidth="7" opacity="0.9" />
      <rect x="12" y={length - 7} width="12" height="10" rx="2" fill="#94a3b8" />
      <circle cx="18" cy={length + 3} r="4" fill="#e2e8f0" />
    </svg>
  )
}

const getFormattedDate = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear()
  return `${day} ${month} ${year}`
}

const HangingIdCard = ({
  name = 'Pranav Sharma',
  role = 'Software Engineer',
  email = 'pranav2410991479@gmail.com',
  phone = '+91 9317290976',
  badgeId = getFormattedDate(),
  accentColor = '#2563EB',
  ropeColor = '#4a5568',
  ropeLength = 150,
}) => {
  const physRef = useRef({ angle: 0, vel: 0 })
  const rafRef = useRef(null)
  const prevTimeRef = useRef(null)
  const prevAngleRef = useRef(0)
  const isDraggingRef = useRef(false)

  const [angle, setAngle] = useState(0)
  const [effectiveRopeLength, setEffectiveRopeLength] = useState(ropeLength)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setEffectiveRopeLength(90)
      } else {
        setEffectiveRopeLength(ropeLength)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ropeLength])

  const dragStartX = useRef(0)
  const dragAngle0 = useRef(0)

  const tick = useCallback((now) => {
    if (prevTimeRef.current === null) prevTimeRef.current = now
    const dt = Math.min((now - prevTimeRef.current) / 1000, 0.05)
    prevTimeRef.current = now

    const s = physRef.current
    if (!isDraggingRef.current) {
      const L = effectiveRopeLength + 100
      const torque =
        -(GRAVITY / L) * Math.sin(s.angle) -
        (DAMPING / MASS) * s.vel -
        (SPRING_K / MASS) * s.angle

      s.vel += torque * dt
      s.angle += s.vel * dt

      setAngle(s.angle)

      if (Math.abs(s.angle) > 0.001 || Math.abs(s.vel) > 0.001) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        s.angle = 0
        s.vel = 0
        setAngle(0)
      }
    } else {
      if (dt > 0) {
        s.vel = (s.angle - prevAngleRef.current) / dt
      }
      prevAngleRef.current = s.angle
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [effectiveRopeLength])

  const startPhysics = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    prevTimeRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    dragStartX.current = e.clientX
    dragAngle0.current = physRef.current.angle
    prevAngleRef.current = physRef.current.angle
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    prevTimeRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const onPointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartX.current
    const L = effectiveRopeLength + 100
    const newAngle = dragAngle0.current - dx / L
    const clamped = Math.max(-1.4, Math.min(1.4, newAngle))
    physRef.current.angle = clamped
    setAngle(clamped)
  }, [effectiveRopeLength])

  const onPointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    isDraggingRef.current = false
  }, [])

  const onCardClick = useCallback(() => {
    if (Math.abs(physRef.current.vel) < 0.1 && Math.abs(physRef.current.angle) < 0.05) {
      physRef.current.vel = 4.0
      startPhysics()
    }
  }, [startPhysics])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const cardRotateDeg = angle * (180 / Math.PI)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', touchAction: 'pan-y' }}>
      <div
        style={{
          width: '14px', height: '14px', borderRadius: '50%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10,
          background: accentColor,
        }}
      />

      <div
        className="hanging-card-grabber"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: '-6px',
          transform: `rotate(${cardRotateDeg}deg)`,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onCardClick}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Lanyard length={effectiveRopeLength} color={ropeColor} />
        </div>

          <div
            style={{
            position: 'relative', width: '280px', maxWidth: '85vw', borderRadius: '18px',
            overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'white', pointerEvents: 'none', marginTop: '-2px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              style={{
                padding: '14px 20px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px',
                background: `linear-gradient(135deg, ${accentColor} 0%, #3758f9 100%)`,
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', margin: 0 }}>
                Portfolio
              </p>
              <div
                style={{
                  display: 'flex', width: '90px', height: '90px', alignItems: 'center',
                  justifyContent: 'center', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)', marginTop: '6px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden',
                }}
              >
                <img
                  src={profileImage}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', textAlign: 'center', lineHeight: 1.25, margin: 0 }}>
                {name}
              </p>
              <p style={{ fontSize: '13px', color: '#71717a', fontWeight: 500, margin: 0 }}>
                {role}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                <p style={{ fontSize: '10px', color: '#52525b', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {email}
                </p>
                <p style={{ fontSize: '10px', color: '#52525b', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {phone}
                </p>
              </div>

              <div style={{ margin: '10px 0', width: '100%', borderTop: '1px solid #f4f4f5' }} />

              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '32px', padding: '0 4px' }}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#27272a',
                      borderRadius: '1px',
                      width: i % 3 === 0 ? '3px' : '1.5px',
                      height: `${50 + Math.sin(i * 1.3) * 35}%`,
                    }}
                  />
                ))}
              </div>

              <p style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, marginTop: '4px', letterSpacing: '0.1em', color: accentColor, margin: '4px 0 0 0' }}>
                {badgeId}
              </p>

              <div
                style={{
                  marginTop: '6px', padding: '3px 14px', borderRadius: '9999px',
                  fontSize: '11px', fontWeight: 700, color: 'white',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: accentColor,
                }}
              >
                ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default HangingIdCard
