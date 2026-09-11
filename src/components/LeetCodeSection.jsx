import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  leetcodeInitialData,
  LEETCODE_PROFILE_URL,
  LEETCODE_SERIE_REPO_URL,
  LEETCODE_BADGES_REPO_URL
} from '../data/leetcodeData'
import { syncLeetCodeWithLiveSources, CACHE_KEY } from '../lib/githubLeetcodeSync'
import LeetCodeBadgeModal from './LeetCodeBadgeModal'

const leetcodeIconSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
)

const githubIconSvg = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const syncIconSvg = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"/>
  </svg>
)

const LeetCodeSection = () => {
  const [data, setData] = useState(leetcodeInitialData)
  const [selectedBadgeIndex, setSelectedBadgeIndex] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [isBadgesExpanded, setIsBadgesExpanded] = useState(false)

  // Instant hydration + immediate background live fetch on load
  useEffect(() => {
    let isMounted = true

    // 1. Instantly hydrate from local cache if present
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.data) {
          setData(parsed.data)
        }
      }
    } catch (e) {}

    // 2. Automatically query live LeetCode GraphQL & GitHub on visit
    const runAutoSync = async () => {
      try {
        const res = await syncLeetCodeWithLiveSources(true)
        if (isMounted && res && res.data) {
          setData(res.data)
        }
      } catch (e) {
        console.warn('LeetCode auto-sync error:', e)
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
    setSyncStatus({ message: 'Fetching live stats from LeetCode & GitHub...', type: 'info' })
    try {
      const res = await syncLeetCodeWithLiveSources(true)
      if (res && res.data) {
        setData(res.data)
        setSyncStatus({
          message: res.message,
          type: res.isLive ? 'success' : 'info'
        })
      }
    } catch (err) {
      setSyncStatus({
        message: 'Could not connect to LeetCode API. Loaded cached verified data.',
        type: 'info'
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  // Filtered badges / milestones
  const filteredBadges = useMemo(() => {
    if (activeFilter === 'Badges') {
      return data.badges.filter((b) => b.type === 'badge')
    }
    if (activeFilter === 'Milestones') {
      return data.badges.filter((b) => b.type === 'milestone')
    }
    return data.badges
  }, [data.badges, activeFilter])

  // Compact default view (top 2 items), expandable to view all badges/milestones
  const displayedBadges = useMemo(() => {
    if (isBadgesExpanded) {
      return filteredBadges
    }
    return filteredBadges.slice(0, 2)
  }, [filteredBadges, isBadgesExpanded])

  const handleOpenBadge = (badge) => {
    const idx = filteredBadges.findIndex((b) => b.id === badge.id)
    setSelectedBadgeIndex(idx >= 0 ? idx : 0)
  }

  const handleCloseBadge = () => {
    setSelectedBadgeIndex(null)
  }

  const handleNextBadge = () => {
    if (selectedBadgeIndex === null) return
    setSelectedBadgeIndex((prev) => (prev + 1) % filteredBadges.length)
  }

  const handlePrevBadge = () => {
    if (selectedBadgeIndex === null) return
    setSelectedBadgeIndex((prev) =>
      prev === 0 ? filteredBadges.length - 1 : prev - 1
    )
  }

  const currentBadge =
    selectedBadgeIndex !== null ? filteredBadges[selectedBadgeIndex] : null

  // Percentages of solved problems
  const total = data.totalSolved || 255
  const easyPct = Math.round(((data.easySolved || 173) / total) * 100)
  const medPct = Math.round(((data.mediumSolved || 78) / total) * 100)
  const hardPct = Math.round(((data.hardSolved || 4) / total) * 100)

  return (
    <section className="leetcode-section section-padding" id="leetcode">
      <div className="container">
        {/* Terminal Header Bar */}
        <motion.div
          className="leetcode-header-top"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="certs-terminal-prompt">
            <span className="prompt-prefix">pranav@portfolio:~$</span>
            <span className="prompt-cmd">leetcode --live-sync {data.username}</span>
            <div className="leetcode-top-quicklinks">
              <a
                href={LEETCODE_BADGES_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-link"
                title="Open LeetcodeBadges repo on GitHub"
              >
                {githubIconSvg}
                <span>LeetcodeBadges ↗</span>
              </a>
              <a
                href={LEETCODE_SERIE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-link"
                title="Open LeetCode Solutions repo on GitHub"
              >
                {githubIconSvg}
                <span>LeetcodeSerieGithub ↗</span>
              </a>
            </div>
          </div>

          <div className="leetcode-title-row">
            <div>
              <h2 className="section-title text-left">
                LeetCode & Problem Solving
                <span className="certs-count-badge">{data.totalSolved} Solved</span>
              </h2>
              <p className="typing-intro-text">
                Live Data Structures & Algorithms metrics, daily challenge streaks, and verified consistency badges.
              </p>
            </div>

            {/* Action Buttons: Exact user-requested button names + Live Sync */}
            <div className="leetcode-action-btns">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`certs-sync-btn ${isSyncing ? 'syncing' : ''}`}
                title="Fetch live problem statistics and badges from LeetCode"
              >
                <span className={`sync-icon ${isSyncing ? 'spinning' : ''}`}>
                  {syncIconSvg}
                </span>
                <span>{isSyncing ? 'Syncing...' : 'Sync Live Stats'}</span>
              </button>

              <a
                href={LEETCODE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-main-btn leetcode-btn-profile"
                title="Open LeetCode Profile for SharmaPranav1008"
              >
                <span className="leetcode-btn-icon">{leetcodeIconSvg}</span>
                <span>Leetcode Profile</span>
                <span className="leetcode-btn-arrow">↗</span>
              </a>

              <a
                href={LEETCODE_SERIE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-main-btn leetcode-btn-repo"
                title="Open Leetcode Solutions Repository on GitHub"
              >
                <span className="leetcode-btn-icon">{githubIconSvg}</span>
                <span>LeetCode Solutions Repo</span>
                <span className="leetcode-btn-arrow">↗</span>
              </a>

              <a
                href={LEETCODE_BADGES_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-main-btn leetcode-btn-badges"
                title="Open Leetcode Badges Repository on GitHub"
              >
                <span className="leetcode-btn-icon">🎖️</span>
                <span>LeetcodeBadges Repo</span>
                <span className="leetcode-btn-arrow">↗</span>
              </a>
            </div>
          </div>

          {/* Sync Status Banner */}
          <AnimatePresence>
            {syncStatus && (
              <motion.div
                className={`certs-sync-banner ${syncStatus.type}`}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="banner-dot" />
                <span>{syncStatus.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Highlight Metrics */}
        <div className="leetcode-metrics-grid">
          <motion.div
            className="typing-stat-box"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-number">{data.totalSolved}</span>
              <span className="stat-label">Total Problems Solved</span>
            </div>
          </motion.div>

          <motion.div
            className="typing-stat-box"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="stat-icon">🌐</div>
            <div className="stat-content">
              <span className="stat-number">#{data.ranking}</span>
              <span className="stat-label">Global LeetCode Rank</span>
            </div>
          </motion.div>

          <motion.div
            className="typing-stat-box"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-number">{data.acceptanceRate}</span>
              <span className="stat-label">Submission Accuracy Rate</span>
            </div>
          </motion.div>

          <motion.div
            className="typing-stat-box"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <span className="stat-number">{data.badges.length} Items</span>
              <span className="stat-label">Badges & Milestones Synced</span>
            </div>
          </motion.div>
        </div>

        {/* Main 2-Column Content: Stats & Badges */}
        <div className="leetcode-main-grid">
          {/* Column 1: Problem Breakdown & Topics */}
          <motion.div
            className="leetcode-breakdown-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="leetcode-card-header">
              <div className="terminal-dots">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>
              <span className="leetcode-total-indicator">{data.totalSolved} Problems</span>
            </div>

            {/* Difficulty Bars */}
            <div className="leetcode-breakdown-body">
              <div className="leetcode-diff-item easy">
                <div className="diff-header">
                  <span className="diff-name">Easy</span>
                  <span className="diff-count">
                    <strong>{data.easySolved}</strong>
                    <span className="diff-pct">({easyPct}%)</span>
                  </span>
                </div>
                <div className="diff-progress-bar">
                  <div
                    className="diff-fill easy"
                    style={{ width: `${easyPct}%` }}
                  />
                </div>
              </div>

              <div className="leetcode-diff-item medium">
                <div className="diff-header">
                  <span className="diff-name">Medium</span>
                  <span className="diff-count">
                    <strong>{data.mediumSolved}</strong>
                    <span className="diff-pct">({medPct}%)</span>
                  </span>
                </div>
                <div className="diff-progress-bar">
                  <div
                    className="diff-fill medium"
                    style={{ width: `${medPct}%` }}
                  />
                </div>
              </div>

              <div className="leetcode-diff-item hard">
                <div className="diff-header">
                  <span className="diff-name">Hard</span>
                  <span className="diff-count">
                    <strong>{data.hardSolved}</strong>
                    <span className="diff-pct">({hardPct}%)</span>
                  </span>
                </div>
                <div className="diff-progress-bar">
                  <div
                    className="diff-fill hard"
                    style={{ width: `${hardPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Topic Mastery Tags */}
            <div className="leetcode-topics-section">
              <div className="leetcode-topics-title">
                <span>$ leetcode --skills --top-topics</span>
              </div>
              <div className="leetcode-topics-grid">
                {data.topics.map((t, idx) => (
                  <div key={idx} className="leetcode-topic-pill">
                    <span className="topic-name">{t.name}</span>
                    <span className="topic-count">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice for Solutions Code Repo */}
            <div className="leetcode-repo-notice">
              <div className="repo-notice-header">
                <span className="prompt-prefix">git@github.com:</span>
                <span className="prompt-cmd">PranavSharma1008/LeetcodeSerieGithub</span>
              </div>
              <p className="repo-notice-desc">
                Contains complete problem-solving code and algorithmic solutions with documented time & space complexity analysis.
              </p>
              <div className="repo-notice-status-row">
                <span className="repo-status-badge">● Sync Status: {data.repoLastUpdated || 'Up to date'}</span>
                <a
                  href={LEETCODE_SERIE_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leetcode-repo-direct-link"
                >
                  <span>Browse Code Repository ↗</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Badges & Progress Milestones Showcase */}
          <div className="leetcode-badges-column">
            <div className="leetcode-badges-header">
              <div>
                <h3 className="leetcode-subhead">Badges & Milestones</h3>
                <p className="leetcode-subhead-desc">
                  Official LeetCode recognition and verified progress records.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="leetcode-filter-pills">
                {['All', 'Badges', 'Milestones'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`leetcode-pill-btn ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="leetcode-badges-grid">
              {displayedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  className={`leetcode-badge-card ${badge.type === 'milestone' ? 'milestone-card' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(255, 161, 22, 0.2)' }}
                  onClick={() => handleOpenBadge(badge)}
                >
                  <div className="leetcode-badge-visual">
                    <div className="badge-glow-ring" />
                    <img
                      src={badge.icon}
                      alt={badge.name}
                      className="leetcode-badge-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="leetcode-badge-meta">
                    <div className="badge-category-tag">{badge.category}</div>
                    <h4 className="badge-name">{badge.displayName || badge.name}</h4>
                    <p className="badge-desc">{badge.description}</p>
                    <div className="badge-footer-row">
                      <span className="badge-date">{badge.date}</span>
                      <span className="badge-click-hint">Inspect ↗</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Expand / Collapse Button for Badges */}
            {filteredBadges.length > 2 && (
              <div className="leetcode-see-more-container">
                <motion.button
                  type="button"
                  className="leetcode-see-more-btn"
                  onClick={() => setIsBadgesExpanded(!isBadgesExpanded)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="btn-icon">{isBadgesExpanded ? '▲' : '▼'}</span>
                  <span>
                    {isBadgesExpanded
                      ? 'Show Less Badges'
                      : `See More Badges & Milestones (${filteredBadges.length - 2} more)`}
                  </span>
                </motion.button>
              </div>
            )}

            {/* Profile CTA Callout */}
            <div className="leetcode-profile-callout">
              <div className="callout-avatar-area">
                <img
                  src={data.avatar || '/leetcode/avatar.png'}
                  alt={`${data.username} Avatar`}
                  className="callout-avatar-img"
                  onError={(e) => {
                    e.currentTarget.src = '/leetcode/avatar.png'
                  }}
                />
              </div>
              <div className="callout-text-area">
                <div className="callout-user-row">
                  <span className="callout-username">@SharmaPranav1008</span>
                  <span className="callout-verified">Verified LeetCoder</span>
                </div>
                <p className="callout-bio">
                  Continuous problem solver tracking algorithmic milestones, dynamic programming patterns, and complexity optimizations.
                </p>
                <div className="callout-actions">
                  <a
                    href={LEETCODE_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-main-btn leetcode-btn-profile"
                  >
                    {leetcodeIconSvg}
                    <span>Leetcode Profile</span>
                    <span className="leetcode-btn-arrow">↗</span>
                  </a>
                  <a
                    href={LEETCODE_BADGES_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-main-btn leetcode-btn-badges"
                  >
                    <span>LeetcodeBadges ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for badge inspection */}
        <LeetCodeBadgeModal
          isOpen={selectedBadgeIndex !== null}
          onClose={handleCloseBadge}
          badge={currentBadge}
          currentIndex={selectedBadgeIndex}
          totalCount={filteredBadges.length}
          onNext={handleNextBadge}
          onPrev={handlePrevBadge}
        />
      </div>
    </section>
  )
}

export default LeetCodeSection
