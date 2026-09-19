import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import flashdropScreenshot from '../assets/flashdrop-screenshot.png'
import bloodoceanIcon from '../assets/bloodocean-icon.png'
import portfolioScreenshot from '../assets/portfolio-screenshot.png'
import campsfixScreenshot from '../assets/campsfix-screenshot.png'
import daytaskScreenshot from '../assets/daytask-screenshot.png'

const projects = [
  {
    id: 'flashdrop',
    index: '01',
    cmd: 'flashdrop.py',
    daemon: 'FLASHDROP_DAEMON',
    status: 'RUNNING',
    port: 'PORT: 8080 (TCP)',
    title: 'FlashDrop',
    category: 'System & Networking',
    headline: 'High-Speed Local P2P File Transfer Engine',
    description:
      'Direct IP-to-IP file sharing prototype inspired by SHAREit. Built with Flask + Python TCP sockets + browser UI for high-speed local network transfer without third-party cloud dependencies.',
    architecture: 'Flask • Python TCP Sockets • Web UI',
    metrics: [
      { label: 'PROTOCOL', val: 'Raw TCP' },
      { label: 'TOPOLOGY', val: 'P2P Direct' },
      { label: 'LATENCY', val: '< 2ms' }
    ],
    tech: ['Flask', 'Python', 'TCP Sockets', 'Browser UI', 'Networking'],
    image: flashdropScreenshot,
    github: 'https://github.com/PranavSharma1008/FlashDrop'
  },
  {
    id: 'bloodocean',
    index: '02',
    cmd: 'bloodocean.ts',
    daemon: 'BLOODOCEAN_SERVICE',
    status: 'ONLINE',
    port: 'WS: CONNECTED',
    title: 'BloodOcean',
    category: 'Full-Stack Emergency App',
    headline: 'Real-Time Geo-Dispatched Blood Donation Network',
    description:
      'Full-stack emergency blood donation platform connecting urgent patients with verified nearby donors in real time via WebSockets and geolocation mapping.',
    architecture: 'React • Node.js • Socket.IO • MongoDB • Leaflet',
    metrics: [
      { label: 'SYNC', val: 'WebSockets' },
      { label: 'SECURITY', val: 'JWT Auth' },
      { label: 'MAPPING', val: 'Leaflet GPS' }
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'JWT', 'Leaflet'],
    image: bloodoceanIcon,
    github: 'https://github.com/PranavSharma1008/BloodOcean'
  },
  {
    id: 'portfolio',
    index: '03',
    cmd: 'portfolio.jsx',
    daemon: 'PORTFOLIO_V2',
    status: 'ACTIVE',
    port: 'PORT: 3000 (HTTPS)',
    title: 'Portfolio Website',
    category: 'Frontend & Creative Dev',
    headline: 'Interactive Cyberpunk & Terminal Developer Portfolio',
    description:
      'Personal portfolio website engineered with React and Framer Motion featuring smooth animations, cyber micro-interactions, dark terminal aesthetics, and live GitHub/LeetCode data pipelines.',
    architecture: 'React 18 • Vite • Framer Motion • JetBrains Mono',
    metrics: [
      { label: 'PERF', val: '100 Score' },
      { label: 'FRAMEWORK', val: 'React 18' },
      { label: 'STYLES', val: 'Custom CSS' }
    ],
    tech: ['React', 'Vite', 'Framer Motion', 'JavaScript', 'CSS3'],
    image: portfolioScreenshot,
    github: 'https://github.com/PranavSharma1008/Portfolio',
    live: 'https://pranavsharmaportfolio.netlify.app/'
  },
  {
    id: 'campsfix',
    index: '04',
    cmd: 'campsfix.java',
    daemon: 'CAMPSFIX_BACKEND',
    status: 'STABLE',
    port: 'JVM: 17 ACTIVE',
    title: 'CampsFix',
    category: 'Enterprise Campus Suite',
    headline: 'Full-Stack Campus Incident & Lost & Found Hub',
    description:
      'Modern full-stack campus management platform for automated issue reporting, administrative triage, and campus lost & found workflows built with robust enterprise architecture.',
    architecture: 'Spring Boot • Java 17 • React • MongoDB • Tailwind',
    metrics: [
      { label: 'STACK', val: 'Spring Boot 3' },
      { label: 'RUNTIME', val: 'Java 17 JDK' },
      { label: 'DATABASE', val: 'MongoDB' }
    ],
    tech: ['Spring Boot', 'Java 17', 'React', 'MongoDB', 'Tailwind CSS'],
    image: campsfixScreenshot,
    github: 'https://github.com/PranavSharma1008/CampusFix'
  },
  {
    id: 'daytask',
    index: '05',
    cmd: 'daytask.ts',
    daemon: 'DAYTASK_TRACKER',
    status: 'DEPLOYED',
    port: 'PWA: READY',
    title: 'DayTask — Daily Task Tracker',
    category: 'Productivity & Utility',
    headline: 'Cross-Device High-Alert Task & Priority Manager',
    description:
      'A modern cross-device daily task tracker featuring custom high-alert reminder thresholds, dynamic priority escalation, and instant real-time synchronization with zero external dependencies.',
    architecture: 'JavaScript • Node.js • REST API • localStorage',
    metrics: [
      { label: 'STORAGE', val: 'Local + Cloud' },
      { label: 'DEP', val: 'Zero Bloat' },
      { label: 'ALERT', val: 'Dynamic SLA' }
    ],
    tech: ['JavaScript', 'Node.js', 'HTML5', 'CSS3', 'REST API', 'localStorage'],
    image: daytaskScreenshot,
    github: 'https://github.com/PranavSharma1008/Daily_Task_Tracker',
    live: 'https://pranavdaytask.netlify.app/'
  }
]

const ProjectsTerminal = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const activeProject = projects[selectedIndex]

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % projects.length)
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  // Keyboard navigation when user presses Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % projects.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev - 1 + projects.length) % projects.length)
      }
    }

    const sectionEl = document.getElementById('projects')
    if (!sectionEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          window.addEventListener('keydown', handleKeyDown)
        } else {
          window.removeEventListener('keydown', handleKeyDown)
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(sectionEl)
    return () => {
      observer.disconnect()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <section className="projects section-padding" id="projects">
      <div className="container">
        <motion.div
          className="projects-header-meta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 className="section-title">Projects</motion.h2>
          <div className="projects-cli-badge">
            <span className="cli-badge-dot"></span>
            <span className="cli-badge-text">DAEMON STATUS: 5/5 ONLINE</span>
          </div>
        </motion.div>

        {/* Master Hacker Terminal Frame */}
        <motion.div
          className="terminal-window projects-terminal-frame"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Terminal Window Header Bar */}
          <div className="terminal-window-header projects-term-header">
            <div className="term-dots-group">
              <span className="terminal-window-dot red"></span>
              <span className="terminal-window-dot yellow"></span>
              <span className="terminal-window-dot green"></span>
            </div>
            <div className="terminal-window-title projects-term-title">
              ~/projects/showcase.sh — bash — 80×28
            </div>
            <div className="term-header-controls">
              <div className="term-nav-buttons">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="term-nav-btn"
                  title="Previous project (←)"
                  aria-label="Previous Project"
                >
                  ◀
                </button>
                <span className="term-counter">
                  {activeProject.index}/0{projects.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="term-nav-btn"
                  title="Next project (→)"
                  aria-label="Next Project"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Shell Path Bar */}
          <div className="projects-term-prompt-bar">
            <span className="prompt-user">pranav@workstation</span>
            <span className="prompt-sep">:</span>
            <span className="prompt-path">~/projects/{activeProject.id}</span>
            <span className="prompt-symbol">$</span>
            <span className="prompt-cmd">./run-inspection.sh --verbose</span>
            <span className="term-cursor-blink">▋</span>
          </div>

          {/* Terminal Console Interior: Left Process List + Right Project Dossier */}
          <div className="projects-terminal-body">
            {/* Left Sidebar: Active Process Daemons */}
            <div className="projects-proc-sidebar">
              <div className="proc-sidebar-header">
                <span className="proc-title">ACTIVE_DAEMONS</span>
                <span className="proc-count">[5 TOTAL]</span>
              </div>

              <div className="proc-list" role="tablist">
                {projects.map((proj, idx) => {
                  const isSelected = selectedIndex === idx
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className={`proc-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="procHighlight"
                          className="proc-active-indicator"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}

                      <div className="proc-item-content">
                        <div className="proc-item-top">
                          <span className="proc-item-caret">{isSelected ? '➜' : ' '}</span>
                          <span className="proc-item-index">[{proj.index}]</span>
                          <span className="proc-item-cmd">{proj.cmd}</span>
                        </div>
                        <div className="proc-item-meta">
                          <span className={`proc-status-dot ${proj.status.toLowerCase()}`} />
                          <span className="proc-status-text">{proj.status}</span>
                          <span className="proc-port-text">{proj.port}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="proc-keyboard-hint">
                <span>Navigate: [ ← / → keys ]</span>
              </div>
            </div>

            {/* Right Panel: Project Dossier Display */}
            <div className="projects-dossier-pane">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  className="dossier-card"
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Top Bar of Dossier */}
                  <div className="dossier-top-bar">
                    <div className="dossier-headings">
                      <span className="dossier-category">
                        // {activeProject.category}
                      </span>
                      <h3 className="dossier-title">{activeProject.title}</h3>
                    </div>
                    <div className="dossier-status-badge">
                      <span className="badge-pulse-dot"></span>
                      <span>{activeProject.daemon}</span>
                    </div>
                  </div>

                  {/* Main Grid: Visual Frame + Specs */}
                  <div className="dossier-grid">
                    {/* Visual Media Viewport */}
                    <div className="dossier-media-viewport">
                      <div className="viewport-top-strip">
                        <span className="viewport-addr">
                          https://{activeProject.id}.pranavsharma.dev
                        </span>
                        <span className="viewport-tag">PREVIEW_FRAME</span>
                      </div>
                      <div className="viewport-image-wrapper">
                        <img
                          src={activeProject.image}
                          alt={activeProject.title}
                          className="viewport-img"
                        />
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="dossier-specs-col">
                      <div className="dossier-headline">
                        &gt; {activeProject.headline}
                      </div>

                      <p className="dossier-desc">
                        {activeProject.description}
                      </p>

                      {/* Technical Architecture Specs Box */}
                      <div className="dossier-metrics-box">
                        <div className="metrics-box-header">SYSTEM METRICS &amp; ARCHITECTURE</div>
                        <div className="metrics-row">
                          {activeProject.metrics.map((m, i) => (
                            <div key={i} className="metric-chip">
                              <span className="m-label">{m.label}:</span>
                              <span className="m-val">{m.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tech Stack Flags */}
                      <div className="dossier-tech-group">
                        <div className="tech-group-label">DEPENDENCIES &amp; STACK:</div>
                        <div className="dossier-tech-tags">
                          {activeProject.tech.map((tag, i) => (
                            <span key={i} className="dossier-tag">
                              <span className="tag-prefix">#</span>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Executable Terminal Action Buttons */}
                      <div className="dossier-actions">
                        {activeProject.live && (
                          <a
                            href={activeProject.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cmd-btn cmd-btn-primary dossier-btn"
                            title="Open live production deployment"
                          >
                            <span className="btn-icon">🚀</span>
                            ./launch-live.sh
                          </a>
                        )}

                        <a
                          href={activeProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cmd-btn dossier-btn"
                          title="Open GitHub repository"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="16"
                            height="16"
                            className="btn-icon"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          ./view-source.sh
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsTerminal
