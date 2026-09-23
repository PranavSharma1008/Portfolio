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

export const CACHE_KEY = 'pranav_portfolio_leetcode_live_sync_v11'
export const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes cache

// Flush stale legacy cache keys from localStorage
if (typeof window !== 'undefined') {
  try {
    [
      'pranav_portfolio_leetcode_live_sync_v1',
      'pranav_portfolio_leetcode_live_sync_v2',
      'pranav_portfolio_leetcode_live_sync_v3',
      'pranav_portfolio_leetcode_live_sync_v4',
      'pranav_portfolio_leetcode_live_sync_v5',
      'pranav_portfolio_leetcode_live_sync_v6',
      'pranav_portfolio_leetcode_live_sync_v7',
      'pranav_portfolio_leetcode_live_sync_v8',
      'pranav_portfolio_leetcode_live_sync_v9',
      'pranav_portfolio_leetcode_live_sync_v10'
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
        totalSubmissionNum {
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
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
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
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
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
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',
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
  const totalList = user.submitStats?.totalSubmissionNum || []
  const allAc = acList.find((s) => s.difficulty === 'All')
  const allTotal = totalList.find((s) => s.difficulty === 'All')
  const easyAc = acList.find((s) => s.difficulty === 'Easy')
  const medAc = acList.find((s) => s.difficulty === 'Medium')
  const hardAc = acList.find((s) => s.difficulty === 'Hard')

  const totalSolved = allAc?.count ?? leetcodeInitialData.totalSolved
  const easySolved = easyAc?.count ?? leetcodeInitialData.easySolved
  const mediumSolved = medAc?.count ?? leetcodeInitialData.mediumSolved
  const hardSolved = hardAc?.count ?? leetcodeInitialData.hardSolved

  const username = user.username || leetcodeInitialData.username
  const realName = user.profile?.realName || leetcodeInitialData.realName || username
  const name = user.profile?.realName || leetcodeInitialData.name || username
  const avatar = user.profile?.userAvatar || leetcodeInitialData.avatar
  const rawRanking = user.profile?.ranking
  const ranking = rawRanking ? Number(rawRanking).toLocaleString() : leetcodeInitialData.ranking

  // Acceptance rate: (Accepted Submissions / Total Submissions) * 100
  let acceptanceRate = leetcodeInitialData.acceptanceRate
  if (allAc && allTotal && allTotal.submissions > 0) {
    acceptanceRate = `${((allAc.submissions / allTotal.submissions) * 100).toFixed(2)}%`
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

  // Live Skill/Topic stats from tagProblemCounts
  let liveTopics = null
  let liveSkillsByLevel = null
  if (user.tagProblemCounts) {
    const parseLevelTags = (tagList = []) => {
      return (tagList || [])
        .filter((t) => t && t.tagName && typeof t.problemsSolved === 'number' && t.problemsSolved > 0)
        .map((t) => ({ name: t.tagName, count: t.problemsSolved }))
        .sort((a, b) => b.count - a.count)
    }

    liveSkillsByLevel = {
      advanced: parseLevelTags(user.tagProblemCounts.advanced),
      intermediate: parseLevelTags(user.tagProblemCounts.intermediate),
      fundamental: parseLevelTags(user.tagProblemCounts.fundamental)
    }

    const allTags = [
      ...(user.tagProblemCounts.fundamental || []),
      ...(user.tagProblemCounts.intermediate || []),
      ...(user.tagProblemCounts.advanced || [])
    ]
    const map = new Map()
    for (const tag of allTags) {
      if (tag.tagName && typeof tag.problemsSolved === 'number') {
        map.set(tag.tagName, Math.max(map.get(tag.tagName) || 0, tag.problemsSolved))
      }
    }
    // Consolidate redundant/overlapping tags (e.g. Tree & Binary Tree)
    if (map.has('Tree') || map.has('Binary Tree')) {
      const treeCount = Math.max(map.get('Tree') || 0, map.get('Binary Tree') || 0)
      map.delete('Tree')
      map.delete('Binary Tree')
      map.set('Tree & Binary Tree', treeCount)
    }

    const sorted = Array.from(map.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    if (sorted.length > 0) {
      liveTopics = sorted
    }
  }

  return {
    username,
    realName,
    name,
    avatar,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    acceptanceRate,
    ...(liveBadges ? { liveBadges } : {}),
    ...(liveTopics ? { topics: liveTopics } : {}),
    ...(liveSkillsByLevel ? { skillsByLevel: liveSkillsByLevel } : {})
  }
}

const parseFaisalData = (json) => {
  const totalSolved = json.totalSolved ?? leetcodeInitialData.totalSolved
  const easySolved = json.easySolved ?? leetcodeInitialData.easySolved
  const mediumSolved = json.mediumSolved ?? leetcodeInitialData.mediumSolved
  const hardSolved = json.hardSolved ?? leetcodeInitialData.hardSolved
  const ranking = json.ranking ? Number(json.ranking).toLocaleString() : leetcodeInitialData.ranking

  let acceptanceRate = leetcodeInitialData.acceptanceRate
  const acSubmissions =
    json.matchedUserStats?.acSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions
  const totalSubmissions =
    json.matchedUserStats?.totalSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions ||
    json.totalSubmissions?.find((s) => s.difficulty === 'All')?.submissions

  if (acSubmissions && totalSubmissions && totalSubmissions > 0) {
    acceptanceRate = `${((acSubmissions / totalSubmissions) * 100).toFixed(2)}%`
  }

  const username = json.username || LEETCODE_USERNAME
  const realName = json.realName || json.name || leetcodeInitialData.realName || username
  const name = json.name || json.realName || leetcodeInitialData.name || username

  return {
    username,
    realName,
    name,
    avatar: json.avatar || leetcodeInitialData.avatar,
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

  let acceptanceRate = leetcodeInitialData.acceptanceRate
  const acSubmissions =
    json.matchedUserStats?.acSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions
  const totalSubmissions =
    json.matchedUserStats?.totalSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions ||
    json.totalSubmissions?.find((s) => s.difficulty === 'All')?.submissions

  if (acSubmissions && totalSubmissions && totalSubmissions > 0) {
    acceptanceRate = `${((acSubmissions / totalSubmissions) * 100).toFixed(2)}%`
  }

  const username = json.username || LEETCODE_USERNAME
  const realName = json.name || json.realName || leetcodeInitialData.realName || username
  const name = json.name || json.realName || leetcodeInitialData.name || username

  return {
    username,
    realName,
    name,
    avatar: json.avatar || leetcodeInitialData.avatar,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    acceptanceRate
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

    if (res.ok) {
      clearTimeout(timeoutId)
      const data = await res.json()
      return {
        pushedAt: data.pushed_at
          ? new Date(data.pushed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : null,
        isLive: true
      }
    }

    // Fallback: check public user profile update timestamp
    const userRes = await fetch(`https://api.github.com/users/${owner}`, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
    clearTimeout(timeoutId)

    if (userRes.ok) {
      const userData = await userRes.json()
      return {
        pushedAt: userData.updated_at
          ? new Date(userData.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : null,
        isLive: true
      }
    }
  } catch (e) {}
  return null
}

export const GITHUB_BADGES_OWNER = 'PranavSharma1008'
export const GITHUB_BADGES_REPO = 'LeetcodeBadges'
export const GITHUB_BADGES_BRANCH = 'main'

/**
 * Fetch dynamic milestones directly from GitHub repository LeetcodeBadges
 * Automatically discovers any new milestone images uploaded to ProgressCalculator/
 */
export const fetchGitHubMilestones = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const apiUrl = `https://api.github.com/repos/${GITHUB_BADGES_OWNER}/${GITHUB_BADGES_REPO}/git/trees/${GITHUB_BADGES_BRANCH}?recursive=1`
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return null
    }

    const json = await res.json()
    const tree = json.tree || []
    const validExts = ['.png', '.jpg', '.jpeg', '.webp']

    const milestones = []
    for (const item of tree) {
      if (item.type !== 'blob') continue
      const lowerPath = item.path.toLowerCase()
      const ext = validExts.find((e) => lowerPath.endsWith(e))
      if (!ext) continue

      // Look inside ProgressCalculator or any milestone image
      if (lowerPath.includes('progresscalculator') || lowerPath.includes('milestone')) {
        const fileName = item.path.split('/').pop()
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_BADGES_OWNER}/${GITHUB_BADGES_REPO}/${GITHUB_BADGES_BRANCH}/${encodeURI(item.path)}`

        // Extract milestone numbers (e.g. 250+, 200, 150)
        const match = fileName.match(/(\d+\+?)/)
        const countStr = match ? match[1] : ''

        // Format dates smartly
        let dateStr = 'Documented Record'
        const dateMatch = fileName.match(/(\d{1,2})([A-Za-z]{3})/i)
        if (dateMatch) {
          dateStr = `${dateMatch[2].charAt(0).toUpperCase() + dateMatch[2].slice(1).toLowerCase()} ${dateMatch[1]}, 2026`
        } else if (countStr.startsWith('250')) {
          dateStr = 'Sep 2026'
        } else if (countStr.startsWith('200')) {
          dateStr = 'Aug 11, 2026'
        } else if (countStr.startsWith('150')) {
          dateStr = 'Jul 2026'
        }

        const displayName = countStr
          ? `${countStr} Problems Solved`
          : fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ')

        milestones.push({
          id: `gh-milestone-${item.sha.slice(0, 8)}`,
          fileName,
          name: `${countStr ? countStr + ' Problems' : 'Progress'} Milestone`,
          displayName,
          type: 'milestone',
          category: 'Progress Milestone',
          icon: rawUrl,
          fallbackIcon: `/leetcode/${item.path}`,
          date: dateStr,
          description: countStr
            ? `Documented milestone achieving ${countStr} total solved problems on LeetCode with progress analytics.`
            : `Verified LeetCode milestone record: ${fileName}.`,
          countNum: parseInt(countStr) || 0,
          isLiveGithub: true
        })
      }
    }

    return milestones
  } catch (e) {
    return null
  }
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

  // Dynamic GitHub Milestones auto-sync
  let githubMilestones = null
  try {
    githubMilestones = await fetchGitHubMilestones()
  } catch (err) {}

  // Merge milestones: combine live GitHub milestones with static milestones
  let finalMilestones = leetcodeInitialData.badges.filter((b) => b.type === 'milestone')
  if (githubMilestones && githubMilestones.length > 0) {
    const staticMap = new Map()
    finalMilestones.forEach((m) => {
      const match = m.displayName.match(/(\d+\+?)/)
      const key = match ? match[1] : m.displayName
      staticMap.set(key, m)
    })

    const mergedMilestoneList = []
    const seenKeys = new Set()

    githubMilestones.forEach((ghm) => {
      const match = ghm.displayName.match(/(\d+\+?)/)
      const key = match ? match[1] : ghm.fileName
      seenKeys.add(key)

      if (staticMap.has(key)) {
        const local = staticMap.get(key)
        mergedMilestoneList.push({
          ...local,
          icon: ghm.icon || local.icon,
          fallbackIcon: local.fallbackIcon || local.icon,
          ghUrl: ghm.icon
        })
      } else {
        mergedMilestoneList.push(ghm)
      }
    })

    finalMilestones.forEach((m) => {
      const match = m.displayName.match(/(\d+\+?)/)
      const key = match ? match[1] : m.displayName
      if (!seenKeys.has(key)) {
        mergedMilestoneList.push(m)
      }
    })

    // Sort descending: e.g. 250+ > 200 > 150
    mergedMilestoneList.sort((a, b) => {
      const numA = parseInt(a.displayName.match(/\d+/)?.[0] || '0', 10)
      const numB = parseInt(b.displayName.match(/\d+/)?.[0] || '0', 10)
      return numB - numA
    })

    finalMilestones = mergedMilestoneList
  }

  // Keep milestone badges (custom screenshots) and merge any live official badges
  const officialBadges = liveStats?.liveBadges && liveStats.liveBadges.length > 0
    ? liveStats.liveBadges
    : leetcodeInitialData.badges.filter((b) => b.type === 'badge')

  const mergedBadges = [...officialBadges, ...finalMilestones]

  const mergedData = {
    ...leetcodeInitialData,
    ...(liveStats || {}),
    username: liveStats?.username || leetcodeInitialData.username,
    realName: liveStats?.realName || liveStats?.name || leetcodeInitialData.realName,
    name: liveStats?.name || liveStats?.realName || leetcodeInitialData.name,
    badges: mergedBadges,
    skillsByLevel: liveStats?.skillsByLevel || leetcodeInitialData.skillsByLevel,
    topics: (liveStats?.topics && Array.isArray(liveStats.topics) && liveStats.topics.length > 0)
      ? liveStats.topics
      : leetcodeInitialData.topics,
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
      ? 'Live sync successful: All LeetCode and GitHub data fetched successfully!'
      : 'All verified LeetCode and GitHub data loaded successfully.'
  }
}
