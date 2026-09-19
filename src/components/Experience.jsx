import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

import cBadge from '../assets/skills/c.svg'
import cppBadge from '../assets/skills/cpp.svg'
import jsBadge from '../assets/skills/javascript.svg'
import javaBadge from '../assets/skills/java.svg'
import vercelBadge from '../assets/skills/vercel.svg'
import netlifyBadge from '../assets/skills/netlify.svg'
import renderBadge from '../assets/skills/render.svg'
import nodejsBadge from '../assets/skills/nodejs.svg'
import mysqlBadge from '../assets/skills/mysql.svg'
import mongodbBadge from '../assets/skills/mongodb.svg'
import canvaBadge from '../assets/skills/canva.svg'
import gitBadge from '../assets/skills/git.svg'
import githubBadge from '../assets/skills/github.svg'

const skillBadges = [
  { name: 'C', src: cBadge },
  { name: 'C++', src: cppBadge },
  { name: 'JavaScript', src: jsBadge },
  { name: 'Java', src: javaBadge },
  { name: 'Vercel', src: vercelBadge },
  { name: 'Netlify', src: netlifyBadge },
  { name: 'Render', src: renderBadge },
  { name: 'Node.js', src: nodejsBadge },
  { name: 'MySQL', src: mysqlBadge },
  { name: 'MongoDB', src: mongodbBadge },
  { name: 'Canva', src: canvaBadge },
  { name: 'Git', src: gitBadge },
  { name: 'GitHub', src: githubBadge },
]

const csSkills = [
  'DSA', 'OOPS', 'System Design', 'Computer Networks',
  'Operating Systems', 'DBMS', 'Problem Solving'
]

const Experience = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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
                {skillBadges.map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    className="tech-badge-item"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.04 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                  >
                    <img
                      src={badge.src}
                      alt={badge.name}
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
