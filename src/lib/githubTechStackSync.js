/**
 * GitHub Profile Tech Stack Auto-Sync Utility
 * Connects to: https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md
 * 
 * Automatically synchronizes technologies and tools from the GitHub Profile README
 * into the website's `./list-technologies.sh --visual` section.
 */

import cBadge from '../assets/skills/c.svg'
import cppBadge from '../assets/skills/cpp.svg'
import jsBadge from '../assets/skills/javascript.svg'
import javaBadge from '../assets/skills/java.svg'
import vercelBadge from '../assets/skills/vercel.svg'
import netlifyBadge from '../assets/skills/netlify.svg'
import renderBadge from '../assets/skills/render.svg'
import nodejsBadge from '../assets/skills/nodejs.svg'
import mysqlBadge from '../assets/skills/mysql.svg'
import mongodbBadge from '../assets/skills/mongodb.svg'
import canvaBadge from '../assets/skills/canva.svg'
import gitBadge from '../assets/skills/git.svg'
import githubBadge from '../assets/skills/github.svg'

export const GITHUB_PROFILE_README_URL =
  'https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md'

export const CACHE_KEY = 'pranav_portfolio_tech_stack_v1'
export const CACHE_TTL_MS = 1000 * 60 * 15 // 15 minutes cache

// Default baseline technologies with local SVGs for instant zero-latency loading
export const defaultSkillBadges = [
  { name: 'C', src: cBadge },
  { name: 'C++', src: cppBadge },
  { name: 'JavaScript', src: jsBadge },
  { name: 'Java', src: javaBadge },
  { name: 'Vercel', src: vercelBadge },
  { name: 'Netlify', src: netlifyBadge },
  { name: 'Render', src: renderBadge },
  { name: 'Node.js', src: nodejsBadge },
  { name: 'MySQL', src: mysqlBadge },
  { name: 'MongoDB', src: mongodbBadge },
  { name: 'Canva', src: canvaBadge },
  { name: 'Git', src: gitBadge },
  { name: 'GitHub', src: githubBadge }
]

// Map known badge names to local high-resolution SVGs
const localAssetMap = {
  c: cBadge,
  'c++': cppBadge,
  cpp: cppBadge,
  javascript: jsBadge,
  js: jsBadge,
  java: javaBadge,
  vercel: vercelBadge,
  netlify: netlifyBadge,
  render: renderBadge,
  'node.js': nodejsBadge,
  nodejs: nodejsBadge,
  node: nodejsBadge,
  mysql: mysqlBadge,
  mongodb: mongodbBadge,
  canva: canvaBadge,
  git: gitBadge,
  github: githubBadge
}

/**
 * Parse shields.io markdown image badges from the Tech Stack section of GitHub profile README
 */
export const parseTechBadgesFromMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return []

  const techSectionMatch = markdown.match(
    /#+\s*[^\n]*Tech\s*Stack[^\n]*\n([\s\S]*?)(?=\n#+\s*[^\n]*Stats|\n#+\s*[^\n]*$|$)/i
  )
  const section = techSectionMatch ? techSectionMatch[1] : markdown

  const badgeRegex = /!\[([^\]]+)\]\(((?:https:)?\/\/[^\s)]+)\)/g
  const badges = []
  const seen = new Set()
  let match

  while ((match = badgeRegex.exec(section)) !== null) {
    const rawName = match[1].trim()
    const url = match[2].trim()
    const normKey = rawName.toLowerCase().replace(/[-_.\s]/g, '')

    if (!seen.has(normKey)) {
      seen.add(normKey)
      const localSvg = localAssetMap[rawName.toLowerCase()] || localAssetMap[normKey]
      badges.push({
        name: rawName,
        url,
        src: localSvg || url
      })
    }
  }

  return badges
}

/**
 * Fetch and synchronize live technologies from GitHub Profile README
 * @param {boolean} forceRefresh
 * @returns {Promise<{badges: Array, fromCache: boolean}>}
 */
export const syncTechStackWithGitHub = async (forceRefresh = false) => {
  // 1. Read from localStorage cache first if not forced
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        const age = Date.now() - (parsed.timestamp || 0)
        if (age < CACHE_TTL_MS && Array.isArray(parsed.badges) && parsed.badges.length > 0) {
          return {
            badges: parsed.badges,
            fromCache: true
          }
        }
      }
    } catch (e) {
      console.warn('[TechStackSync] Cache read notice:', e)
    }
  }

  // 2. Fetch live README from GitHub
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4500)
    const res = await fetch(GITHUB_PROFILE_README_URL, {
      cache: 'no-cache',
      signal: controller.signal
    })
    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`GitHub returned HTTP ${res.status}`)
    }

    const text = await res.text()
    const liveBadges = parseTechBadgesFromMarkdown(text)

    if (liveBadges.length === 0) {
      return { badges: defaultSkillBadges, fromCache: false }
    }

    // Merge: ensure all live badges from GitHub are displayed
    const finalBadges = liveBadges.map((b) => {
      const normKey = b.name.toLowerCase().replace(/[-_.\s]/g, '')
      const local = localAssetMap[b.name.toLowerCase()] || localAssetMap[normKey]
      return {
        ...b,
        src: local || b.url
      }
    })

    // 3. Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            badges: finalBadges,
            timestamp: Date.now()
          })
        )
        window.dispatchEvent(new CustomEvent('tech-stack-synced', { detail: finalBadges }))
      } catch (e) {}
    }

    return {
      badges: finalBadges,
      fromCache: false
    }
  } catch (err) {
    console.warn('[TechStackSync] Live sync fallback notice:', err?.message || err)
    return {
      badges: defaultSkillBadges,
      fromCache: false
    }
  }
}

export default syncTechStackWithGitHub
