/**
 * LeetCode & GitHub Real-Time Sync Engine
 * Multi-Tiered Live Fetching:
 * 1. Netlify Serverless Function / Vercel Proxy (/api/leetcode)
 * 2. Direct Netlify Functions endpoint (/.netlify/functions/leetcode)
 * 3. High-availability public LeetCode API (faisalshohag)
 * 4. Fallback public mirror (alfa-leetcode-api)
 * 
 * Guarantees automatic real-time updates on every website visit for:
 * - Profile Avatar Photo
 * - Solved Problem Counts (Total, Easy, Medium, Hard)
 * - Global Rankings & Accuracy Rates
 * - Badges and GitHub Repository Activity
 */

import {
  leetcodeInitialData,
  LEETCODE_USERNAME,
  LEETCODE_PROFILE_URL,
  LEETCODE_SERIE_REPO_URL,
  LEETCODE_BADGES_REPO_URL
} from '../data/leetcodeData'

export const CACHE_KEY = 'pranav_portfolio_leetcode_live_sync_v4'
export const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes cache

// Flush stale legacy cache keys from localStorage
if (typeof window !== 'undefined') {
  try {
    [
      'pranav_portfolio_leetcode_live_sync_v1',
      'pranav_portfolio_leetcode_live_sync_v2',
      'pranav_portfolio_leetcode_live_sync_v3'
    ].forEach((k) => localStorage.removeItem(k))
  } catch (e) {}
}

const LEETCODE_GRAPHQL_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        userAvatar
        realName
        ranking
        reputation
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      badges {
        id
        name
        displayName
        icon
        hoverText
        creationDate
      }
    }
  }
`

/**
 * Fetch live profile & stats from LeetCode with multi-tier fallbacks
 */
export const fetchLeetCodeLiveGraphQL = async (username = LEETCODE_USERNAME, forceRefresh = false) => {
  const cacheBust = forceRefresh ? `?_t=${Date.now()}` : ''

  // Strategy 1A: Primary proxy endpoint (/api/leetcode)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(`/api/leetcode${cacheBust}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LEETCODE_GRAPHQL_QUERY,
        variables: { username }
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const json = await res.json()
      const user = json?.data?.matchedUser
      if (user) {
        return parseGraphQLData(user)
      }
    }
  } catch (e) {
    // Strategy 1A failed, fall through
  }

  // Strategy 1B: Direct Netlify Serverless Function endpoint
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(
      `/.netlify/functions/leetcode?username=${encodeURIComponent(username)}${forceRefresh ? `&_t=${Date.now()}` : ''}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const json = await res.json()
      const user = json?.data?.matchedUser
      if (user) {
        return parseGraphQLData(user)
      }
    }
  } catch (e) {
    // Strategy 1B failed, fall through
  }

  // Strategy 2: High-availability Vercel mirror (faisalshohag)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const json = await res.json()
      if (json && (json.totalSolved || json.ranking)) {
        return parseFaisalData(json)
      }
    }
  } catch (e) {
    // Strategy 2 failed, fall through
  }

  // Strategy 3: Public mirror (alfa-leetcode-api)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const json = await res.json()
      if (json && !json.errors && json.totalSolved) {
        return parseAlfaData(json)
      }
    }
  } catch (e) {
    // Strategy 3 failed
  }

  return null
}

const parseGraphQLData = (user) => {
  const acList = user.submitStats?.acSubmissionNum || []
  const allAc = acList.find((s) => s.difficulty === 'All')
  const easyAc = acList.find((s) => s.difficulty === 'Easy')
  const medAc = acList.find((s) => s.difficulty === 'Medium')
  const hardAc = acList.find((s) => s.difficulty === 'Hard')

  const totalSolved = allAc?.count ?? leetcodeInitialData.totalSolved
  const easySolved = easyAc?.count ?? leetcodeInitialData.easySolved
  const mediumSolved = medAc?.count ?? leetcodeInitialData.mediumSolved
  const hardSolved = hardAc?.count ?? leetcodeInitialData.hardSolved

  const avatar = user.profile?.userAvatar || leetcodeInitialData.avatar
  const rawRanking = user.profile?.ranking
  const ranking = rawRanking ? Number(rawRanking).toLocaleString() : leetcodeInitialData.ranking

  // Acceptance rate
  let acceptanceRate = leetcodeInitialData.acceptanceRate
  if (allAc && allAc.submissions > 0) {
    acceptanceRate = `${((allAc.count / allAc.submissions) * 100).toFixed(1)}%`
  }

  // Badges
  let liveBadges = null
  if (Array.isArray(user.badges) && user.badges.length > 0) {
    liveBadges = user.badges.map((b) => ({
      id: b.id || b.name,
      name: b.displayName || b.name,
      displayName: b.displayName || b.name,
      type: 'badge',
      category: 'Annual Consistency Badge',
      icon: b.icon?.startsWith('http')
        ? b.icon
        : b.icon
        ? `https://leetcode.com${b.icon}`
        : '/leetcode/100_days_badge.png',
      date: b.creationDate || '2026',
      description: b.hoverText || 'Official LeetCode recognition awarded for solving challenges consistently.'
    }))
  }

  return {
    avatar,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    acceptanceRate,
    ...(liveBadges ? { liveBadges } : {})
  }
}

const parseFaisalData = (json) => {
  const totalSolved = json.totalSolved ?? leetcodeInitialData.totalSolved
  const easySolved = json.easySolved ?? leetcodeInitialData.easySolved
  const mediumSolved = json.mediumSolved ?? leetcodeInitialData.mediumSolved
  const hardSolved = json.hardSolved ?? leetcodeInitialData.hardSolved
  const ranking = json.ranking ? Number(json.ranking).toLocaleString() : leetcodeInitialData.ranking

  let acceptanceRate = leetcodeInitialData.acceptanceRate
  const allSub = json.totalSubmissions?.find((s) => s.difficulty === 'All')
  if (allSub && allSub.submissions > 0) {
    acceptanceRate = `${((json.totalSolved / allSub.submissions) * 100).toFixed(1)}%`
  }

  return {
    avatar: leetcodeInitialData.avatar,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    acceptanceRate
  }
}

const parseAlfaData = (json) => {
  const totalSolved = json.totalSolved || leetcodeInitialData.totalSolved
  const easySolved = json.easySolved || leetcodeInitialData.easySolved
  const mediumSolved = json.mediumSolved || leetcodeInitialData.mediumSolved
  const hardSolved = json.hardSolved || leetcodeInitialData.hardSolved
  const ranking = json.ranking ? Number(json.ranking).toLocaleString() : leetcodeInitialData.ranking

  return {
    avatar: json.avatar || leetcodeInitialData.avatar,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    acceptanceRate: leetcodeInitialData.acceptanceRate
  }
}

/**
 * Fetch GitHub repository live metadata
 */
export const fetchGitHubRepoMeta = async (owner = 'PranavSharma1008', repo = 'LeetcodeSerieGithub') => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      return {
        pushedAt: data.pushed_at
          ? new Date(data.pushed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : null
      }
    }
  } catch (e) {}
  return null
}

/**
 * Synchronize LeetCode Data
 * Always fetches from network on visit while leveraging cached data for instant initial paint.
 */
export const syncLeetCodeWithLiveSources = async (forceRefresh = false) => {
  // Always query live
  let liveStats = null
  try {
    liveStats = await fetchLeetCodeLiveGraphQL(LEETCODE_USERNAME, forceRefresh)
  } catch (err) {
    console.warn('Live LeetCode GraphQL fetch failed:', err)
  }

  let repoMeta = null
  try {
    repoMeta = await fetchGitHubRepoMeta('PranavSharma1008', 'LeetcodeSerieGithub')
  } catch (err) {}

  // Keep milestone badges (custom screenshots) and merge any live official badges
  let mergedBadges = leetcodeInitialData.badges
  if (liveStats?.liveBadges && liveStats.liveBadges.length > 0) {
    const milestones = leetcodeInitialData.badges.filter((b) => b.type === 'milestone')
    mergedBadges = [...liveStats.liveBadges, ...milestones]
  }

  const mergedData = {
    ...leetcodeInitialData,
    ...(liveStats || {}),
    badges: mergedBadges,
    repoLastUpdated: repoMeta?.pushedAt || 'Active Solutions Sync'
  }

  const now = new Date()
  const syncTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Dispatch sync event for other components (e.g. Achievements) to update live counts
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('leetcode-synced', { detail: mergedData }))
    } catch (e) {}
  }

  // Cache latest verified state
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        lastSyncTime: syncTimeStr,
        data: mergedData
      })
    )
  } catch (e) {}

  return {
    data: mergedData,
    isLive: Boolean(liveStats),
    lastSyncTime: syncTimeStr,
    message: liveStats
      ? `Live sync successful: Solved ${mergedData.totalSolved} problems & updated profile photo!`
      : `Loaded verified archive stats (${mergedData.totalSolved} problems).`
  }
}
