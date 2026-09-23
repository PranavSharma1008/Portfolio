import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  defaultSkillBadges,
  syncTechStackWithGitHub,
  CACHE_KEY as TECH_STACK_CACHE_KEY
} from '../lib/githubTechStackSync'

const csSkills = [
  'DSA', 'OOPS', 'System Design', 'Computer Networks',
  'Operating Systems', 'DBMS', 'Problem Solving'
]

const Experience = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [techBadges, setTechBadges] = useState(defaultSkillBadges)

  useEffect(() => {
    let isMounted = true

    // 1. Hydrate from localStorage immediately
    try {
      const cached = localStorage.getItem(TECH_STACK_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed?.badges) && parsed.badges.length > 0) {
          setTechBadges(parsed.badges)
        }
      }
    } catch (e) {}

    // 2. Listen for centralized background auto-sync updates
    const handleSync = (e) => {
      if (isMounted && Array.isArray(e.detail) && e.detail.length > 0) {
        setTechBadges(e.detail)
      }
    }
    window.addEventListener('tech-stack-synced', handleSync)

    // 3. Automated live sync from GitHub Profile README
    syncTechStackWithGitHub(true)
      .then((res) => {
        if (isMounted && res && Array.isArray(res.badges) && res.badges.length > 0) {
          setTechBadges(res.badges)
        }
      })
      .catch((err) => {
        console.warn('Tech stack live sync notice:', err)
      })

    return () => {
      isMounted = false
      window.removeEventListener('tech-stack-synced', handleSync)
    }
  }, [])

  return (
    <section className="experience section-padding" id="experience">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Experience & Skills
        </motion.h2>

        <motion.div
          ref={ref}
          className="experience-content"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="terminal-window"
            whileHover={{ y: -4, boxShadow: '0 0 40px rgba(0, 255, 157, 0.1)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="terminal-window-header">
              <span className="terminal-window-dot red"></span>
              <span className="terminal-window-dot yellow"></span>
              <span className="terminal-window-dot green"></span>
              <span className="terminal-window-title">skills_and_experience.sh — bash</span>
            </div>
            <div className="terminal-window-body">
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">cat profile.json</span>
              </div>
              <div className="terminal-line output">
                <span className="comment">{'{'}</span><br />
                <span className="highlight">  "role"</span>: <span className="output">"Software Engineer"</span>,<br />
                <span className="highlight">  "status"</span>: <span className="output">"Open to Work"</span>,<br />
                <span className="highlight">  "education"</span>: <span className="output">"Recent Graduate"</span>,<br />
                <span className="highlight">  "focus"</span>: <span className="output">"Backend & Full-Stack Systems"</span>,<br />
                <span className="comment">{'}'}</span>
              </div>

              {/* Technologies & Tools from Screenshot */}
              <div className="terminal-line" style={{ marginTop: '20px' }}>
                <span className="prompt">$</span>
                <span className="command">./list-technologies.sh --visual</span>
              </div>
              <div className="tech-badges-container">
                {techBadges.map((badge, index) => (
                  <motion.div
                    key={badge.name || badge.src || index}
                    className="tech-badge-item"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.04 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                  >
                    <img
                      src={badge.src || badge.url}
                      alt={badge.name || 'tech badge'}
                      className="tech-badge-img"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Core CS Fundamentals */}
              <div className="terminal-line" style={{ marginTop: '20px' }}>
                <span className="prompt">$</span>
                <span className="command">./run-core-skills.sh</span>
              </div>
              <div className="skills-grid">
                {csSkills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>

              <div className="terminal-line output" style={{ marginTop: '20px' }}>
                <span className="comment">// Proficient in full-stack architectures, high-performance algorithms, and modern deployment toolchains.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience
