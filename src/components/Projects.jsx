import { motion } from 'framer-motion'

const projects = [
  {
    title: 'Algorithm Visualizer',
    description: 'An interactive web application that visualizes various sorting and pathfinding algorithms. Helps in understanding algorithm behavior through step-by-step animations.',
    tech: ['JavaScript', 'HTML5', 'CSS3', 'Canvas API'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
      </svg>
    )
  },
  {
    title: 'Student Database System',
    description: 'A comprehensive DBMS project for managing student records, courses, and grades. Features include CRUD operations, search functionality, and report generation.',
    tech: ['MySQL', 'Python', 'Flask', 'Bootstrap'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
      </svg>
    )
  },
  {
    title: 'Network Packet Analyzer',
    description: 'A tool to capture and analyze network packets, displaying protocol information, source/destination addresses, and payload data for educational purposes.',
    tech: ['Python', 'Scapy', 'Wireshark', 'TCP/IP'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
      </svg>
    )
  },
  {
    title: 'OS Process Scheduler',
    description: 'Simulation of various CPU scheduling algorithms including FCFS, SJF, Round Robin, and Priority scheduling with Gantt chart visualization.',
    tech: ['C++', 'Qt Framework', 'Algorithms'],
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
    )
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const Projects = () => {
  return (
    <section className="projects section-padding" id="projects">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Projects
        </motion.h2>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {projects.map((project, index) => (
            <motion.article
              key={index}
              className="project-card"
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: '0 25px 50px rgba(37, 99, 235, 0.15)',
                borderColor: 'transparent'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="project-header"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <span className="project-icon">{project.icon}</span>
              </motion.div>
              
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              
              <div className="project-tech">
                {project.tech.map((tech, i) => (
                  <motion.span 
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
              
              <motion.a
                href="#"
                className="project-link"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                View Project →
              </motion.a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
