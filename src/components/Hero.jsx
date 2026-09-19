import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TypingText } from './TypingText'
import ScrollReveal from './ScrollReveal'
import ResumeModal from './ResumeModal'
import animatedAvatar from '../assets/animated.png'

const Hero = () => {
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [scanKey, setScanKey] = useState(0)
  const [isScanning, setIsScanning] = useState(true)
  const [scanCompleted, setScanCompleted] = useState(false)

  // Trigger top-to-bottom hacker scanning sequence
  const triggerScan = () => {
    setIsScanning(true)
    setScanCompleted(false)
    setScanKey((prev) => prev + 1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false)
      setScanCompleted(true)
    }, 2900)
    return () => clearTimeout(timer)
  }, [scanKey])

  return (
    <section className="hero" id="home">
      {/* Background Tech Dot-Grid & Ambient Glow (Option 1) */}
      <div className="hero-bg-elements" aria-hidden="true">
        <div className="hero-grid-pattern" />
        <div className="hero-glow-orb hero-glow-emerald" />
        <div className="hero-glow-orb hero-glow-cyan" />
      </div>

      <div className="container hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <TypingText as="p" className="hero-greeting" delay={0.15} duration={0.45}>
            Hello, World!
          </TypingText>

          <TypingText as="h1" className="hero-name" delay={0.4} duration={0.8}>
            Pranav <span className="accent">Sharma</span>
          </TypingText>

          <ScrollReveal
            textClassName="hero-description"
            align="left"
            staggerDelay={0.02}
            threshold={0.2}
            duration={0.6}
          >
            I'm a <strong>Software Engineer</strong> specializing in building robust backend systems and scalable full-stack applications. Proficient in <strong>DSA, OOPS, System Design, Computer Networks, OS, and DBMS</strong>.
          </ScrollReveal>

          <motion.div
            className="hero-links"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4, ease: 'easeOut' }}
          >
            <a href="#projects" className="cmd-btn cmd-btn-primary">
              <span className="btn-icon">$</span>
              ./view-projects.sh
            </a>
            <a href="#contact" className="cmd-btn">
              <span className="btn-icon">#</span>
              ./contact-me.sh
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="cmd-btn"
              onClick={(e) => {
                e.preventDefault()
                setIsResumeOpen(true)
              }}
              title="View or download resume"
            >
              <span className="btn-icon">~</span>
              ./view-resume.sh
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className={`terminal-card ${isScanning ? 'scan-active' : ''} ${scanCompleted ? 'scan-complete' : ''}`}
            key={`terminal-card-${scanKey}`}
            onClick={triggerScan}
            title="Click to replay hacker scan animation"
          >
            {/* Terminal Window Header Bar */}
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-title">profile.sh — bash</div>

            {/* Hacker Scan Container */}
            <div className="terminal-scan-area">
              {/* Background Phosphor Cyber Scanlines */}
              <div className="terminal-scanlines-bg" aria-hidden="true" />

              {/* Moving Hacker Green Laser Bar */}
              {isScanning && (
                <div className="hacker-scan-bar" aria-hidden="true">
                  <div className="hacker-bar-trail" />
                  <div className="hacker-bar-laser">
                    <span className="hacker-bar-tag">SYS.SCAN</span>
                  </div>
                  <div className="hacker-bar-glow" />
                </div>
              )}

              {/* Profile Details Revealed in Direct Alignment with the Moving Bar */}
              <div className={`terminal-revealed-content ${isScanning ? 'is-scanning' : 'is-scanned'}`}>
                <div className="terminal-body">
                  <div className="terminal-avatar">
                    <img src={animatedAvatar} alt="Pranav Sharma" />
                  </div>
                  <div className="terminal-name">Pranav Sharma</div>
                  <div className="terminal-role">Software Engineer</div>
                  <div className="terminal-info">
                    <div className="terminal-info-row">
                      <span className="info-label">email:</span>
                      <span className="info-value">pranav2410991479@gmail.com</span>
                    </div>
                    <div className="terminal-info-row">
                      <span className="info-label">phone:</span>
                      <span className="info-value">+91 9317290976</span>
                    </div>
                    <div className="terminal-info-row">
                      <span className="info-label">location:</span>
                      <span className="info-value">India</span>
                    </div>
                  </div>
                  <div className="terminal-status">
                    <span>Available for opportunities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </section>
  )
}

export default Hero
