/**
 * LinkedIn Real-Time Sync Engine
 * Connects to: https://www.linkedin.com/in/pranavsharma1008/
 * Automatically fetches & syncs professional connections and profile metrics
 */

export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/pranavsharma1008/'
export const LINKEDIN_USERNAME = 'pranavsharma1008'
export const DEFAULT_CONNECTIONS = '700+'

export const CACHE_KEY = 'pranav_portfolio_linkedin_sync_v1'
export const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

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

  // 2. Multi-tier live fetching strategy
  const endpoints = [
    '/api/linkedin',
    '/.netlify/functions/linkedin'
  ]

  let liveData = null

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
        if (json && (json.connections || json.followers)) {
          liveData = {
            connections: json.connections || DEFAULT_CONNECTIONS,
            followers: json.followers || json.connections || DEFAULT_CONNECTIONS,
            username: json.username || LINKEDIN_USERNAME,
            profileUrl: json.profileUrl || LINKEDIN_PROFILE_URL
          }
          break
        }
      }
    } catch (e) {
      // Endpoint fallback
    }
  }

  // Fallback to baseline metrics
  const finalData = liveData || {
    connections: DEFAULT_CONNECTIONS,
    followers: DEFAULT_CONNECTIONS,
    username: LINKEDIN_USERNAME,
    profileUrl: LINKEDIN_PROFILE_URL
  }

  // 3. Cache latest state
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
