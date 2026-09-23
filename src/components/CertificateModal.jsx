import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CertificateModal = ({
  isOpen,
  onClose,
  certificate,
  onNext,
  onPrev,
  currentIndex,
  totalCount
}) => {
  const [viewMode, setViewMode] = useState(
    certificate?.thumbnailUrl ? 'preview' : 'pdf'
  )
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset states when certificate changes
  useEffect(() => {
    setViewMode(certificate?.thumbnailUrl ? 'preview' : 'pdf')
    setIsZoomed(false)
    setImageError(false)
  }, [certificate?.id, certificate?.thumbnailUrl])

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

  if (!isOpen || !certificate) return null

  const isPdf = certificate.type === 'pdf'

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
            className="cert-modal-window"
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

              <div className="cert-modal-title" title={certificate.title}>
                <span className="cert-modal-title-prefix">cert://</span>
                <span className="cert-modal-title-text">{certificate.fileName}</span>
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
                  inspect --verified "{certificate.title.slice(0, 36)}
                  {certificate.title.length > 36 ? '...' : ''}"
                </span>
                <span className="terminal-cursor">▋</span>
              </div>

              <div className="cert-modal-actions">
                {isPdf && (
                  <div className="cert-view-toggle">
                    <button
                      type="button"
                      className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                      onClick={() => setViewMode('preview')}
                      title="High resolution rendered preview"
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                      onClick={() => setViewMode('pdf')}
                      title="Interactive PDF document viewer"
                    >
                      PDF Doc
                    </button>
                  </div>
                )}

                {certificate.verifyUrl && (
                  <a
                    href={certificate.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cmd-btn cert-verify-btn"
                    title="Verify credential on official platform"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>Verify</span>
                  </a>
                )}

                <a
                  href={certificate.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn cert-action-btn"
                  title="Open certificate in a new browser tab"
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
                  <span>New Tab</span>
                </a>

                <a
                  href={certificate.fileUrl}
                  download={certificate.fileName}
                  className="cmd-btn cmd-btn-primary cert-action-btn"
                  title="Download certificate"
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Certificate Body Container */}
            <div className="cert-modal-body">
              {/* Previous Button */}
              {onPrev && (
                <button
                  type="button"
                  className="cert-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrev()
                  }}
                  title="Previous Certificate (←)"
                  aria-label="Previous Certificate"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              {/* Certificate Content Display */}
              <div className="cert-display-wrapper">
                <AnimatePresence mode="wait">
                  {isPdf && viewMode === 'pdf' ? (
                    <motion.div
                      key={`pdf-${certificate.id}`}
                      className="cert-pdf-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <object
                        data={`${certificate.fileUrl}#view=FitH`}
                        type="application/pdf"
                        className="cert-pdf-frame"
                        aria-label={certificate.title}
                      >
                        <iframe
                          src={`${certificate.fileUrl}#view=FitH`}
                          title={certificate.title}
                          className="cert-pdf-frame"
                        >
                          <div className="cert-fallback-box">
                            <p>Unable to display inline PDF in this browser.</p>
                            <a
                              href={certificate.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cmd-btn cmd-btn-primary"
                            >
                              Open in New Tab
                            </a>
                          </div>
                        </iframe>
                      </object>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`img-${certificate.id}`}
                      className={`cert-img-container ${isZoomed ? 'zoomed' : ''}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => !imageError && setIsZoomed(!isZoomed)}
                      title={imageError ? 'Certificate image unavailable' : 'Click to toggle zoom'}
                    >
                      {imageError ? (
                        <div className="cert-fallback-box" style={{ padding: '40px 20px', textAlign: 'center' }}>
                          <p style={{ color: '#ef4444', marginBottom: '16px' }}>Certificate file is no longer available in the repository.</p>
                          {certificate.verifyUrl && (
                            <a
                              href={certificate.verifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cmd-btn cmd-btn-primary"
                            >
                              Check GitHub Repo
                            </a>
                          )}
                        </div>
                      ) : (
                        <img
                          src={certificate.thumbnailUrl || certificate.fileUrl}
                          alt={certificate.title}
                          className="cert-view-img"
                          loading="eager"
                          onError={() => setImageError(true)}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Button */}
              {onNext && (
                <button
                  type="button"
                  className="cert-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNext()
                  }}
                  title="Next Certificate (→)"
                  aria-label="Next Certificate"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Certificate Details Info Bar */}
            <div className="cert-info-bar">
              <div className="cert-info-col">
                <span className="info-label">Title</span>
                <span className="info-value cert-title-highlight">
                  {certificate.title}
                </span>
              </div>

              <div className="cert-info-col">
                <span className="info-label">Issuer</span>
                <span className="info-value issuer-tag">
                  <span
                    className="issuer-dot"
                    style={{ background: certificate.badge?.color || '#00d4ff' }}
                  />
                  {certificate.issuer}
                </span>
              </div>

              <div className="cert-info-col">
                <span className="info-label">Category</span>
                <span className="info-value category-tag">
                  {certificate.category}
                </span>
              </div>

              <div className="cert-info-col">
                <span className="info-label">Date</span>
                <span className="info-value date-tag">{certificate.date}</span>
              </div>
            </div>

            {/* Terminal Footer Bar */}
            <div className="cert-modal-footer">
              <div className="footer-status">
                <span className="status-dot green"></span>
                <span>Verified Credential</span>
                {certificate.credentialId && (
                  <span className="cert-cred-id">
                    • ID: {certificate.credentialId}
                  </span>
                )}
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

export default CertificateModal
