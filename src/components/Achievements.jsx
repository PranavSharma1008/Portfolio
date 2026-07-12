import { motion } from 'framer-motion'

const githubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const leetcodeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
)

const monkeyTypeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 5 5.8 4.8 5 5C3.5 5.5 2.5 7 2.5 9C2.5 9.5 2.7 10 3 10.3C2.4 11 2 11.9 2 13C2 15.2 3.8 17 6 17H8C8 18.7 9.3 20 11 20H13C14.7 20 16 18.7 16 17H18C20.2 17 22 15.2 22 13C22 11.9 21.6 11 21 10.3C21.3 10 21.5 9.5 21.5 9C21.5 7 20.5 5.5 19 5C18.2 4.8 17.5 5 17 5.5C16.5 3.5 14.5 2 12 2ZM9.5 15C8.7 15 8 14.3 8 13.5C8 12.7 8.7 12 9.5 12C10.3 12 11 12.7 11 13.5C11 14.3 10.3 15 9.5 15ZM14.5 15C13.7 15 13 14.3 13 13.5C13 12.7 13.7 12 14.5 12C15.3 12 16 12.7 16 13.5C16 14.3 15.3 15 14.5 15Z"/>
  </svg>
)

const iconMap = { github: githubIcon, leetcode: leetcodeIcon, monkeytype: monkeyTypeIcon }

const achievements = [
  {
    title: 'Professional Typer',
    description: 'Achieved 90% accuracy with 50 WPM. Certified in touch typing for enhanced productivity and efficiency.',
    year: '2024',
    links: [
      { url: 'https://github.com/PranavSharma1008/TypingAchivenments', type: 'github' },
      { url: 'https://monkeytype.com/profile/SharmaPranav1008', type: 'monkeytype' }
    ]
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Completed comprehensive DSA course covering arrays, linked lists, trees, graphs, dynamic programming, and algorithm design.',
    year: '2024',
    links: [
      { url: 'https://github.com/PranavSharma1008/LeetcodeSerieGithub', type: 'github' },
      { url: 'https://leetcode.com/u/SharmaPranav1008/', type: 'leetcode' },
      { url: 'https://github.com/PranavSharma1008/LeetcodeBadges', type: 'github' }
    ]
  },
  {
    title: 'Course Completed Certificates',
    description: 'All course completion certificates including DSA, DBMS, Networking, and other completed certifications.',
    year: '2024',
    links: [
      { url: 'https://github.com/PranavSharma1008/Certificates', type: 'github' }
    ]
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

const linkTitles = { github: 'GitHub', leetcode: 'LeetCode', monkeytype: 'MonkeyType' }

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
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="achievement-card-inner">
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
              </div>

              {achievement.links && (
                <div className="achievement-links-bar">
                  {achievement.links.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="achievement-link" title={linkTitles[link.type]}>
                      {iconMap[link.type]}
                    </a>
                  ))}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Achievements
