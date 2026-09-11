import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import typingAchievements, { TYPING_CATEGORIES } from '../data/typingAchievements'
import TypingModal from './TypingModal'
import {
  syncTypingWithGitHub,
  GITHUB_TYPING_REPO_URL
} from '../lib/githubTypingSync'

const monkeyTypeIconSvg = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 5 5.8 4.8 5 5C3.5 5.5 2.5 7 2.5 9C2.5 9.5 2.7 10 3 10.3C2.4 11 2 11.9 2 13C2 15.2 3.8 17 6 17H8C8 18.7 9.3 20 11 20H13C14.7 20 16 18.7 16 17H18C20.2 17 22 15.2 22 13C22 11.9 21.6 11 21 10.3C21.3 10 21.5 9.5 21.5 9C21.5 7 20.5 5.5 19 5C18.2 4.8 17.5 5 17 5.5C16.5 3.5 14.5 2 12 2ZM9.5 15C8.7 15 8 14.3 8 13.5C8 12.7 8.7 12 9.5 12C10.3 12 11 12.7 11 13.5C11 14.3 10.3 15 9.5 15ZM14.5 15C13.7 15 13 14.3 13 13.5C13 12.7 13.7 12 14.5 12C15.3 12 16 12.7 16 13.5C16 14.3 15.3 15 14.5 15Z"/>
  </svg>
)

const githubIconSvg = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const MONKEYTYPE_PROFILE_URL = 'https://monkeytype.com/profile/SharmaPranav1008'

const TypingSection = () => {
  const [items, setItems] = useState(typingAchievements)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)

  // Auto-sync on mount
  useEffect(() => {
    let isMounted = true
    const runAutoSync = async () => {
      try {
        const res = await syncTypingWithGitHub(typingAchievements, false)
        if (isMounted && res && Array.isArray(res.items)) {
          setItems(res.items)
          if (res.newCount > 0) {
            setSyncStatus({
              message: `Synced ${res.newCount} new typing record(s) live from GitHub!`,
              type: 'success'
            })
          }
        }
      } catch (err) {
        console.warn('Typing auto-sync error:', err)
      }
    }
    runAutoSync()
    return () => {
      isMounted = false
    }
  }, [])

  // Manual sync trigger
  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncStatus({ message: 'Connecting to TypingAchivenments repo...', type: 'info' })
    try {
      const res = await syncTypingWithGitHub(typingAchievements, true)
      if (res && Array.isArray(res.items)) {
        setItems(res.items)
        if (res.newCount > 0) {
          setSyncStatus({
            message: `Synced ${res.newCount} new typing record(s) from GitHub!`,
            type: 'success'
          })
        } else {
          setSyncStatus({
            message: `Typing repository is up to date (${res.items.length} records).`,
            type: 'info'
          })
        }
      }
    } catch (err) {
      setSyncStatus({
        message: 'Could not connect to GitHub. Showing offline typing records.',
        type: 'error'
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: items.length }
    items.forEach((it) => {
      counts[it.category] = (counts[it.category] || 0) + 1
    })
    return counts
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesCategory =
        activeCategory === 'All' || it.category === activeCategory
      const q = searchQuery.trim().toLowerCase()
      if (!q) return matchesCategory

      const matchesSearch =
        it.title.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.wpm.toLowerCase().includes(q) ||
        it.testType.toLowerCase().includes(q) ||
        it.date.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [items, activeCategory, searchQuery])

  // Display slice
  const displayedItems = useMemo(() => {
    if (isExpanded || searchQuery.trim().length > 0 || activeCategory !== 'All') {
      return filteredItems
    }
    return filteredItems.slice(0, 8)
  }, [filteredItems, isExpanded, searchQuery, activeCategory])

  const handleOpenModal = (indexInFiltered) => {
    setSelectedItemIndex(indexInFiltered)
  }

  const handleCloseModal = () => {
    setSelectedItemIndex(null)
  }

  const handleNext = () => {
    if (selectedItemIndex === null) return
    setSelectedItemIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const handlePrev = () => {
    if (selectedItemIndex === null) return
    setSelectedItemIndex((prev) =>
      prev === 0 ? filteredItems.length - 1 : prev - 1
    )
  }

  const currentModalItem =
    selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null

  return (
    <section className="typing-section section-padding" id="typing">
      <div className="container">
        {/* Section Title */}
        <motion.div
          className="typing-header-top"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="certs-terminal-prompt">
            <span className="prompt-prefix">pranav@portfolio:~$</span>
            <span className="prompt-cmd">speedtest --monkeytype --records</span>
            <div className="typing-top-quicklinks">
              <a
                href={MONKEYTYPE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-link typing-quicklink-monkey"
                title="Open Monkeytype Profile for SharmaPranav1008"
              >
                {monkeyTypeIconSvg}
                <span>Monkeytype Profile ↗</span>
              </a>
              <a
                href={GITHUB_TYPING_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-link"
                title="Open TypingAchivenments repository on GitHub"
              >
                {githubIconSvg}
                <span>TypingAchivenments ↗</span>
              </a>
            </div>
          </div>

          <div className="typing-title-row">
            <div>
              <h2 className="section-title text-left">
                Typing Speed & Achievements
                <span className="certs-count-badge">{items.length} Records</span>
              </h2>
              <p className="typing-intro-text">
                Personal typing records and milestones on Monkeytype. Tested on built-in MacBook Air M2 keyboard.
              </p>
            </div>

            <div className="typing-action-btns">
              <a
                href={MONKEYTYPE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="typing-main-btn typing-btn-monkeytype"
                title="Open Monkeytype Profile for SharmaPranav1008"
              >
                <span className="typing-btn-icon">{monkeyTypeIconSvg}</span>
                <span>Monkeytype Profile</span>
                <span className="typing-btn-arrow">↗</span>
              </a>

              <a
                href={GITHUB_TYPING_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="typing-main-btn typing-btn-repo"
                title="Open TypingAchivenments GitHub repository"
              >
                <span className="typing-btn-icon">{githubIconSvg}</span>
                <span>Typing Records Repo</span>
                <span className="typing-btn-arrow">↗</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Highlight Stats Cards */}
        <div className="typing-stats-grid">
          <div className="typing-stat-box">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <span className="stat-number">82 WPM</span>
              <span className="stat-label">Peak Sprint Speed (10 Words)</span>
            </div>
          </div>
          <div className="typing-stat-box">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-number">100%</span>
              <span className="stat-label">Flawless Accuracy Benchmark</span>
            </div>
          </div>
          <div className="typing-stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <span className="stat-number">59 WPM</span>
              <span className="stat-label">60s Sustained Speed</span>
            </div>
          </div>
          <div className="typing-stat-box">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <span className="stat-number">400+</span>
              <span className="stat-label">Tests Completed & Verified</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Sync Actions */}
        <div className="certs-section-header typing-controls-header">
          {/* Category Filter Pills */}
          <div className="certs-filter-bar typing-filter-bar">
            {TYPING_CATEGORIES.map((cat) => {
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
                      layoutId="activeTypingFilterPill"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

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
                placeholder="Search typing records, tests..."
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

            <button
              type="button"
              className={`certs-sync-btn ${isSyncing ? 'syncing' : ''}`}
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Sync latest images from TypingAchivenments repo"
            >
              <svg
                className={`sync-icon ${isSyncing ? 'spin' : ''}`}
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{isSyncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
          </div>
        </div>

        {/* Sync notification toast */}
        <AnimatePresence>
          {syncStatus && (
            <motion.div
              className={`certs-sync-banner ${syncStatus.type}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <span className="banner-dot" />
              <span>{syncStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count if searching */}
        {searchQuery && (
          <div className="certs-search-result-hint">
            <span>Found {filteredItems.length} typing record(s) for "{searchQuery}"</span>
          </div>
        )}

        {/* Typing Records Grid */}
        {displayedItems.length > 0 ? (
          <motion.div
            className="certificates-grid typing-grid"
            layout
            transition={{ duration: 0.3 }}
          >
            {displayedItems.map((item, index) => (
              <motion.article
                key={item.id}
                layout
                className="cert-card typing-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => handleOpenModal(index)}
              >
                {item.isLiveGithub && (
                  <div className="live-github-ribbon">
                    <span>⚡ GitHub Live</span>
                  </div>
                )}

                {/* Screenshot Preview */}
                <div className="cert-card-preview typing-card-preview">
                  <img
                    src={item.thumbnailUrl || item.fileUrl}
                    alt={item.title}
                    className="cert-card-img typing-card-img"
                    loading="lazy"
                  />
                  <div className="cert-card-overlay">
                    <span className="view-inspect-btn">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Inspect Milestone
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="cert-card-content">
                  <div className="cert-card-top">
                    <span className="typing-speed-badge">
                      ⚡ {item.wpm}
                    </span>
                    <span className="typing-acc-badge">
                      🎯 {item.accuracy}
                    </span>
                    <span className="cert-card-date">{item.date}</span>
                  </div>

                  <h4 className="cert-card-title" title={item.title}>
                    {item.title}
                  </h4>

                  <p className="cert-card-issuer-full" title={item.description}>
                    {item.testType}
                  </p>

                  <div className="cert-card-footer">
                    <span className="cert-category-tag">{item.category}</span>
                    <div className="cert-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="cert-mini-btn open"
                        onClick={() => handleOpenModal(index)}
                        title="View Full Screenshot"
                      >
                        Inspect ↗
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="certs-empty-state">
            <div className="empty-icon">⌨️</div>
            <p>No typing records found matching "{searchQuery}"</p>
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

        {/* Expand / Collapse Button */}
        {activeCategory === 'All' && !searchQuery && items.length > 8 && (
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
                  ? 'Collapse Typing Records'
                  : `View All ${items.length} Typing Records (${items.length - 8} more)`}
              </span>
            </motion.button>
          </div>
        )}

        {/* Interactive Typing Modal */}
        <TypingModal
          isOpen={selectedItemIndex !== null}
          onClose={handleCloseModal}
          item={currentModalItem}
          onNext={handleNext}
          onPrev={handlePrev}
          currentIndex={selectedItemIndex || 0}
          totalCount={filteredItems.length}
        />
      </div>
    </section>
  )
}

export default TypingSection
