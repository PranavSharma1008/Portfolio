import { useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const MagneticButton = ({
  children,
  strength = 0.4,
  radius = 80,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  style = {},
  as: Tag = 'button',
  href,
  target,
  rel,
}) => {
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const springConfig = { stiffness: 200, damping: 18, mass: 0.6 }

  const rawX = useSpring(0, springConfig)
  const rawY = useSpring(0, springConfig)

  const textX = useTransform(rawX, (v) => v * 0.4)
  const textY = useTransform(rawY, (v) => v * 0.4)

  const handleMouseMove = (e) => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const dist = Math.sqrt(distX ** 2 + distY ** 2)

    if (dist < radius) {
      rawX.set(distX * strength)
      rawY.set(distY * strength)
      setIsHovered(true)
    } else {
      rawX.set(0)
      rawY.set(0)
      setIsHovered(false)
    }
  }

  const handleMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
    setIsHovered(false)
  }

  const variants = {
    primary: 'mag-btn-primary',
    outline: 'mag-btn-outline',
    ghost: 'mag-btn-ghost',
    dark: 'mag-btn-dark',
  }

  const sizes = {
    sm: 'mag-btn-sm',
    md: 'mag-btn-md',
    lg: 'mag-btn-lg',
  }

  const TagName = Tag === 'a' ? motion.a : motion.button

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex', padding: radius * 0.25, ...style }}
    >
      <TagName
        type={Tag === 'button' ? 'button' : undefined}
        onClick={onClick}
        href={href}
        target={target}
        rel={rel}
        style={{ x: rawX, y: rawY }}
        animate={{ scale: isHovered ? 1.04 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`mag-btn-base ${variants[variant]} ${sizes[size]} ${className}`}
      >
        <motion.span
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="mag-btn-glow"
        />

        <motion.span
          style={{ x: textX, y: textY }}
          className="mag-btn-content"
        >
          {children}
        </motion.span>
      </TagName>
    </div>
  )
}

export default MagneticButton
