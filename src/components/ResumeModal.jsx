import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ResumeModal = ({ isOpen, onClose }) => {
  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="resume-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="resume-modal-window"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Titlebar */}
            <div className="resume-modal-header">
              <div className="resume-modal-dots">
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

              <div className="resume-modal-title">
                pranav_sharma_resume.pdf — bash
              </div>

              <button
                type="button"
                className="resume-modal-close-btn"
                onClick={onClose}
                title="Close (ESC)"
                aria-label="Close modal"
              >
                <span>✕</span>
                <span className="close-shortcut">ESC</span>
              </button>
            </div>

            {/* Terminal Action Toolbar */}
            <div className="resume-modal-toolbar">
              <div className="resume-modal-command">
                <span className="prompt">$</span>
                <span className="command-text">cat pranav_sharma_resume.pdf</span>
                <span className="terminal-cursor">▋</span>
              </div>

              <div className="resume-modal-actions">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn resume-action-btn"
                  title="Open resume in full new tab"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
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
                  <span>Open in New Tab</span>
                </a>

                <a
                  href="/Pranav_Sharma_Resume.pdf"
                  download="Pranav_Sharma_Resume.pdf"
                  className="cmd-btn cmd-btn-primary resume-action-btn"
                  title="Download resume PDF"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {/* Terminal PDF Body */}
            <div className="resume-modal-body">
              <object
                data="/resume.pdf#view=FitH"
                type="application/pdf"
                className="resume-pdf-frame"
                aria-label="Pranav Sharma Resume PDF"
              >
                <iframe
                  src="/resume.pdf#view=FitH"
                  title="Pranav Sharma Resume"
                  className="resume-pdf-frame"
                >
                  <div className="resume-modal-fallback">
                    <p>Your browser doesn't support inline PDF preview.</p>
                    <div className="fallback-buttons">
                      <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cmd-btn"
                      >
                        View in New Tab
                      </a>
                      <a
                        href="/Pranav_Sharma_Resume.pdf"
                        download="Pranav_Sharma_Resume.pdf"
                        className="cmd-btn cmd-btn-primary"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </iframe>
              </object>
            </div>

            {/* Terminal Footer Bar */}
            <div className="resume-modal-footer">
              <div className="footer-status">
                <span className="status-dot"></span>
                <span>Ready • 1 page • PDF 1.5</span>
              </div>
              <span className="footer-hint">Click outside or press ESC to exit</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ResumeModal
