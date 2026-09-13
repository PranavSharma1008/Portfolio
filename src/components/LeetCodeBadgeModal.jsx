import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEETCODE_PROFILE_URL, LEETCODE_BADGES_REPO_URL } from '../data/leetcodeData'

const LeetCodeBadgeModal = ({
  isOpen,
  onClose,
  badge,
  onNext,
  onPrev,
  currentIndex,
  totalCount
}) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        if (onNext) onNext()
      } else if (e.key === 'ArrowLeft') {
        if (onPrev) onPrev()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, onNext, onPrev])

  if (!isOpen || !badge) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cert-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="cert-modal-window leetcode-modal-window"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Window Header */}
            <div className="cert-modal-header">
              <div className="cert-modal-dots">
                <button
                  type="button"
                  className="terminal-dot red"
                  onClick={onClose}
                  title="Close (ESC)"
                  aria-label="Close modal"
                />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>

              <div className="cert-modal-title" title={badge.name}>
                <span className="cert-modal-title-prefix">leetcode://</span>
                <span className="cert-modal-title-text">{badge.name}</span>
              </div>

              <div className="cert-modal-header-actions">
                <span className="cert-counter-pill">
                  {currentIndex + 1} / {totalCount}
                </span>
                <button
                  type="button"
                  className="cert-modal-close-btn"
                  onClick={onClose}
                  title="Close (Esc)"
                  aria-label="Close modal"
                >
                  <span>✕</span>
                  <span>ESC</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="leetcode-modal-body">
              <div className="leetcode-modal-badge-preview">
                <div className="leetcode-modal-badge-glow" />
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className="leetcode-modal-badge-img"
                  onError={(e) => {
                    if (badge.fallbackIcon && e.currentTarget.src !== badge.fallbackIcon) {
                      e.currentTarget.src = badge.fallbackIcon
                    }
                  }}
                />
              </div>

              <div className="leetcode-modal-info">
                <span className="leetcode-badge-tag">{badge.category}</span>
                <h3 className="leetcode-modal-badge-title">{badge.name}</h3>
                <p className="leetcode-modal-badge-desc">{badge.description}</p>

                <div className="leetcode-modal-meta-grid">
                  <div className="leetcode-modal-meta-item">
                    <span className="meta-label">Earned Date:</span>
                    <span className="meta-value">{badge.date}</span>
                  </div>
                  <div className="leetcode-modal-meta-item">
                    <span className="meta-label">Platform:</span>
                    <span className="meta-value">LeetCode Official</span>
                  </div>
                  <div className="leetcode-modal-meta-item">
                    <span className="meta-label">Awardee:</span>
                    <span className="meta-value">@SharmaPranav1008</span>
                  </div>
                </div>

                <div className="leetcode-modal-links">
                  <a
                    href={LEETCODE_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-main-btn leetcode-btn-profile"
                  >
                    <span>Leetcode Profile</span>
                    <span className="leetcode-btn-arrow">↗</span>
                  </a>
                  <a
                    href={LEETCODE_BADGES_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-main-btn leetcode-btn-badges"
                  >
                    <span>View Badges Repo</span>
                    <span className="leetcode-btn-arrow">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Dedicated Modal Footer */}
            {totalCount > 1 && (
              <div className="leetcode-modal-footer">
                <div className="leetcode-modal-pager">
                  <button
                    type="button"
                    className="leetcode-pager-btn"
                    onClick={onPrev}
                    title="Previous badge (Left Arrow)"
                  >
                    ‹ Previous Badge
                  </button>
                  <span className="leetcode-pager-count">
                    {currentIndex + 1} of {totalCount}
                  </span>
                  <button
                    type="button"
                    className="leetcode-pager-btn"
                    onClick={onNext}
                    title="Next badge (Right Arrow)"
                  >
                    Next Badge ›
                  </button>
                </div>
                <div className="leetcode-modal-hint">
                  Use <kbd>←</kbd> <kbd>→</kbd> keys • <kbd>Esc</kbd> to close
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LeetCodeBadgeModal
