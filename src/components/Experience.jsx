import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const Experience = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const skills = [
    'DSA',
    'OOPS',
    'Computer Networks',
    'Operating Systems',
    'DBMS',
    'Problem Solving'
  ]

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
            className="experience-card"
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="experience-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <div className="experience-details">
              <h3>Software Engineering Fresher</h3>
              <p className="experience-subtitle">Recent Graduate | Ready to Contribute</p>
              <p className="experience-description">
                As a fresh graduate, I bring a strong academic foundation in core computer science concepts.
                I'm eager to apply my knowledge of DSA, OOPS, and system design principles to real-world
                software development challenges. Currently seeking opportunities to grow and contribute
                to innovative engineering teams.
              </p>
              <div className="skills-tags">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="skill-tag"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: '#2563EB', color: '#2563EB' }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience
