import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CertificatesGallery from './CertificatesGallery'
import certificates from '../data/certificates'
import { leetcodeInitialData } from '../data/leetcodeData'
import { CACHE_KEY } from '../lib/githubLeetcodeSync'
import { CACHE_KEY as GITHUB_CERTS_CACHE_KEY } from '../lib/githubCertSync'
import {
  syncLinkedInStats,
  LINKEDIN_PROFILE_URL,
  DEFAULT_FOLLOWERS,
  CACHE_KEY as LINKEDIN_CACHE_KEY
} from '../lib/linkedinSync'

const githubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const leetcodeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
)

const monkeyTypeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 5 5.8 4.8 5 5C3.5 5.5 2.5 7 2.5 9C2.5 9.5 2.7 10 3 10.3C2.4 11 2 11.9 2 13C2 15.2 3.8 17 6 17H8C8 18.7 9.3 20 11 20H13C14.7 20 16 18.7 16 17H18C20.2 17 22 15.2 22 13C22 11.9 21.6 11 21 10.3C21.3 10 21.5 9.5 21.5 9C21.5 7 20.5 5.5 19 5C18.2 4.8 17.5 5 17 5.5C16.5 3.5 14.5 2 12 2ZM9.5 15C8.7 15 8 14.3 8 13.5C8 12.7 8.7 12 9.5 12C10.3 12 11 12.7 11 13.5C11 14.3 10.3 15 9.5 15ZM14.5 15C13.7 15 13 14.3 13 13.5C13 12.7 13.7 12 14.5 12C15.3 12 16 12.7 16 13.5C16 14.3 15.3 15 14.5 15Z"/>
  </svg>
)

const linkedinIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const certBadgeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const checkBadgeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
)

const sihBadgeIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
    <path d="M9 21h6" />
    <path d="M10 17h4" />
    <circle cx="12" cy="9" r="1.5" fill="#ff9800" />
  </svg>
)

const c2cBadgeIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const iconMap = {
  github: githubIcon,
  leetcode: leetcodeIcon,
  monkeytype: monkeyTypeIcon,
  linkedin: linkedinIcon,
  sih: sihBadgeIcon,
  c2c: c2cBadgeIcon
}

const achievements = [
  {
    title: 'Smart India Hackathon 2026',
    description: 'Selected at College Level (Chitkara University) for SIH 2026. Developing SehatSetu – RuralCare Connect for PS ID SIH26133 under MedTech/BioTech/HealthTech theme.',
    year: 'Chitkara Selected',
    badgeIcon: sihBadgeIcon,
    isSihCard: true,
    links: [
      { url: 'https://www.sih.gov.in/', type: 'sih', title: 'Smart India Hackathon Portal' }
    ]
  },
  {
    title: 'Code2Chill: On Fire (LeetCode)',
    description: 'Top 20 Finalist out of 300+ participants in Chitkara University\'s official LeetCode competition, qualifying through Easy & Medium problem rounds into Hard finals.',
    year: 'Top 20 / 300+',
    badgeIcon: c2cBadgeIcon,
    isC2cCard: true,
    links: [
      {
        url: 'https://www.linkedin.com/posts/pranavsharma1008_code2chill-leetcode-dsa-activity-7508624331850190848-1Ec-?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGFVk6UB0Qprql3hceLxNFaKPofWdsr-mm4',
        type: 'linkedin',
        title: 'View Code2Chill LeetCode Competition Post on LinkedIn'
      }
    ]
  },
  {
    title: 'Professional Typer',
    description: 'Achieved 82 WPM peak sprint and 100% accuracy. Documented milestones on Monkeytype.',
    year: '14 Records',
    badgeIcon: checkBadgeIcon,
    isTypingCard: true,
    links: [
      { url: 'https://github.com/PranavSharma1008/TypingAchivenments', type: 'github' },
      { url: 'https://monkeytype.com/profile/SharmaPranav1008', type: 'monkeytype' }
    ]
  },
  {
    title: 'DSA Mastery',
    description: 'Solved 277 algorithm problems covering dynamic programming, graphs, trees, and system logic with 100-Day consistency badges.',
    year: '277 Solved',
    badgeIcon: leetcodeIcon,
    isDsaCard: true,
    links: [
      { url: 'https://leetcode.com/u/SharmaPranav1008/', type: 'leetcode' },
      { url: 'https://github.com/PranavSharma1008/LeetcodeSerieGithub', type: 'github' }
    ]
  },
  {
    title: 'Certifications & Credentials',
    description: '42 verified certificates across Generative AI, Python & Machine Learning, Intellectual Property Law, Design Thinking, and Cybersecurity.',
    year: '42 Verified',
    badgeIcon: certBadgeIcon,
    isCertCard: true,
    links: [
      { url: 'https://github.com/PranavSharma1008/Certificates', type: 'github', title: 'Certificates Repository' },
      { url: 'https://github.com/PranavSharma1008/Hack-Certficates', type: 'github', title: 'Hack-Certficates Repository' }
    ]
  },
  {
    title: 'LinkedIn Network',
    description: `Active professional network of ${DEFAULT_FOLLOWERS} followers and connections sharing insights on DSA, full-stack systems, and modern AI development.`,
    year: `${DEFAULT_FOLLOWERS} Followers`,
    badgeIcon: linkedinIcon,
    isLinkedInCard: true,
    links: [
      {
        url: LINKEDIN_PROFILE_URL,
        type: 'linkedin',
        title: 'LinkedIn Profile (@pranavsharma1008)'
      }
    ]
  }
]

const INITIAL_ACHIEVEMENTS_COUNT = 3

const Achievements = () => {
  const [solvedCount, setSolvedCount] = useState(leetcodeInitialData.totalSolved)
  const [certsCount, setCertsCount] = useState(certificates.length)
  const [followersCount, setFollowersCount] = useState(DEFAULT_FOLLOWERS)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.data?.totalSolved) {
          setSolvedCount(parsed.data.totalSolved)
        }
      }
      const cachedCerts = localStorage.getItem(GITHUB_CERTS_CACHE_KEY)
      if (cachedCerts) {
        const parsedC = JSON.parse(cachedCerts)
        if (Array.isArray(parsedC?.certificates) && parsedC.certificates.length > 0) {
          setCertsCount(parsedC.certificates.length)
        }
      }
      const cachedLi = localStorage.getItem(LINKEDIN_CACHE_KEY)
      if (cachedLi) {
        const parsedLi = JSON.parse(cachedLi)
        if (parsedLi?.data?.followers || parsedLi?.data?.connections) {
          setFollowersCount(parsedLi.data.followers || parsedLi.data.connections)
        }
      }
    } catch (e) {}

    const handleSync = (e) => {
      if (e.detail?.totalSolved) {
        setSolvedCount(e.detail.totalSolved)
      }
    }
    const handleCertSync = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setCertsCount(e.detail.length)
      }
    }
    const handleLiSync = (e) => {
      if (e.detail?.followers || e.detail?.connections) {
        setFollowersCount(e.detail.followers || e.detail.connections)
      }
    }

    window.addEventListener('leetcode-synced', handleSync)
    window.addEventListener('certificates-synced', handleCertSync)
    window.addEventListener('linkedin-synced', handleLiSync)

    // Automatically sync LinkedIn followers & network metrics
    syncLinkedInStats(true)
      .then((res) => {
        if (res?.data?.followers || res?.data?.connections) {
          setFollowersCount(res.data.followers || res.data.connections)
        }
      })
      .catch(() => {})

    return () => {
      window.removeEventListener('leetcode-synced', handleSync)
      window.removeEventListener('certificates-synced', handleCertSync)
      window.removeEventListener('linkedin-synced', handleLiSync)
    }
  }, [])

  const displayAchievements = achievements.map((achievement) => {
    if (achievement.isDsaCard) {
      return {
        ...achievement,
        description: `Solved ${solvedCount} algorithm problems covering dynamic programming, graphs, trees, and system logic with 100-Day consistency badges.`,
        year: `${solvedCount} Solved`
      }
    }
    if (achievement.isCertCard) {
      return {
        ...achievement,
        description: `${certsCount} verified certificates across Generative AI, Python & Machine Learning, Intellectual Property Law, Design Thinking, and Cybersecurity.`,
        year: `${certsCount} Verified`
      }
    }
    if (achievement.isLinkedInCard) {
      return {
        ...achievement,
        description: `Active professional network of ${followersCount} followers and connections sharing insights on DSA, scalable systems, and modern AI development.`,
        year: `${followersCount} Followers`
      }
    }
    return achievement
  })

  const visibleAchievements = isExpanded
    ? displayAchievements
    : displayAchievements.slice(0, INITIAL_ACHIEVEMENTS_COUNT)

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false)
      const el = document.getElementById('achievements')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      setIsExpanded(true)
    }
  }

  const scrollToLeetcode = (e) => {
    e.preventDefault()
    const el = document.getElementById('leetcode')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToCerts = (e) => {
    e.preventDefault()
    const el = document.getElementById('certificates-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToTyping = (e) => {
    e.preventDefault()
    const el = document.getElementById('typing')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
          Achievements
        </motion.h2>

        <motion.div className="achievements-grid" layout transition={{ duration: 0.3 }}>
          <AnimatePresence initial={false}>
            {visibleAchievements.map((achievement, index) => (
              <motion.article
                key={achievement.title}
                className={`achievement-card ${achievement.isCertCard ? 'achievement-card-certs' : ''}`}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.35, delay: index >= INITIAL_ACHIEVEMENTS_COUNT ? (index - INITIAL_ACHIEVEMENTS_COUNT) * 0.08 : 0 }}
                whileHover={{ y: -4, boxShadow: '0 0 30px rgba(0, 212, 255, 0.12)' }}
              >
                <div className="achievement-badge">
                  {achievement.badgeIcon || checkBadgeIcon}
                </div>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-meta-row">
                  <span className="achievement-date">{achievement.year}</span>
                  {achievement.isCertCard && (
                    <button
                      type="button"
                      onClick={scrollToCerts}
                      className="ach-jump-certs-btn"
                      title="Jump to certificates gallery"
                    >
                      Explore {certsCount} Certificates ↓
                    </button>
                  )}
                  {achievement.isTypingCard && (
                    <button
                      type="button"
                      onClick={scrollToTyping}
                      className="ach-jump-certs-btn"
                      title="Jump to typing records section"
                    >
                      Explore Typing Records ↓
                    </button>
                  )}
                  {achievement.isDsaCard && (
                    <button
                      type="button"
                      onClick={scrollToLeetcode}
                      className="ach-jump-certs-btn"
                      title="Jump to LeetCode section"
                    >
                      Explore LeetCode Stats ↓
                    </button>
                  )}
                </div>

                {achievement.links && (
                  <div className="achievement-links">
                    {achievement.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="achievement-link" title={link.title || link.type}>
                        {iconMap[link.type]}
                      </a>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Expand / Collapse Button */}
        {displayAchievements.length > INITIAL_ACHIEVEMENTS_COUNT && (
          <div className="ach-expand-wrapper">
            <motion.button
              type="button"
              className="ach-expand-btn"
              onClick={handleToggleExpand}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-expanded={isExpanded}
            >
              <span className="ach-expand-icon">{isExpanded ? '▲' : '▼'}</span>
              <span>
                {isExpanded
                  ? 'Show Less'
                  : `+ Add More Achievements (${displayAchievements.length - INITIAL_ACHIEVEMENTS_COUNT})`}
              </span>
            </motion.button>
          </div>
        )}

        {/* Full 42 Certificates Interactive Showcase */}
        <CertificatesGallery />
      </div>
    </section>
  )
}

export default Achievements
