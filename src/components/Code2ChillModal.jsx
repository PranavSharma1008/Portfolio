import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Code2ChillModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('proof') // 'proof' | 'poster'
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const currentImage =
    activeTab === 'proof'
      ? '/certificates/code2chill-proof.png'
      : '/certificates/code2chill-poster.png'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cert-modal-overlay c2c-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="cert-modal-window c2c-modal-window"
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Titlebar */}
            <div className="cert-modal-header c2c-modal-header">
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

              <div className="cert-modal-title">
                <span className="cert-modal-title-prefix">competition://</span>
                <span className="cert-modal-title-text">
                  code2chill-onfire-top20.proof
                </span>
              </div>

              <div className="cert-modal-header-actions">
                <span className="cert-counter-pill c2c-pill">TOP 20 FINALIST</span>
                <button
                  type="button"
                  className="cert-modal-close-btn"
                  onClick={onClose}
                  title="Close (ESC)"
                  aria-label="Close modal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Banner */}
            <div className="c2c-banner">
              <div className="c2c-banner-badge">
                <span>🔥</span> Top 20 Finalist (Out of 300+ Participants)
              </div>
              <div className="c2c-banner-sub">
                (O)n Fire: The LeetCode Competition • Organized by Code2Chill Club, Chitkara University
              </div>
            </div>

            {/* Command Bar */}
            <div className="cert-modal-cmdbar c2c-modal-cmdbar">
              <div className="sih-tab-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${activeTab === 'proof' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('proof')
                    setIsZoomed(false)
                  }}
                >
                  📜 Competition Results & Proof
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeTab === 'poster' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('poster')
                    setIsZoomed(false)
                  }}
                >
                  🎨 Official Event Poster
                </button>
              </div>

              <div className="cert-modal-actions">
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn cert-action-btn"
                  title="Open full view in new tab"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Full View</span>
                </a>
              </div>
            </div>

            {/* Image Display */}
            <div className="sih-display-wrapper c2c-display-wrapper">
              <div
                className={`cert-img-container ${isZoomed ? 'zoomed' : ''}`}
                onClick={() => setIsZoomed(!isZoomed)}
                title="Click to toggle zoom"
              >
                <img
                  src={currentImage}
                  alt={
                    activeTab === 'proof'
                      ? 'Code2Chill LeetCode Competition Result Proof'
                      : 'Code2Chill On Fire Event Poster'
                  }
                  className="cert-view-img"
                />
              </div>
            </div>

            {/* Highlights Grid - Only Useful Information */}
            <div className="sih-details-card">
              <div className="sih-details-grid">
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Competition</span>
                  <span className="sih-detail-value highlight" style={{ color: '#f97316' }}>
                    (O)n Fire — The LeetCode Competition
                  </span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Organizer</span>
                  <span className="sih-detail-value">Code2Chill Club (Chitkara University)</span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Result</span>
                  <span className="sih-detail-value status-tag">Top 20 Finalist (Out of 300+)</span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Progression</span>
                  <span className="sih-detail-value">Cleared Easy & Medium ➔ Reached Hard Finals</span>
                </div>
              </div>

              <div className="c2c-stat-chips">
                <div className="c2c-chip">
                  <span className="c2c-chip-num">300+</span>
                  <span className="c2c-chip-lbl">Total Participants</span>
                </div>
                <div className="c2c-chip">
                  <span className="c2c-chip-num">148</span>
                  <span className="c2c-chip-lbl">Qualified Round 2</span>
                </div>
                <div className="c2c-chip highlight">
                  <span className="c2c-chip-num">20</span>
                  <span className="c2c-chip-lbl">Qualified Finals (Hard)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Code2ChillModal
