/**
 * GitHub Certificate Auto-Sync Utility
 * Connects to https://github.com/PranavSharma1008/Certificates
 * Automatically fetches newly uploaded certificates from the GitHub repository.
 */

export const GITHUB_REPO_OWNER = 'PranavSharma1008'
export const GITHUB_REPO_NAME = 'Certificates'
export const GITHUB_REPO_BRANCH = 'main'
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`

const CACHE_KEY = 'pranav_portfolio_github_certs_v2'
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes cache

const VALID_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']

// Clean filename (e.g. removes " (1)" duplicate suffixes)
const cleanFileName = (path) => {
  const base = path.split('/').pop()
  return base.replace(/\s+\(1\)/g, '').trim()
}

// Convert filename to readable course title
const formatTitleFromFileName = (fileName) => {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '')
  // Replace underscores and hyphens with spaces
  let title = withoutExt.replace(/[_-]+/g, ' ').trim()

  // Handle Coursera prefix with hash
  if (/^Coursera\s+[A-Z0-9]+$/i.test(title)) {
    return title
  }
  return title
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Auto-detect category based on text and folder path
const detectCategory = (title, path) => {
  const full = `${title} ${path}`.toLowerCase()
  if (/cybersecurity|security|disaster|firewall|network/.test(full)) {
    return 'Cybersecurity & Risk'
  }
  if (/python|machine learning|deep learning|data science|pandas|numpy/.test(full)) {
    return 'Python & ML'
  }
  if (/ai|prompt|gpt|generative|llm|artificial intelligence|deeplearning/.test(full)) {
    return 'AI & Prompting'
  }
  if (/marketing|social media|seo|analytics|facebook|instagram|twitter|youtube/.test(full)) {
    return 'Digital Marketing'
  }
  if (/design|ui|ux|figma|creative|human centered/.test(full)) {
    return 'Design Thinking'
  }
  if (/patent|copyright|trademark|intellectual property|law|legal/.test(full)) {
    return 'Law & IP'
  }
  return 'AI & Prompting'
}

// Auto-detect issuer branding
const detectIssuerBadge = (title, path) => {
  const full = `${title} ${path}`.toLowerCase()
  if (full.includes('google')) return { name: 'Google', color: '#4285F4' }
  if (full.includes('ibm')) return { name: 'IBM', color: '#054ADA' }
  if (full.includes('deeplearning')) return { name: 'DeepLearning.AI', color: '#FF6F00' }
  if (full.includes('infosys')) return { name: 'Infosys', color: '#007CC3' }
  if (full.includes('udemy')) return { name: 'Udemy', color: '#A435F0' }
  if (full.includes('meta')) return { name: 'Meta', color: '#0668E1' }
  if (full.includes('aws') || full.includes('amazon')) return { name: 'AWS', color: '#FF9900' }
  if (full.includes('microsoft')) return { name: 'Microsoft', color: '#00A4EF' }
  if (full.includes('pennsylvania')) return { name: 'UPenn', color: '#011F5B' }
  if (full.includes('virginia')) return { name: 'Univ of Virginia', color: '#232D4B' }
  if (full.includes('hong kong')) return { name: 'HKUST', color: '#003366' }
  if (full.includes('digital marketing')) return { name: 'DMI', color: '#E31837' }
  if (full.includes('maryland')) return { name: 'UMD', color: '#E03A3E' }
  if (full.includes('lund')) return { name: 'Lund Univ', color: '#9A6324' }
  if (full.includes('banco interamericano') || full.includes('disaster')) return { name: 'IDB', color: '#005596' }
  if (full.includes('coursera')) return { name: 'Coursera', color: '#0056D2' }
  return { name: 'GitHub Verified', color: '#00d4ff' }
}

/**
 * Fetch files from GitHub repository and merge with existing certificates
 * @param {Array} staticCertificates - Curated local certificate list
 * @param {boolean} forceRefresh - Bypass localStorage cache
 * @returns {Promise<{certificates: Array, newCount: number, lastSyncTime: string}>}
 */
export const syncWithGitHubRepo = async (staticCertificates, forceRefresh = false) => {
  // Check cache first if not forceRefresh
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        const cached = JSON.parse(cachedStr)
        const age = Date.now() - (cached.timestamp || 0)
        if (age < CACHE_TTL_MS && Array.isArray(cached.certificates)) {
          return {
            certificates: cached.certificates,
            newCount: cached.newCount || 0,
            lastSyncTime: cached.lastSyncTime || 'Cached',
            fromCache: true
          }
        }
      }
    } catch (e) {
      console.warn('Failed reading GitHub certificates cache:', e)
    }
  }

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/trees/${GITHUB_REPO_BRANCH}?recursive=1`
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

    // Map existing filenames for fast lookup
    const existingMap = new Map()
    staticCertificates.forEach((c) => {
      existingMap.set(c.fileName.toLowerCase(), c)
      // also map without extension
      existingMap.set(c.fileName.replace(/\.[^/.]+$/, '').toLowerCase(), c)
    })

    const seenCleanNames = new Set()
    const newItems = []

    for (const item of tree) {
      if (item.type !== 'blob') continue

      const path = item.path
      const lowerPath = path.toLowerCase()

      // Must be a valid certificate extension
      const ext = VALID_EXTS.find((e) => lowerPath.endsWith(e))
      if (!ext) continue

      const cleanName = cleanFileName(path)
      const cleanLower = cleanName.toLowerCase()

      // Avoid duplicates
      if (seenCleanNames.has(cleanLower)) continue
      seenCleanNames.add(cleanLower)

      // If it already exists in static certificates, skip (local version already has rich metadata)
      if (existingMap.has(cleanLower) || existingMap.has(cleanLower.replace(/\.[^/.]+$/, ''))) {
        continue
      }

      // This is a brand new certificate uploaded to GitHub!
      const title = formatTitleFromFileName(cleanName)
      const category = detectCategory(title, path)
      const badge = detectIssuerBadge(title, path)
      const isPdf = ext === '.pdf'
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_REPO_BRANCH}/${encodeURI(path)}`

      newItems.push({
        id: `gh-${item.sha.slice(0, 8)}`,
        title,
        issuer: badge.name,
        category,
        date: 'Recently Uploaded',
        credentialId: item.sha.slice(0, 10),
        verifyUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/blob/${GITHUB_REPO_BRANCH}/${encodeURI(path)}`,
        fileUrl: rawUrl,
        thumbnailUrl: isPdf ? null : rawUrl,
        type: isPdf ? 'pdf' : 'image',
        fileName: cleanName,
        isLiveGithub: true,
        isSpecialization: title.toLowerCase().includes('specialization'),
        badge
      })
    }

    // Merge: new items appear first or seamlessly
    const mergedList = [...newItems, ...staticCertificates]
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const result = {
      certificates: mergedList,
      newCount: newItems.length,
      lastSyncTime: nowTime,
      fromCache: false
    }

    // Cache the result
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            certificates: mergedList,
            newCount: newItems.length,
            lastSyncTime: nowTime,
            timestamp: Date.now()
          })
        )
        window.dispatchEvent(new CustomEvent('certificates-synced', { detail: mergedList }))
      } catch (e) {
        console.warn('Failed saving GitHub certificates cache:', e)
      }
    }

    return result
  } catch (err) {
    console.error('GitHub certificates sync error:', err)
    // Return static fallback if API fails (e.g. offline or rate-limited)
    return {
      certificates: staticCertificates,
      newCount: 0,
      lastSyncTime: 'Offline / Cached',
      error: err.message
    }
  }
}
