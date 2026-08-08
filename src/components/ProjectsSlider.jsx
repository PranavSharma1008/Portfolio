import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import flashdropIcon from '../assets/flashdrop-icon.png'
import flashdropScreenshot from '../assets/flashdrop-screenshot.png'
import bloodyIcon from '../assets/bloody-icon.png'
import bloodoceanIcon from '../assets/bloodocean-icon.png'
import portfolioScreenshot from '../assets/portfolio-screenshot.png'
import campsfixScreenshot from '../assets/campsfix-screenshot.png'

const projects = [
  {
    title: 'FlashDrop',
    description: 'A direct IP-to-IP file sharing prototype inspired by SHAREit, built with Flask + Python TCP sockets + browser UI.',
    tech: ['Flask', 'Python', 'TCP Sockets', 'Browser UI'],
    image: flashdropScreenshot,
    github: 'https://github.com/PranavSharma1008/FlashDrop'
  },
  {
    title: 'BloodOcean',
    description: 'A full-stack blood donation platform connecting emergency patients with nearby donors in real time via WebSockets and geolocation.',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'JWT', 'Leaflet'],
    image: bloodoceanIcon,
    github: 'https://github.com/PranavSharma1008/BloodOcean'
  },
  {
    title: 'Portfolio Website',
    description: 'A personal portfolio website built with React and Framer Motion featuring smooth animations and a particle canvas background.',
    tech: ['React', 'Vite', 'Framer Motion', 'JavaScript', 'CSS'],
    image: portfolioScreenshot,
    github: 'https://github.com/PranavSharma1008/Portfolio',
    live: 'https://pranavsharmaportfolio.netlify.app/'
  },
  {
    title: 'CampsFix',
    description: 'A modern full-stack campus management platform for issue reporting and lost & found workflows, built with Spring Boot + Java 17 + React + MongoDB.',
    tech: ['Spring Boot', 'Java 17', 'React', 'MongoDB', 'Tailwind CSS'],
    image: campsfixScreenshot,
    github: 'https://github.com/PranavSharma1008/CampusFix'
  }
]

const ProjectsSlider = () => {
  const [width, setWidth] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const containerRef = useRef(null)
  const sliderRef = useRef(null)

  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState(false)

  const duplicatedItems = [...projects, ...projects, ...projects]

  useEffect(() => {
    const calculateWidth = () => {
      const cardW = 360
      const gap = 40
      const calculatedWidth = (cardW + gap) * projects.length
      setWidth(calculatedWidth)
    }
    calculateWidth()
    window.addEventListener('resize', calculateWidth)
    return () => window.removeEventListener('resize', calculateWidth)
  }, [])

  useEffect(() => {
    if (width <= 0) return
    if (isHovered || hoveredIndex !== null) return

    const SPEED = 1.5
    let animationId

    const tick = () => {
      const newX = x.get() - SPEED
      if (newX <= -width) {
        x.set(newX + width)
      } else {
        x.set(newX)
      }
      animationId = requestAnimationFrame(tick)
    }

    animationId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationId)
  }, [width, isHovered, hoveredIndex, x])

  return (
    <section className="projects-slider-section section-padding" id="projects">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Projects
        </motion.h2>

        <div
          ref={sliderRef}
          className="projects-slider-wrapper"
          style={{ perspective: '1000px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            ref={containerRef}
            className="projects-slider-track"
            style={{ x, gap: '40px', transformStyle: 'preserve-3d' }}
          >
            {duplicatedItems.map((project, index) => {
              const originalIndex = index % projects.length
              const isSelected = hoveredIndex === originalIndex

              return (
                <motion.div
                  key={`${project.title}-${index}`}
                  className={`slider-card ${isSelected ? 'selected' : ''}`}
                  style={{ transformStyle: 'preserve-3d', width: '360px', maxWidth: '90vw', minHeight: '230px' }}
                  animate={{
                    rotateY: isSelected ? 0 : 20,
                    scale: isSelected ? 1.05 : 1,
                    z: isSelected ? 120 : 60,
                  }}
                  transition={{ type: 'spring', mass: 3, stiffness: 400, damping: 50 }}
                  onMouseEnter={() => setHoveredIndex(originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(isSelected ? null : originalIndex)}
                >
                  <div className="slider-card-inner">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="slider-card-image"
                    />
                    <div className={`slider-card-overlay ${isSelected ? 'active' : ''}`}>
                      <h3 className="slider-card-title">{project.title}</h3>
                      <p className="slider-card-desc">{project.description}</p>
                      <div className="slider-card-tech">
                        {project.tech.map((t, i) => (
                          <span key={i} className="slider-tech-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="slider-card-label">{project.title}</div>
                  <div className="slider-card-links">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="slider-card-link" title="GitHub">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a href={project.live || project.github} target="_blank" rel="noopener noreferrer" className="slider-card-link" title="Live">
                      <svg viewBox="0 0 48 48" width="24" height="24">
                        <defs>
                          <linearGradient id={`ra-${index}`} x1="3.217" y1="15" x2="44.781" y2="15" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#d93025"/>
                            <stop offset="1" stopColor="#ea4335"/>
                          </linearGradient>
                          <linearGradient id={`ya-${index}`} x1="20.722" y1="47.679" x2="41.504" y2="11.684" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#fcc934"/>
                            <stop offset="1" stopColor="#fbbc04"/>
                          </linearGradient>
                          <linearGradient id={`ga-${index}`} x1="26.598" y1="46.502" x2="5.816" y2="10.506" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#1e8e3e"/>
                            <stop offset="1" stopColor="#34a853"/>
                          </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="12" fill="#fff"/>
                        <path d="M24,12H44.781a24,24,0,0,0-41.564,0L13.608,30a12,12,0,0,1,10.392-18Z" fill={`url(#ra-${index})`}/>
                        <circle cx="24" cy="24" r="9.5" fill="#1a73e8"/>
                        <path d="M34.391,30,24,48A24,24,0,0,0,44.78,12H24l0,0a12,12,0,0,1,10.391,18Z" fill={`url(#ya-${index})`}/>
                        <path d="M13.609,30,3.218,12A24,24,0,0,0,24,48L34.393,30a12,12,0,0,1-20.784,0Z" fill={`url(#ga-${index})`}/>
                      </svg>
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ProjectsSlider
