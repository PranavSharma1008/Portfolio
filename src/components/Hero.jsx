import { motion } from 'framer-motion'
import HangingIdCard from './HangingIdCard'
import { TypingText } from './TypingText'
import ScrollReveal from './ScrollReveal'

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <TypingText as="p" className="hero-greeting" delay={0.2} duration={1.5} align="left">
              Hey, I am
            </TypingText>

            <TypingText as="h1" className="hero-name" delay={2} duration={1.8} align="left">
              Pranav Sharma
            </TypingText>
          </div>

          <ScrollReveal
            textClassName="hero-description"
            align="left"
            staggerDelay={0.03}
            threshold={0.3}
            duration={0.5}
          >
            A passionate Software Engineer with a solid foundation in Data Structures & Algorithms, Object-Oriented Programming, Computer Networks, Operating Systems, and Database Management. I thrive on solving complex problems and building efficient, scalable solutions with a growth mindset.
          </ScrollReveal>
        </motion.div>

        <div className="hero-image">
          <HangingIdCard />
        </div>
      </div>

    </section>
  )
}

export default Hero
