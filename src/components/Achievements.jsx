import { motion } from 'framer-motion'

const achievements = [
  {
    title: 'Professional Typing Certification',
    description: 'Achieved 80+ WPM typing speed with 98% accuracy. Certified in touch typing for enhanced productivity and efficiency.',
    year: '2024'
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Completed comprehensive DSA course covering arrays, linked lists, trees, graphs, dynamic programming, and algorithm design.',
    year: '2024'
  },
  {
    title: 'Database Management Systems',
    description: 'Completed certification in DBMS covering SQL, normalization, transaction management, and database design principles.',
    year: '2024'
  },
  {
    title: 'Computer Networks Fundamentals',
    description: 'Certified in networking concepts including OSI model, TCP/IP, routing protocols, and network security basics.',
    year: '2023'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const Achievements = () => {
  return (
    <section className="achievements section-padding" id="achievements">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Achievements & Certifications
        </motion.h2>

        <motion.div
          className="achievements-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {achievements.map((achievement, index) => (
            <motion.article
              key={index}
              className="achievement-card"
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="achievement-badge"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </motion.div>
              
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-description">{achievement.description}</p>
              
              <motion.span 
                className="achievement-date"
                whileHover={{ scale: 1.05 }}
              >
                {achievement.year}
              </motion.span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Achievements
