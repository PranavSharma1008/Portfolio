/**
 * GitHub Typing Achievements Auto-Sync Utility
 * Connects to https://github.com/PranavSharma1008/TypingAchivenments
 */

export const GITHUB_TYPING_REPO_OWNER = 'PranavSharma1008'
export const GITHUB_TYPING_REPO_NAME = 'TypingAchivenments'
export const GITHUB_TYPING_REPO_BRANCH = 'main'
export const GITHUB_TYPING_REPO_URL = `https://github.com/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}`

export const CACHE_KEY = 'pranav_portfolio_typing_cache_v4'
export const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes

if (typeof window !== 'undefined') {
  try {
    [
      'pranav_portfolio_typing_cache_v1',
      'pranav_portfolio_typing_cache_v2',
      'pranav_portfolio_typing_cache_v3',
      'pranav_portfolio_github_typing_v1',
      'pranav_portfolio_github_typing_v2'
    ].forEach((k) => localStorage.removeItem(k))
  } catch (e) {}
}

const VALID_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp']

const formatTypingTitle = (fileName) => {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '')
  let title = withoutExt.replace(/[_-]+/g, ' ').trim()
  return title
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const mapFolderToCategory = (path) => {
  const lower = path.toLowerCase()
  if (lower.includes('certificate')) return 'Certificates'
  if (lower.includes('monthly')) return 'Monthly Achievements'
  if (lower.includes('recordbreak') || lower.includes('record')) return 'Record Break'
  return 'Record Break'
}

/**
 * Fetch tree via high-speed jsDelivr Data API (bypasses GitHub 60 req/hr rate limit)
 */
const fetchJsDelivrTree = async (owner, repo, branch = 'main') => {
  try {
    const url = `https://data.jsdelivr.com/v1/packages/gh/${owner}/${repo}@${branch}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const flatten = (items, prefix = '') => {
      let out = []
      for (const item of (items || [])) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name
        if (item.type === 'file') {
          out.push({
            path: fullPath,
            name: item.name,
            size: item.size,
            sha: item.hash || Math.random().toString(36).slice(2, 10),
            type: 'blob'
          })
        } else if (item.files) {
          out.push(...flatten(item.files, fullPath))
        }
      }
      return out
    }
    const tree = flatten(data.files)
    return { tree, empty: tree.length === 0 }
  } catch (err) {
    return null
  }
}

export const syncTypingWithGitHub = async (staticItems, forceRefresh = false) => {
  // Check cache first
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        const cached = JSON.parse(cachedStr)
        const age = Date.now() - (cached.timestamp || 0)
        if (age < CACHE_TTL_MS && Array.isArray(cached.items)) {
          return {
            items: cached.items,
            newCount: cached.newCount || 0,
            lastSyncTime: cached.lastSyncTime || 'Cached',
            fromCache: true
          }
        }
      }
    } catch (e) {
      console.warn('Failed reading typing cache:', e)
    }
  }

  try {
    // 1. Try high-speed jsDelivr Data API
    let tree = []
    const cdnResult = await fetchJsDelivrTree(GITHUB_TYPING_REPO_OWNER, GITHUB_TYPING_REPO_NAME, GITHUB_TYPING_REPO_BRANCH)
    if (cdnResult && Array.isArray(cdnResult.tree) && cdnResult.tree.length > 0) {
      tree = cdnResult.tree
    } else {
      // 2. Fallback to GitHub REST API
      const apiUrl = `https://api.github.com/repos/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}/git/trees/${GITHUB_TYPING_REPO_BRANCH}?recursive=1`
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        tree = data.tree || []
      }
    }

    const existingMap = new Map()
    staticItems.forEach((item) => {
      const norm = (item.fileName || '').toLowerCase().replace(/\s+\./g, '.').trim()
      existingMap.set(norm, item)
    })

    const newItems = []
    const seenNames = new Set()

    for (const item of tree) {
      if (item.type !== 'blob') continue
      const path = item.path
      const lower = path.toLowerCase()
      const ext = VALID_IMAGE_EXTS.find((e) => lower.endsWith(e))
      if (!ext) continue

      const fileName = path.split('/').pop()
      const cleanLower = fileName.toLowerCase().replace(/\s+\./g, '.').replace(/\s+\(1\)/g, '').trim()

      if (seenNames.has(cleanLower)) continue
      seenNames.add(cleanLower)

      if (existingMap.has(cleanLower)) continue

      const category = mapFolderToCategory(path)
      const isCertificate = category === 'Certificates' || cleanLower.includes('certificate')
      let title = formatTypingTitle(fileName)
      let wpm = '82 WPM'
      let accuracy = '100%'
      let testType = 'Monkeytype Milestone'
      let platform = 'Monkeytype'
      let date = '2026'

      if (isCertificate) {
        title = 'TypeMaster Certificate of Typing Achievement (50 WPM / 98% Acc)'
        wpm = '50 WPM'
        accuracy = '98%'
        testType = 'TypeMaster Professional Certification'
        platform = 'TypeMaster'
        date = 'Sep 23, 2026'
      } else {
        const wpmMatch = fileName.match(/(\d{2,3})\s*(wpm|words|sec)/i)
        const accMatch = fileName.match(/(\d{2,3})\s*(%|acc)/i)
        if (wpmMatch) wpm = `${wpmMatch[1]} WPM`
        if (accMatch) accuracy = `${accMatch[1]}%`
      }

      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}/${GITHUB_TYPING_REPO_BRANCH}/${encodeURI(path)}`

      newItems.push({
        id: `type-gh-${item.sha.slice(0, 8)}`,
        title,
        category: isCertificate ? 'Certificates' : category,
        wpm,
        accuracy,
        testType,
        date,
        platform,
        keyboard: 'MacBook Air M2 (Built-in)',
        fileName,
        folder: isCertificate ? 'Certificates' : category,
        fileUrl: rawUrl,
        thumbnailUrl: rawUrl,
        description: isCertificate
          ? 'Official Certificate of Typing Achievement issued by TypeMaster certifying 50 WPM typing speed with 98% keystroke accuracy.'
          : `Typing achievement record: ${title} (${wpm}, ${accuracy}).`,
        isLiveGithub: true
      })
    }

    const merged = [...newItems, ...staticItems].sort((a, b) => {
      // Prioritize Certificates so they appear prominently
      if (a.category === 'Certificates' && b.category !== 'Certificates') return -1
      if (a.category !== 'Certificates' && b.category === 'Certificates') return 1
      return 0
    })

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const result = {
      items: merged,
      newCount: newItems.length,
      lastSyncTime: nowTime,
      fromCache: false
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            items: merged,
            newCount: newItems.length,
            lastSyncTime: nowTime,
            timestamp: Date.now()
          })
        )
        window.dispatchEvent(new CustomEvent('typing-synced', { detail: merged }))
      } catch (e) {
        console.warn('Failed saving typing cache:', e)
      }
    }

    return result
  } catch (err) {
    console.warn('GitHub typing sync fallback:', err)
    return {
      items: staticItems,
      newCount: 0,
      lastSyncTime: 'Offline / Cached',
      error: err.message
    }
  }
}
