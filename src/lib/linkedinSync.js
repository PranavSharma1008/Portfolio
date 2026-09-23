/**
 * LinkedIn Real-Time Sync Engine
 * Connects to:
 * 1. https://www.linkedin.com/in/pranavsharma1008/
 * 2. https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md
 * 
 * Automatically fetches & syncs professional followers and profile metrics in real-time,
 * operating on the exact same multi-tiered auto-sync architecture as LeetCode and GitHub.
 */

export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/pranavsharma1008/'
export const LINKEDIN_USERNAME = 'pranavsharma1008'
export const DEFAULT_FOLLOWERS = '805'
export const DEFAULT_CONNECTIONS = '805+'

export const CACHE_KEY = 'pranav_portfolio_linkedin_sync_v3'
export const CACHE_TTL_MS = 1000 * 60 * 15 // 15 minutes cache

// Flush stale legacy cache keys from localStorage
if (typeof window !== 'undefined') {
  try {
    [
      'pranav_portfolio_linkedin_sync_v1',
      'pranav_portfolio_linkedin_sync_v2'
    ].forEach((k) => localStorage.removeItem(k))
  } catch (e) {}
}

/**
 * Fetch follower/connection metrics from GitHub Profile README or repository files.
 * Provides instant live sync if updated on GitHub.
 */
export const fetchLinkedInFromGitHub = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md?_t=${Date.now()}`,
      {
        headers: { Accept: 'text/plain' },
        cache: 'no-store',
        signal: controller.signal
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const text = await res.text()

      // 1. Explicit HTML comment: <!-- linkedin-followers: 805 -->
      const commentMatch = text.match(/<!--\s*linkedin[-_]followers?:\s*([0-9kK+,]+)\s*-->/i)
      if (commentMatch && commentMatch[1]) {
        const count = commentMatch[1].trim()
        const num = parseInt(count, 10)
        if (num >= 50 && num < 100000) {
          return {
            followers: count.replace(/\+$/, ''),
            connections: count.includes('+') ? count : `${count}+`,
            source: 'github-readme'
          }
        }
      }

      // 2. Specific Followers badge: badge/Followers-805-blue or badge/LinkedIn-805%20Followers-blue
      const badgeMatch =
        text.match(/badge\/(?:LinkedIn[-_])?(?:Followers?|Connections?)-([0-9kK+,]+)(?:%20|\s*followers?)?-[a-zA-Z0-9%#]+/i) ||
        text.match(/badge\/LinkedIn-([0-9kK+,]+)(?:%20|\s*)(?:followers?|connections?)-[a-zA-Z0-9%#]+/i)
      if (badgeMatch && badgeMatch[1]) {
        const count = badgeMatch[1].trim()
        const num = parseInt(count, 10)
        if (num >= 50 && num < 100000) {
          return {
            followers: count.replace(/\+$/, ''),
            connections: count.includes('+') ? count : `${count}+`,
            source: 'github-readme'
          }
        }
      }

      // 3. Plain markdown text: 805 followers or Followers: 805
      const textMatch =
        text.match(/(?:followers?|connections?)\s*[:=\-–—]\s*([0-9kK+,]+)/i) ||
        text.match(/\b([0-9kK+,]+)\s+(?:linkedin\s+)?followers\b/i)
      if (textMatch && textMatch[1]) {
        const count = textMatch[1].trim()
        const num = parseInt(count, 10)
        if (num >= 50 && num < 100000) {
          return {
            followers: count.replace(/\+$/, ''),
            connections: count.includes('+') ? count : `${count}+`,
            source: 'github-readme'
          }
        }
      }
    }
  } catch (e) {
    // Fall through
  }
  return null
}

/**
 * Main synchronizer for LinkedIn stats.
 * Uses multi-tiered live fetching:
 * 1. Serverless proxy endpoints (/api/linkedin, /.netlify/functions/linkedin)
 * 2. Live GitHub README badge detection
 * 3. Verified baseline fallback (805 followers)
 */
export const syncLinkedInStats = async (forceRefresh = false) => {
  // 1. Read cache first
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        const age = Date.now() - (parsed.timestamp || 0)
        if (age < CACHE_TTL_MS && parsed.data) {
          return {
            data: parsed.data,
            fromCache: true
          }
        }
      }
    } catch (e) {
      console.warn('LinkedIn cache read notice:', e)
    }
  }

  let liveData = null

  // 2A. Multi-tier live fetching via serverless proxies
  const endpoints = [
    `/api/linkedin${forceRefresh ? `?_t=${Date.now()}` : ''}`,
    `/.netlify/functions/linkedin${forceRefresh ? `?_t=${Date.now()}` : ''}`
  ]

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const json = await res.json()
        if (json && (json.followers || json.connections)) {
          const rawCount = json.followers || json.connections
          const cleanCount = String(rawCount).replace(/[^0-9+]/g, '')
          const num = parseInt(cleanCount, 10)
          // Sanity check: must be a realistic follower number
          if (num >= 50 && num < 100000) {
            liveData = {
              connections: json.connections || `${cleanCount}+`,
              followers: cleanCount.replace(/\+$/, ''),
              displayFollowers: `${cleanCount.replace(/\+$/, '')} Followers`,
              username: json.username || LINKEDIN_USERNAME,
              profileUrl: json.profileUrl || LINKEDIN_PROFILE_URL,
              isLive: true
            }
            break
          }
        }
      }
    } catch (e) {
      // Endpoint fallback
    }
  }

  // 2B. Direct GitHub Profile README metadata check
  if (!liveData) {
    const fromGh = await fetchLinkedInFromGitHub()
    if (fromGh) {
      liveData = {
        connections: fromGh.connections,
        followers: fromGh.followers,
        displayFollowers: `${fromGh.followers} Followers`,
        username: LINKEDIN_USERNAME,
        profileUrl: LINKEDIN_PROFILE_URL,
        isLive: true
      }
    }
  }

  // Fallback to verified baseline metrics (805 Followers)
  const finalData = liveData || {
    connections: DEFAULT_CONNECTIONS,
    followers: DEFAULT_FOLLOWERS,
    displayFollowers: `${DEFAULT_FOLLOWERS} Followers`,
    username: LINKEDIN_USERNAME,
    profileUrl: LINKEDIN_PROFILE_URL,
    isLive: false
  }

  // 3. Cache latest state and dispatch notification
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: finalData
        })
      )
      window.dispatchEvent(new CustomEvent('linkedin-synced', { detail: finalData }))
    } catch (e) {}
  }

  return {
    data: finalData,
    fromCache: false
  }
}

export default syncLinkedInStats
