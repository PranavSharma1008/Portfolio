import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const skills = [
  'DSA', 'OOPS', 'Computer Networks',
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
          Experience
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
              <span className="terminal-window-title">experience.sh</span>
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
                <span className="highlight">  "focus"</span>: <span className="output">"Backend & Full-Stack"</span>,<br />
                <span className="comment">{'}'}</span>
              </div>
              <div className="terminal-line" style={{ marginTop: '16px' }}>
                <span className="prompt">$</span>
                <span className="command">./run-skills.sh</span>
              </div>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
              <div className="terminal-line output" style={{ marginTop: '16px' }}>
                <span className="comment">// Strong foundation in core CS concepts with hands-on project experience.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience
