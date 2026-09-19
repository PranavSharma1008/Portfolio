import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import certificates, { CERTIFICATE_CATEGORIES } from '../data/certificates'
import CertificateModal from './CertificateModal'
import { syncWithGitHubRepo, GITHUB_REPO_URL } from '../lib/githubCertSync'

const CertificatesGallery = ({ initialExpanded = false }) => {
  const [allCertificates, setAllCertificates] = useState(certificates)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [selectedCertIndex, setSelectedCertIndex] = useState(null)
  // Auto-sync with GitHub repository on mount
  useEffect(() => {
    let isMounted = true

    // 1. Hydrate from cache immediately
    try {
      const cached = localStorage.getItem('pranav_portfolio_github_certs_v2')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed?.certificates)) {
          setAllCertificates(parsed.certificates)
        }
      }
    } catch (e) {}

    // 2. Listen for background auto-sync updates
    const handleCertSync = (e) => {
      if (isMounted && Array.isArray(e.detail)) {
        setAllCertificates(e.detail)
      }
    }
    window.addEventListener('certificates-synced', handleCertSync)

    // 3. Automated background sync from GitHub repository
    syncWithGitHubRepo(certificates, true)
      .then((result) => {
        if (isMounted && result && Array.isArray(result.certificates)) {
          setAllCertificates(result.certificates)
        }
      })
      .catch((err) => {
        console.warn('Certificates auto-sync notice:', err)
      })

    return () => {
      isMounted = false
      window.removeEventListener('certificates-synced', handleCertSync)
    }
  }, [])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: allCertificates.length }
    allCertificates.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1
    })
    return counts
  }, [allCertificates])

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    const list = allCertificates.filter((cert) => {
      const matchesCategory =
        activeCategory === 'All' || cert.category === activeCategory
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesSearch =
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.category.toLowerCase().includes(query) ||
        cert.date.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })

    // Priority-first sorting: top technical credentials shown first, followed by secondary credentials
    return [...list].sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50))
  }, [allCertificates, activeCategory, searchQuery])

  // Paginated/Display slice (if collapsed, show first 12; if expanded or searching, show all)
  const displayedCertificates = useMemo(() => {
    if (isExpanded || searchQuery.trim().length > 0 || activeCategory !== 'All') {
      return filteredCertificates
    }
    return filteredCertificates.slice(0, 12)
  }, [filteredCertificates, isExpanded, searchQuery, activeCategory])

  const handleOpenModal = (indexInFiltered) => {
    setSelectedCertIndex(indexInFiltered)
  }

  const handleCloseModal = () => {
    setSelectedCertIndex(null)
  }

  const handleNext = () => {
    if (selectedCertIndex === null) return
    setSelectedCertIndex((prev) => (prev + 1) % filteredCertificates.length)
  }

  const handlePrev = () => {
    if (selectedCertIndex === null) return
    setSelectedCertIndex((prev) =>
      prev === 0 ? filteredCertificates.length - 1 : prev - 1
    )
  }

  const currentModalCert =
    selectedCertIndex !== null ? filteredCertificates[selectedCertIndex] : null

  return (
    <div className="certificates-showcase-container" id="certificates-section">
      {/* Terminal Section Header */}
      <div className="certs-section-header">
        <div className="certs-header-left">
          <div className="certs-terminal-prompt">
            <span className="prompt-prefix">pranav@portfolio:~$</span>
            <span className="prompt-cmd">git pull origin/certificates</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="github-repo-link"
              title="Open Certificates repository on GitHub"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>PranavSharma1008/Certificates ↗</span>
            </a>
          </div>

          <h3 className="certs-headline">
            Verified Certifications & Credentials
            <span className="certs-count-badge">{allCertificates.length}</span>
          </h3>
          <p className="certs-subtext">
            Auto-synced with GitHub repository. Click any certificate to inspect in high-resolution, verify credentials, or download.
          </p>
        </div>

        {/* Search Bar & Sync Actions */}
        <div className="certs-header-controls">
          <div className="certs-search-box">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by topic, issuer, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="certs-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="certs-filter-bar">
        {CERTIFICATE_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              className={`cert-filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="pill-content">
                <span className="pill-name">{cat}</span>
                <span className="pill-count">{count}</span>
              </span>
              {isActive && (
                <motion.span
                  className="pill-active-indicator"
                  layoutId="activeFilterPill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Results summary if searching */}
      {searchQuery && (
        <div className="certs-search-result-hint">
          <span>Found {filteredCertificates.length} certificate(s) for "{searchQuery}"</span>
        </div>
      )}

      {/* Certificates Grid */}
      {displayedCertificates.length > 0 ? (
        <motion.div
          className="certificates-grid"
          layout
          transition={{ duration: 0.3 }}
        >
          {displayedCertificates.map((cert, index) => {
            return (
              <motion.article
                key={cert.id}
                layout
                className="cert-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => handleOpenModal(index)}
              >
                {/* Specialization Badge */}
                {cert.isSpecialization && (
                  <div className="specialization-ribbon">
                    <span>★ Specialization</span>
                  </div>
                )}

                {/* Live from GitHub Badge */}
                {cert.isLiveGithub && (
                  <div className="live-github-ribbon">
                    <span>⚡ GitHub Live</span>
                  </div>
                )}

                {/* Certificate Thumbnail Preview */}
                <div className="cert-card-preview">
                  {cert.thumbnailUrl ? (
                    <img
                      src={cert.thumbnailUrl}
                      alt={cert.title}
                      className="cert-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cert-pdf-placeholder">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <span className="placeholder-text">PDF Certificate</span>
                    </div>
                  )}

                  <div className="cert-card-overlay">
                    <span className="view-inspect-btn">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Inspect Certificate
                    </span>
                  </div>
                </div>

                {/* Card Meta & Header */}
                <div className="cert-card-content">
                  <div className="cert-card-top">
                    <span
                      className="cert-issuer-badge"
                      style={{
                        borderColor: `${cert.badge?.color || '#00d4ff'}40`,
                        color: cert.badge?.color || 'var(--cyan)'
                      }}
                    >
                      <span
                        className="badge-circle"
                        style={{ background: cert.badge?.color || 'var(--cyan)' }}
                      />
                      {cert.badge?.name || cert.issuer}
                    </span>
                    <span className="cert-card-date">{cert.date}</span>
                  </div>

                  <h4 className="cert-card-title" title={cert.title}>
                    {cert.title}
                  </h4>

                  <p className="cert-card-issuer-full" title={cert.issuer}>
                    {cert.issuer}
                  </p>

                  <div className="cert-card-footer">
                    <span className="cert-category-tag">{cert.category}</span>
                    <div className="cert-card-actions" onClick={(e) => e.stopPropagation()}>
                      {cert.verifyUrl && (
                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cert-mini-btn verify"
                          title="Verify Credential"
                        >
                          Verify ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="cert-mini-btn open"
                        onClick={() => handleOpenModal(index)}
                        title="Open Animated Preview"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      ) : (
        <div className="certs-empty-state">
          <div className="empty-icon">📂</div>
          <p>No certificates found matching "{searchQuery}"</p>
          <button
            type="button"
            className="cmd-btn"
            onClick={() => {
              setSearchQuery('')
              setActiveCategory('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Expand / Show All Toggle Button */}
      {activeCategory === 'All' && !searchQuery && allCertificates.length > 12 && (
        <div className="certs-expand-wrapper">
          <motion.button
            type="button"
            className="cmd-btn cmd-btn-primary certs-toggle-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-icon">{isExpanded ? '▲' : '▼'}</span>
            <span>
              {isExpanded
                ? 'Collapse Certificates Gallery'
                : `View All ${allCertificates.length} Certificates (${allCertificates.length - 12} more)`}
            </span>
          </motion.button>
        </div>
      )}

      {/* Animated Certificate Modal */}
      <CertificateModal
        isOpen={selectedCertIndex !== null}
        onClose={handleCloseModal}
        certificate={currentModalCert}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={selectedCertIndex || 0}
        totalCount={filteredCertificates.length}
      />
    </div>
  )
}

export default CertificatesGallery
