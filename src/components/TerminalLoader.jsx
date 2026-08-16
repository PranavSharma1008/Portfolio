import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const USERNAME_TARGET = 'Pranavsharma'
const PASSWORD_TARGET = '******'

const TerminalLoader = ({ onComplete }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(0) // 0: init, 1: type username, 2: password prompt, 3: type password, 4: verifying, 5: granted, 6: done
  const [progress, setProgress] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  const handleFinish = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onComplete()
    }, 450)
  }, [isClosing, onComplete])

  // Keyboard shortcut (ESC or Enter or Space) to skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFinish])

  // Step sequencer
  useEffect(() => {
    // Start typing username after initial terminal mount
    const timer1 = setTimeout(() => {
      setStep(1)
    }, 400)

    return () => clearTimeout(timer1)
  }, [])

  // Type username
  useEffect(() => {
    if (step !== 1) return

    let i = 0
    const interval = setInterval(() => {
      if (i < USERNAME_TARGET.length) {
        setUsername(USERNAME_TARGET.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setStep(2) // Move to password prompt
        }, 300)
      }
    }, 70)

    return () => clearInterval(interval)
  }, [step])

  // Password prompt and typing
  useEffect(() => {
    if (step !== 2) return

    const timer = setTimeout(() => {
      setStep(3) // Start typing password
    }, 250)

    return () => clearTimeout(timer)
  }, [step])

  useEffect(() => {
    if (step !== 3) return

    let i = 0
    const interval = setInterval(() => {
      if (i < PASSWORD_TARGET.length) {
        setPassword(PASSWORD_TARGET.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setStep(4) // Verifying
        }, 300)
      }
    }, 85)

    return () => clearInterval(interval)
  }, [step])

  // Verifying and Access Granted
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        setStep(5) // Access Granted & Progress
      }, 400)
      return () => clearTimeout(timer)
    }

    if (step === 5) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => {
              setStep(6)
              handleFinish()
            }, 350)
            return 100
          }
          return prev + 25
        })
      }, 70)

      return () => clearInterval(progressInterval)
    }
  }, [step, handleFinish])

  const getProgressBar = (pct) => {
    const totalBars = 20
    const filledBars = Math.round((pct / 100) * totalBars)
    const emptyBars = totalBars - filledBars
    return '█'.repeat(filledBars) + '░'.repeat(emptyBars)
  }

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          className="terminal-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          <div className="terminal-loader-bg-glow" />

          <motion.div
            className="terminal-loader-window"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Terminal Titlebar */}
            <div className="terminal-loader-header">
              <div className="terminal-loader-dots">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>
              <div className="terminal-loader-title">auth.sh — bash — 80x24</div>
              <button
                className="terminal-loader-skip-btn"
                onClick={handleFinish}
                title="Skip animation (ESC)"
              >
                Skip [ESC]
              </button>
            </div>

            {/* Terminal Screen Content */}
            <div className="terminal-loader-body">
              <div className="terminal-loader-line text-muted">
                <span className="terminal-loader-comment"># Establishing secure SSH handshake...</span>
              </div>
              <div className="terminal-loader-line text-muted">
                <span className="terminal-loader-success">●</span> Connected to <span className="text-cyan">portfolio.pranavsharma.dev</span> [127.0.0.1]
              </div>
              <div className="terminal-loader-line text-muted">
                SSH-2.0-OpenSSH_9.2p1 Debian-2+deb12u2
              </div>

              <div className="terminal-loader-divider" />

              {/* Login line */}
              <div className="terminal-loader-line">
                <span className="terminal-loader-prompt">pranav@portfolio:~$</span>
                <span className="terminal-loader-label"> login: </span>
                <span className="terminal-loader-input text-accent">{username}</span>
                {step <= 1 && <span className="terminal-loader-cursor">▋</span>}
              </div>

              {/* Password line */}
              {step >= 2 && (
                <div className="terminal-loader-line">
                  <span className="terminal-loader-prompt">pranav@portfolio:~$</span>
                  <span className="terminal-loader-label"> Password: </span>
                  <span className="terminal-loader-input text-cyan">{password}</span>
                  {(step === 2 || step === 3) && <span className="terminal-loader-cursor">▋</span>}
                </div>
              )}

              {/* Verification & Access Granted */}
              {step >= 4 && (
                <div className="terminal-loader-line text-muted">
                  <span className="terminal-loader-spinner">⠋</span> Verifying credentials with system auth daemon...
                </div>
              )}

              {step >= 5 && (
                <>
                  <div className="terminal-loader-line">
                    <span className="terminal-loader-badge-granted">[ ACCESS GRANTED ]</span>
                    <span className="terminal-loader-welcome"> Welcome, <strong>Pranav Sharma</strong>!</span>
                  </div>

                  <div className="terminal-loader-line text-muted">
                    <span>Initializing environment: </span>
                    <span className="terminal-loader-progress text-accent">[{getProgressBar(progress)}] {progress}%</span>
                  </div>

                  <div className="terminal-loader-line text-muted">
                    <span className="terminal-loader-success">✔</span> Launching interactive portfolio workspace...
                  </div>
                </>
              )}
            </div>

            {/* Terminal Status bar footer */}
            <div className="terminal-loader-footer">
              <span>UTF-8</span>
              <span>bash 5.2.15</span>
              <span>{step >= 5 ? 'Status: Authenticated' : 'Status: Authenticating...'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TerminalLoader
