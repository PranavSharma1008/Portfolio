import { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

const lightVars = {
  '--primary-blue': '#2563EB',
  '--primary-blue-hover': '#3B82F6',
  '--primary-blue-dark': '#1D4ED8',
  '--background-white': '#FFFFFF',
  '--header-bg': '#F8FAFC',
  '--secondary-gray': '#F1F5F9',
  '--text-dark': '#1F2A44',
  '--text-medium': '#475569',
  '--text-light': '#64748B',
  '--green-accent': '#10B981',
  '--green-dark': '#059669',
  '--border-color': '#E2E8F0',
  '--glass-bg': 'rgba(255, 255, 255, 0.6)',
  '--glass-border': 'rgba(255, 255, 255, 0.3)',
  '--card-bg': '#FFFFFF',
  '--hero-gradient-from': 'rgba(37, 99, 235, 0.08)',
  '--hero-gradient-to': 'rgba(16, 185, 129, 0.06)',
  '--footer-bg': 'rgba(31, 42, 68, 0.85)',
  '--contact-btn-shadow': 'rgba(37, 99, 235, 0.25)',
  '--nav-link-color': '#475569',
  '--nav-link-hover': '#3B82F6',
  '--badge-bg': '#10B981',
  '--badge-shadow': 'rgba(16, 185, 129, 0.25)',
  '--skill-tag-bg': '#f1f5f9',
  '--skill-tag-color': '#334155',
  '--badge-color': '#1d4ed8',
}

const darkVars = {
  '--primary-blue': '#60A5FA',
  '--primary-blue-hover': '#93C5FD',
  '--primary-blue-dark': '#3B82F6',
  '--background-white': '#000000',
  '--header-bg': '#0A0A0A',
  '--secondary-gray': '#0F0F0F',
  '--text-dark': '#F1F5F9',
  '--text-medium': '#CBD5E1',
  '--text-light': '#94A3B8',
  '--green-accent': '#34D399',
  '--green-dark': '#10B981',
  '--border-color': '#1F1F1F',
  '--glass-bg': 'rgba(10, 10, 10, 0.7)',
  '--glass-border': 'rgba(31, 31, 31, 0.5)',
  '--card-bg': '#111111',
  '--hero-gradient-from': 'rgba(96, 165, 250, 0.12)',
  '--hero-gradient-to': 'rgba(52, 211, 153, 0.08)',
  '--footer-bg': '#000000',
  '--contact-btn-shadow': 'rgba(96, 165, 250, 0.25)',
  '--nav-link-color': '#CBD5E1',
  '--nav-link-hover': '#60A5FA',
  '--badge-bg': '#34D399',
  '--badge-shadow': 'rgba(52, 211, 153, 0.25)',
  '--skill-tag-bg': '#1a1a1a',
  '--skill-tag-color': '#cbd5e1',
  '--badge-color': '#60a5fa',
}

function lerpColor(a, b, t) {
  if (a.startsWith('rgba') && b.startsWith('rgba')) {
    const am = a.match(/[\d.]+/g).map(Number)
    const bm = b.match(/[\d.]+/g).map(Number)
    const r = Math.round(am[0] + (bm[0] - am[0]) * t)
    const g = Math.round(am[1] + (bm[1] - am[1]) * t)
    const bl = Math.round(am[2] + (bm[2] - am[2]) * t)
    const al = am[3] + (bm[3] - am[3]) * t
    return `rgba(${r}, ${g}, ${bl}, ${al.toFixed(3)})`
  }
  const ah = a.replace('#', '')
  const bh = b.replace('#', '')
  const ar = parseInt(ah.substring(0, 2), 16)
  const ag = parseInt(ah.substring(2, 4), 16)
  const ab = parseInt(ah.substring(4, 6), 16)
  const br = parseInt(bh.substring(0, 2), 16)
  const bg = parseInt(bh.substring(2, 4), 16)
  const bb = parseInt(bh.substring(4, 6), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bv = Math.round(ab + (bb - ab) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`
}

function setCSSVars(t) {
  const root = document.documentElement
  for (const key of Object.keys(lightVars)) {
    root.style.setProperty(key, lerpColor(lightVars[key], darkVars[key], t))
  }
}

const ThemeContext = createContext({ progress: 0, toggle: () => {}, y: null, trackRange: 0 })
export const useThemeProgress = () => useContext(ThemeContext)

const TRACK_HEIGHT = 140
const THUMB_SIZE = 28

const ThemeProvider = ({ children }) => {
  const [progress, setProgress] = useState(0)
  const y = useMotionValue(0)
  const smoothY = useSpring(y, { stiffness: 400, damping: 40 })
  const appliedRef = useRef(0)

  useEffect(() => {
    const unsubscribe = smoothY.on('change', (v) => {
      const p = Math.max(0, Math.min(v / (TRACK_HEIGHT - THUMB_SIZE), 1))
      if (Math.abs(p - appliedRef.current) > 0.002) {
        appliedRef.current = p
        setCSSVars(p)
        setProgress(p)
      }
    })
    return unsubscribe
  }, [])

  const toggle = useCallback(() => {
    const target = progress < 0.5 ? 1 : 0
    const targetY = target * (TRACK_HEIGHT - THUMB_SIZE)
    y.set(targetY)
    setCSSVars(target)
    setProgress(target)
  }, [progress, y])

  return (
    <ThemeContext.Provider value={{ progress, toggle, y, trackRange: TRACK_HEIGHT - THUMB_SIZE }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
