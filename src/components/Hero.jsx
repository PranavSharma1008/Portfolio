import { useState } from 'react'
import { motion } from 'framer-motion'
import { TypingText } from './TypingText'
import ScrollReveal from './ScrollReveal'
import ResumeModal from './ResumeModal'
import animatedAvatar from '../assets/animated.png'

const Hero = () => {
  const [isResumeOpen, setIsResumeOpen] = useState(false)

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
            I'm a <strong>Software Engineer</strong> specializing in building robust backend systems and scalable full-stack applications. Proficient in <strong>DSA, OOPS, Computer Networks, OS, and DBMS</strong>.
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
          <div className="terminal-card">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-title">profile.sh — bash</div>
            <div className="terminal-body">
              <motion.div
                className="terminal-avatar"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65, duration: 0.4, ease: 'easeOut' }}
              >
                <img src={animatedAvatar} alt="Pranav Sharma" />
              </motion.div>
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
                <span className="status-dot"></span>
                <span>Available for opportunities</span>
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
