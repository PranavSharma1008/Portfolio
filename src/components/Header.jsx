import { useState, useEffect } from 'react'

const navLinks = [
  { id: 'home', label: 'home', cmd: 'cd ~' },
  { id: 'experience', label: 'experience', cmd: 'cat experience.md' },
  { id: 'projects', label: 'projects', cmd: 'ls -la projects/' },
  { id: 'achievements', label: 'achievements', cmd: 'cat awards.txt' },
  { id: 'contact', label: 'contact', cmd: 'mail -s "Hello" pranav@email.com' }
]

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const Header = ({ activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.documentElement.classList.remove('light')
    } else {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 64
      const offsetTop = element.offsetTop - headerHeight
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="header">
      <nav className="navbar container">
        <div className="nav-brand">
          <span className="brand-prefix">PranavSharma@portfolio</span>
          <span className="brand-text">:~$</span>
        </div>

        <button
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger"></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollToSection(link.id)}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              >
                <span className="nav-prefix">{activeSection === link.id ? '>' : ' '}</span>
                {link.label}
              </button>
            </li>
          ))}
          <li className="mobile-only">
            <button className="theme-toggle-mobile" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </li>
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>online</span>
          </div>
          <span className="nav-time">{currentTime}</span>
        </div>
      </nav>
    </header>
  )
}

export default Header
