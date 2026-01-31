import { motion } from 'framer-motion'
import profileImage from '../assets/profile.png'

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  const linkCards = [
    {
      href: 'https://github.com/PranavSharma1008',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      label: 'GitHub',
      color: '#333'
    },
    {
      href: 'https://www.linkedin.com/in/pranav-sharma-205a7a396/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      label: 'LinkedIn',
      color: '#0A66C2'
    }
  ]

  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="hero-greeting" variants={itemVariants}>
            Hey, I am
          </motion.p>
          
          <motion.h1 className="hero-name" variants={itemVariants}>
            Pranav
          </motion.h1>
          
          <motion.p className="hero-description" variants={itemVariants}>
            A passionate <strong>Software Engineering Fresher</strong> with a solid foundation in{' '}
            <strong>Data Structures & Algorithms</strong>, <strong>Object-Oriented Programming</strong>,{' '}
            <strong>Computer Networks</strong>, <strong>Operating Systems</strong>, and{' '}
            <strong>Database Management</strong>. I thrive on solving complex problems and building
            efficient, scalable solutions with a growth mindset.
          </motion.p>

          <motion.div className="hero-links" variants={itemVariants}>
            {linkCards.map((card, index) => (
              <motion.a
                key={index}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
                style={{ '--card-color': card.color }}
                whileHover={{ y: -4, boxShadow: `0 10px 30px ${card.color}30` }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <span className="link-icon">{card.icon}</span>
                <span>{card.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-image"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="image-wrapper">
            <motion.div
              className="image-background"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="profile-image-container">
              <img src={profileImage} alt="Pranav Sharma" className="profile-image" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
