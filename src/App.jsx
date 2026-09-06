import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import TerminalLoader from './components/TerminalLoader'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'experience', 'projects', 'achievements', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId)
        if (section) {
          const offsetTop = section.offsetTop
          const offsetHeight = section.offsetHeight
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const cursorGlow = document.createElement('div')
    cursorGlow.className = 'cursor-glow'
    document.body.appendChild(cursorGlow)

    const handleMouseMove = (e) => {
      cursorGlow.style.left = e.clientX + 'px'
      cursorGlow.style.top = e.clientY + 'px'
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeChild(cursorGlow)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <TerminalLoader key="terminal-loader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          key="portfolio-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Header activeSection={activeSection} />
          <main>
            <Hero />
            <Experience />
            <Projects />
            <Achievements />
            <Contact />
          </main>
          <Footer />
          <ScrollToTop />
        </motion.div>
      )}
    </>
  )
}

export default App
