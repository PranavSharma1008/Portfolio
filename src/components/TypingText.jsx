import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"
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
  const [textContent, setTextContent] = useState("")
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const extractText = (node) => {
      if (typeof node === "string" || typeof node === "number") {
        return node.toString()
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join("")
      }
      if (React.isValidElement(node)) {
        const element = node
        if (typeof element.props.children !== "undefined") {
          return extractText(element.props.children)
        }
      }
      return ""
    }

    setTextContent(extractText(children))
  }, [children])

  useEffect(() => {
    if (!loop) return
    const totalTime = (delay + duration) * 1000 + pause
    const timer = setInterval(() => {
      setAnimationKey((k) => k + 1)
    }, totalTime)
    return () => clearInterval(timer)
  }, [loop, delay, duration, pause])

  const characters = textContent.split("").map((char) =>
    char === " " ? "\u00A0" : char
  )

  const characterVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: delay + i * (duration / characters.length),
        duration: 0.3,
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
      aria-label={textContent}
      role="text"
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          variants={characterVariants}
          custom={index}
          initial="hidden"
          animate="visible"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}
