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


const LeetCodeSection = () => {
  const [data, setData] = useState(leetcodeInitialData)
  const [selectedBadgeIndex, setSelectedBadgeIndex] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isBadgesExpanded, setIsBadgesExpanded] = useState(false)
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false)

  // Instant hydration + automated background live fetch on load
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

    // 2. Listen for centralized live sync updates
    const handleSynced = (e) => {
      if (isMounted && e.detail) {
        setData(e.detail)
      }
    }
    window.addEventListener('leetcode-synced', handleSynced)

    // 3. Automatically query live LeetCode GraphQL & GitHub on visit
    syncLeetCodeWithLiveSources(true)
      .then((res) => {
        if (isMounted && res && res.data) {
          setData(res.data)
        }
      })
      .catch((e) => {
        console.warn('LeetCode auto-sync error:', e)
      })

    return () => {
      isMounted = false
      window.removeEventListener('leetcode-synced', handleSynced)
    }
  }, [])

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

  // Dynamic display: if <= 4 items, show all directly; if > 4, show 4 with expand toggle
  const displayedBadges = useMemo(() => {
    if (isBadgesExpanded || filteredBadges.length <= 4) {
      return filteredBadges
    }
    return filteredBadges.slice(0, 4)
  }, [filteredBadges, isBadgesExpanded])

  // Dynamic density tier: scales card and image sizes down as item count grows
  const densityClass = useMemo(() => {
    const count = displayedBadges.length
    if (count <= 2) return 'density-large'
    if (count === 3) return 'density-trio'
    if (count === 4) return 'density-medium'
    if (count <= 6) return 'density-compact'
    return 'density-mini'
  }, [displayedBadges.length])

  // Topics mastery display computation
  const topicsList = useMemo(() => data.topics || [], [data.topics])
  const displayedTopics = useMemo(() => {
    if (isTopicsExpanded || topicsList.length <= 6) {
      return topicsList
    }
    return topicsList.slice(0, 6)
  }, [topicsList, isTopicsExpanded])

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
  const total = data.totalSolved || 257
  const easyPct = Math.round(((data.easySolved || 173) / total) * 100)
  const medPct = Math.round(((data.mediumSolved || 80) / total) * 100)
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
              <a
                href={LEETCODE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-main-btn leetcode-btn-profile"
                title={`Open LeetCode Profile for ${data.realName || data.username || 'SharmaPranav1008'}`}
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
              <span className="stat-label">Acceptance Rate</span>
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
              <div className="leetcode-topics-header">
                <div className="leetcode-topics-title">
                  <span>$ leetcode --skills --top-topics</span>
                </div>
                <span className="leetcode-topics-hint" title="Algorithm skill tags across solved problems">
                  Multi-tagged across {data.totalSolved} solved
                </span>
              </div>
              <div className="leetcode-topics-grid">
                {displayedTopics.map((t, idx) => (
                  <div key={t.name || idx} className="leetcode-topic-pill">
                    <span className="topic-name">{t.name}</span>
                    <span className="topic-count">{t.count}</span>
                  </div>
                ))}
              </div>

              {topicsList.length > 6 && (
                <div className="leetcode-topics-toggle-container">
                  <button
                    type="button"
                    className="leetcode-topics-toggle-btn"
                    onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                    aria-expanded={isTopicsExpanded}
                  >
                    <span>{isTopicsExpanded ? 'Show Less Topics' : `See More Topics (${topicsList.length - 6} more)`}</span>
                    <span className="btn-icon">{isTopicsExpanded ? '▲' : '▼'}</span>
                  </button>
                </div>
              )}
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

            <div className={`leetcode-badges-grid ${densityClass}`}>
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
                      onError={(e) => {
                        if (badge.fallbackIcon && e.currentTarget.src !== badge.fallbackIcon) {
                          e.currentTarget.src = badge.fallbackIcon
                        }
                      }}
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

            {/* Expand / Collapse Button for Badges (shown when more than 4 items) */}
            {filteredBadges.length > 4 && (
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
                      : `See More Badges & Milestones (${filteredBadges.length - 4} more)`}
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
                  {data.realName && data.realName.toLowerCase() !== (data.username || '').toLowerCase() ? (
                    <>
                      <span className="callout-display-name">{data.realName}</span>
                      <span className="callout-username">@{data.username || 'SharmaPranav1008'}</span>
                    </>
                  ) : (
                    <span className="callout-username">@{data.username || 'SharmaPranav1008'}</span>
                  )}
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
