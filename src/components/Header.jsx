import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import SparkleNavbar from './SparkleNavbar'
import { useThemeProgress } from './ThemeProvider'

const badges = [
  'Open to Work',
  'Software Engineer'
]

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' }
]

const nameList = [
  { text: 'प्रणव शर्मा', lang: 'Hindi' },
  { text: 'Pranav Sharma', lang: 'English' },
  { text: 'ਪ੍ਰਣਵ ਸ਼ਰਮਾ', lang: 'Punjabi' },
]

const Header = ({ activeSection }) => {
  const { progress, toggle, y, trackRange } = useThemeProgress()
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0)
  const [nameIndex, setNameIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const sliderX = useMotionValue(0)
  const sliderTrackRef = useRef(null)

  useEffect(() => {
    const nameInterval = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % nameList.length)
    }, 2500)
    return () => clearInterval(nameInterval)
  }, [])

  useEffect(() => {
    const track = sliderTrackRef.current
    if (!track) return
    const maxX = track.offsetWidth - 32
    sliderX.set(progress * maxX)
  }, [progress, sliderX])

  useEffect(() => {
    const badgeInterval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % badges.length)
    }, 2000)
    
    return () => {
      clearInterval(badgeInterval)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 72
      const offsetTop = element.offsetTop - headerHeight
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const handleNavChange = (index) => {
    const sectionId = navLinks[index].id
    scrollToSection(sectionId)
  }

  const activeIndex = navLinks.findIndex(l => l.id === activeSection)

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar container">
        <div className="nav-brand">
          <AnimatePresence mode="wait">
            <motion.span
              key={nameIndex}
              className="brand-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {nameList[nameIndex].text}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          <span className="hamburger"></span>
        </button>

        <div className="sparkle-nav-desktop">
          <SparkleNavbar
            items={navLinks.map(l => l.label)}
            rightItems={[]}
            color="#000000"
            onNavigate={handleNavChange}
            activeIndex={activeIndex}
          />
          <div className="theme-slider-nav">
            <svg className="slider-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <div
              className="slider-track"
              ref={sliderTrackRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const w = rect.width
                const thumbW = 32
                const clickX = e.clientX - rect.left
                const pct = Math.max(0, Math.min(1, clickX / w))
                const newX = pct * (w - thumbW)
                sliderX.set(newX)
                if (y) y.set(pct * trackRange)
              }}
            >
              <div className="slider-fill" style={{ width: `${progress * 100}%` }} />
              <motion.div
                className="slider-thumb"
                drag="x"
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={{ left: 0, right: 48 }}
                style={{ x: sliderX, y: '-50%' }}
                onDrag={(_, info) => {
                  const track = sliderTrackRef.current
                  if (!track || !y) return
                  const w = track.offsetWidth
                  const thumbW = 32
                  const maxX = w - thumbW
                  const newX = Math.max(0, Math.min(maxX, sliderX.get() + info.delta.x))
                  sliderX.set(newX)
                  y.set((newX / maxX) * trackRange)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="slider-thumb-inner" />
              </motion.div>
            </div>
            <svg className="slider-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
        </div>

        <ul id="mobile-nav-menu" className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id) }}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div
                    className="nav-underline"
                    layoutId="nav-underline"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
          <li className="mobile-theme-toggle-item">
            <button className="mobile-theme-btn" onClick={toggle} aria-label="Toggle Theme">
              {progress > 0.5 ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </li>
        </ul>
      </nav>
      
      <motion.div 
        className="fresher-badge"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.03 }}
      >
        <span className="badge-dot"></span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentBadgeIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {badges[currentBadgeIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </header>
  )
}

export default Header
