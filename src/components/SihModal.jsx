import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SihModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('title') // 'title' | 'announcement'
  const [isZoomed, setIsZoomed] = useState(false)

  // Keyboard navigation & lock scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
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
    activeTab === 'title'
      ? '/certificates/sih-2026-title.png'
      : '/certificates/sih-2026-announcement.png'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cert-modal-overlay sih-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="cert-modal-window sih-modal-window"
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Titlebar */}
            <div className="cert-modal-header sih-modal-header">
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
                <span className="cert-modal-title-prefix">hackathon://</span>
                <span className="cert-modal-title-text">
                  SIH-2026-Chitkara-Level-Selection.proof
                </span>
              </div>

              <div className="cert-modal-header-actions">
                <span className="cert-counter-pill sih-pill">SIH 2026</span>
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

            {/* Selection Banner */}
            <div className="sih-banner">
              <div className="sih-banner-badge">
                <span className="sih-sparkle">🚀</span> Selected at College Level (Chitkara University)
              </div>
              <div className="sih-banner-sub">
                Smart India Hackathon 2026 • Problem Statement ID: <strong>SIH26133</strong>
              </div>
            </div>

            {/* Modal Command Bar */}
            <div className="cert-modal-cmdbar sih-modal-cmdbar">
              <div className="sih-tab-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${activeTab === 'title' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('title')
                    setIsZoomed(false)
                  }}
                >
                  📄 PPT Title Page (PS ID: SIH26133)
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeTab === 'announcement' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('announcement')
                    setIsZoomed(false)
                  }}
                >
                  📢 Selection Announcement & Project Scope
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

                <a
                  href="https://www.sih.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn cmd-btn-primary cert-action-btn"
                  title="Visit official Smart India Hackathon website"
                >
                  <span>SIH Portal ↗</span>
                </a>
              </div>
            </div>

            {/* Certificate & Image Display */}
            <div className="sih-display-wrapper">
              <div
                className={`cert-img-container ${isZoomed ? 'zoomed' : ''}`}
                onClick={() => setIsZoomed(!isZoomed)}
                title="Click to toggle zoom"
              >
                <img
                  src={currentImage}
                  alt={
                    activeTab === 'title'
                      ? 'Smart India Hackathon 2026 Title Page'
                      : 'SIH 2026 Selection Announcement'
                  }
                  className="cert-view-img"
                />
              </div>
            </div>

            {/* Structured Project & Certificate Status Card */}
            <div className="sih-details-card">
              <div className="sih-details-grid">
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Project Name</span>
                  <span className="sih-detail-value highlight">SehatSetu – RuralCare Connect</span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Problem Statement ID</span>
                  <span className="sih-detail-value">SIH26133 (Software Category)</span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Theme</span>
                  <span className="sih-detail-value">MedTech / BioTech / HealthTech</span>
                </div>
                <div className="sih-detail-item">
                  <span className="sih-detail-label">Milestone</span>
                  <span className="sih-detail-value status-tag">Selected at Chitkara University Level</span>
                </div>
              </div>

              <div className="sih-detail-desc">
                <strong>Project Mission:</strong> Improving continuity of care by tracking patient referral journeys, identifying follow-up delays, and helping patients in rural & underserved areas reach the right care at the right facility at the right time.
              </div>

              <div className="sih-cert-status-notice">
                <span className="sih-notice-icon">📜</span>
                <span className="sih-notice-text">
                  <strong>Official Certificate Status:</strong> Selected at College / Chitkara Level. The official MoE / Chitkara University certificate will be uploaded here once issued.
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SihModal
