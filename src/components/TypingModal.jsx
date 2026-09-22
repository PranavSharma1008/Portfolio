import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatWpmDisplay, formatAccDisplay } from './TypingSection'

const TypingModal = ({
  isOpen,
  onClose,
  item,
  onNext,
  onPrev,
  currentIndex,
  totalCount
}) => {
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setIsZoomed(false)
  }, [item?.id])

  // Keyboard navigation & lock scroll
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

  if (!isOpen || !item) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cert-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="cert-modal-window typing-modal-window"
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Titlebar */}
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

              <div className="cert-modal-title" title={item.title}>
                <span className="cert-modal-title-prefix">typing://</span>
                <span className="cert-modal-title-text">{item.fileName}</span>
              </div>

              <div className="cert-modal-header-actions">
                <span className="cert-counter-pill">
                  {currentIndex + 1} / {totalCount}
                </span>
                <button
                  type="button"
                  className="cert-modal-close-btn"
                  onClick={onClose}
                  title="Close (ESC)"
                  aria-label="Close modal"
                >
                  <span>✕</span>
                  <span className="close-shortcut">ESC</span>
                </button>
              </div>
            </div>

            {/* Terminal Toolbar */}
            <div className="cert-modal-toolbar">
              <div className="cert-modal-command">
                <span className="prompt">$</span>
                <span className="command-text">
                  monkeytype --record "{item.title.slice(0, 32)}..." --wpm {item.wpm}
                </span>
                <span className="terminal-cursor">▋</span>
              </div>

              <div className="cert-modal-actions">
                <a
                  href="https://monkeytype.com/profile/SharmaPranav1008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn cert-verify-btn"
                  title="Open Monkeytype Profile"
                >
                  <span>Monkeytype Profile ↗</span>
                </a>

                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn cert-action-btn"
                  title="Open original screenshot in new tab"
                >
                  <span>New Tab</span>
                </a>

                <a
                  href={item.fileUrl}
                  download={item.fileName}
                  className="cmd-btn cmd-btn-primary cert-action-btn"
                  title="Download screenshot"
                >
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Body Image Viewer */}
            <div className="cert-modal-body">
              {onPrev && (
                <button
                  type="button"
                  className="cert-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrev()
                  }}
                  title="Previous (←)"
                  aria-label="Previous record"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              <div className="cert-display-wrapper">
                <motion.div
                  key={item.id}
                  className={`cert-img-container ${isZoomed ? 'zoomed' : ''}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsZoomed(!isZoomed)}
                  title="Click to toggle zoom"
                >
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="cert-view-img typing-view-img"
                    loading="eager"
                  />
                </motion.div>
              </div>

              {onNext && (
                <button
                  type="button"
                  className="cert-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNext()
                  }}
                  title="Next (→)"
                  aria-label="Next record"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Details Bar */}
            <div className="cert-info-bar typing-info-bar">
              <div className="cert-info-col">
                <span className="info-label">Title</span>
                <span className="info-value cert-title-highlight">{item.title}</span>
              </div>
              <div className="cert-info-col">
                <span className="info-label">Speed & Accuracy</span>
                <span className="info-value typing-stat-val">
                  ⚡ {formatWpmDisplay(item.wpm)} • 🎯 {formatAccDisplay(item.accuracy)}
                </span>
              </div>
              <div className="cert-info-col">
                <span className="info-label">Category</span>
                <span className="info-value category-tag">{item.category}</span>
              </div>
              <div className="cert-info-col">
                <span className="info-label">Keyboard</span>
                <span className="info-value date-tag">{item.keyboard}</span>
              </div>
            </div>

            {/* Terminal Footer Bar */}
            <div className="cert-modal-footer">
              <div className="footer-status">
                <span className="status-dot green"></span>
                <span>Verified Typing Milestone</span>
                <span className="cert-cred-id">• {item.platform}</span>
              </div>
              <div className="footer-nav-hint">
                <span className="key-hint">← / →</span> Navigate •{' '}
                <span className="key-hint">ESC</span> Exit
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TypingModal
