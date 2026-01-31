import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const names = [
  'PRANAV SHARMA',
  'प्रणव शर्मा',
  'ਪ੍ਰਣਵ ਸ਼ਰਮਾ'
]

const badges = [
  'Open to Work',
  'Fresher'
]

const Header = ({ activeSection }) => {
  const [currentNameIndex, setCurrentNameIndex] = useState(0)
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const nameInterval = setInterval(() => {
      setCurrentNameIndex((prev) => (prev + 1) % names.length)
    }, 2000)
    
    const badgeInterval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % badges.length)
    }, 2000)
    
    return () => {
      clearInterval(nameInterval)
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

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' }
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 72
      const offsetTop = element.offsetTop - headerHeight
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar container">
        <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentNameIndex}
              className="name-rotate"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {names[currentNameIndex]}
            </motion.span>
          </AnimatePresence>
        </a>

        <button
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="hamburger"></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
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
        </ul>
      </nav>
      
      {/* Badge - Fixed below header on right */}
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
