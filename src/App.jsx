import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Contact from './components/Contact'
import Footer from './components/Footer'
import InteractiveGridBackground from './components/InteractiveGridBackground'
import MagicLoader from './components/MagicLoader'
import ThemeProvider from './components/ThemeProvider'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'

function App() {
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

  return (
    <>
      <ScrollProgress />
      <MagicLoader size={250} particleCount={2} speed={1.2} hueRange={[200, 280]} />
      <ThemeProvider>
      <InteractiveGridBackground
        gridSize={40}
        trailLength={4}
        idleSpeed={0.3}
        idleRandomCount={8}
        fadeIntensity={15}
        glowRadius={25}
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
      </InteractiveGridBackground>
      </ThemeProvider>
    </>
  )
}

export default App
