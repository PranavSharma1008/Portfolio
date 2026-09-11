/**
 * GitHub Typing Achievements Auto-Sync Utility
 * Connects to https://github.com/PranavSharma1008/TypingAchivenments
 */

export const GITHUB_TYPING_REPO_OWNER = 'PranavSharma1008'
export const GITHUB_TYPING_REPO_NAME = 'TypingAchivenments'
export const GITHUB_TYPING_REPO_BRANCH = 'main'
export const GITHUB_TYPING_REPO_URL = `https://github.com/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}`

const CACHE_KEY = 'pranav_portfolio_typing_cache_v1'
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes

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
  if (lower.includes('recordbreak')) return 'Record Break'
  if (lower.includes('monthly')) return 'Monthly Achievements'
  if (lower.includes('certificate')) return 'Certificates'
  return 'Record Break'
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
    const apiUrl = `https://api.github.com/repos/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}/git/trees/${GITHUB_TYPING_REPO_BRANCH}?recursive=1`
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`)
    }

    const data = await res.json()
    const tree = data.tree || []

    const existingMap = new Map()
    staticItems.forEach((item) => {
      existingMap.set(item.fileName.toLowerCase(), item)
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
      const cleanLower = fileName.toLowerCase().replace(/\s+\(1\)/g, '').trim()

      if (seenNames.has(cleanLower)) continue
      seenNames.add(cleanLower)

      if (existingMap.has(cleanLower)) continue

      // Newly discovered typing screenshot
      const title = formatTypingTitle(fileName)
      const category = mapFolderToCategory(path)
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_TYPING_REPO_OWNER}/${GITHUB_TYPING_REPO_NAME}/${GITHUB_TYPING_REPO_BRANCH}/${encodeURI(path)}`

      newItems.push({
        id: `type-gh-${item.sha.slice(0, 8)}`,
        title,
        category,
        wpm: 'Verified Record',
        accuracy: 'Touch Typing',
        testType: 'Monkeytype Milestone',
        date: 'Recently Uploaded',
        platform: 'Monkeytype',
        keyboard: 'MacBook Air M2 (Built-in)',
        fileName,
        folder: category,
        fileUrl: rawUrl,
        thumbnailUrl: rawUrl,
        description: `Typing achievement record uploaded to ${path}.`,
        isLiveGithub: true
      })
    }

    const merged = [...newItems, ...staticItems]
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
