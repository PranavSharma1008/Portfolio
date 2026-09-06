import { motion } from "framer-motion"
import React, { useEffect, useMemo, useState } from "react"
import { cn } from "../lib/utils"

export const TypingText = ({
  children,
  as: Component = "div",
  className = "",
  delay = 0,
  duration = 2,
  fontSize = "",
  fontWeight = "",
  color = "",
  letterSpacing = "",
  align = "left",
  loop = false,
  pause = 2000,
}) => {
  const [animationKey, setAnimationKey] = useState(0)

  // Extract characters while preserving classNames from spans (e.g. <span className="accent">)
  const items = useMemo(() => {
    const extract = (node, inheritedClass = "") => {
      if (typeof node === "string" || typeof node === "number") {
        return node.toString().split("").map((char) => ({
          char: char === " " ? "\u00A0" : char,
          className: inheritedClass,
        }))
      }
      if (Array.isArray(node)) {
        return node.flatMap((child) => extract(child, inheritedClass))
      }
      if (React.isValidElement(node)) {
        const combined = [inheritedClass, node.props?.className].filter(Boolean).join(" ")
        return extract(node.props?.children, combined)
      }
      return []
    }
    return extract(children)
  }, [children])

  const fullText = useMemo(
    () => items.map((item) => (item.char === "\u00A0" ? " " : item.char)).join(""),
    [items]
  )

  useEffect(() => {
    if (!loop) return
    const totalTime = (delay + duration) * 1000 + pause
    const timer = setInterval(() => {
      setAnimationKey((k) => k + 1)
    }, totalTime)
    return () => clearInterval(timer)
  }, [loop, delay, duration, pause])

  const characterVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: delay + i * (duration / (items.length || 1)),
        duration: 0.25,
        ease: "easeInOut",
      },
    }),
  }

  const alignClass =
    align === "center"
      ? "justify-center text-center"
      : align === "right"
      ? "justify-end text-right"
      : "justify-start text-left"

  return React.createElement(
    Component,
    {
      className: cn("inline-flex", className, fontSize, fontWeight, color, letterSpacing, alignClass),
    },
    <motion.span
      key={animationKey}
      className="inline-block"
      initial="hidden"
      animate="visible"
      aria-label={fullText}
      role="text"
    >
      {items.map((item, index) => (
        <motion.span
          key={`${item.char}-${index}`}
          className={cn("inline-block", item.className)}
          variants={characterVariants}
          custom={index}
          initial="hidden"
          animate="visible"
        >
          {item.char}
        </motion.span>
      ))}
    </motion.span>
  )
}
