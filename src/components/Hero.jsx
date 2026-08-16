import { motion } from 'framer-motion'
import { TypingText } from './TypingText'
import ScrollReveal from './ScrollReveal'
import animatedAvatar from '../assets/animated.png'

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <TypingText as="p" className="hero-greeting" delay={0.2} duration={1.0}>
            Hello, World!
          </TypingText>

          <TypingText as="h1" className="hero-name" delay={1.2} duration={1.6}>
            Pranav <span className="accent">Sharma</span>
          </TypingText>

          <ScrollReveal
            textClassName="hero-description"
            align="left"
            staggerDelay={0.02}
            threshold={0.3}
            duration={0.6}
          >
            I'm a <strong>Software Engineer</strong> specializing in building robust backend systems and scalable full-stack applications. Proficient in <strong>DSA, OOPS, Computer Networks, OS, and DBMS</strong>.
          </ScrollReveal>

          <motion.div
            className="hero-links"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <a href="#projects" className="cmd-btn cmd-btn-primary">
              <span className="btn-icon">$</span>
              ./view-projects.sh
            </a>
            <a href="#contact" className="cmd-btn">
              <span className="btn-icon">#</span>
              ./contact-me.sh
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="terminal-card">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-title">profile.sh — bash</div>
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
                <span className="status-dot"></span>
                <span>Available for opportunities</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
