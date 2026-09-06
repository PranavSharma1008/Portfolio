import React, { useRef, useMemo } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { cn } from "../lib/utils"

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function ScrollReveal({
  children,
  containerClassName,
  textClassName,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  staggerDelay = 0.05,
  threshold = 0.5,
  duration = 0.8,
  springConfig = {
    damping: 25,
    stiffness: 100,
    mass: 1,
  },
  align = "left",
}) {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, {
    amount: threshold,
    once: false,
  })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const rotation = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [baseRotation, 0, 0]
  )

  const splitText = useMemo(() => {
    const extractTokens = (node, isStrong = false) => {
      if (typeof node === "string" || typeof node === "number") {
        return node
          .toString()
          .split(/(\s+)/)
          .filter((part) => part.length > 0)
          .map((part) => ({
            value: part,
            isSpace: /^\s+$/.test(part),
            isStrong,
          }))
      }
      if (Array.isArray(node)) {
        return node.flatMap((child) => extractTokens(child, isStrong))
      }
      if (React.isValidElement(node)) {
        const strong = isStrong || node.type === "strong"
        return extractTokens(node.props?.children, strong)
      }
      return []
    }
    return extractTokens(children)
  }, [children])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: baseOpacity,
      filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        ...springConfig,
        duration,
      },
    },
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ rotate: rotation }}
      className={cn("my-5", containerClassName)}
    >
      <motion.p
        className={cn(
          alignClasses[align] || "",
          textClassName
        )}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {splitText.map((item, index) =>
          item.isSpace ? (
            <span key={`space-${index}`}>{item.value}</span>
          ) : (
            <motion.span
              key={`word-${index}`}
              className="inline-block"
              variants={wordVariants}
            >
              {item.isStrong ? <strong>{item.value}</strong> : item.value}
            </motion.span>
          )
        )}
      </motion.p>
    </motion.div>
  )
}

export default ScrollReveal
