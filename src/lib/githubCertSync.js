/**
 * GitHub Certificate Auto-Sync Utility
 * Connects to:
 * 1. https://github.com/PranavSharma1008/Certificates (Course & Specialization Credentials)
 * 2. https://github.com/PranavSharma1008/Hack-Certficates (Hackathon Certificates & Awards)
 * 
 * Automatically fetches newly uploaded certificates from both repositories in real-time.
 */

export const GITHUB_REPO_OWNER = 'PranavSharma1008'
export const GITHUB_REPO_NAME = 'Certificates'
export const GITHUB_REPO_BRANCH = 'main'
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`

export const GITHUB_HACK_REPO_NAME = 'Hack-Certficates'
export const GITHUB_HACK_REPO_BRANCH = 'main'
export const GITHUB_HACK_REPO_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_HACK_REPO_NAME}`

export const CACHE_KEY = 'pranav_portfolio_github_certs_v7'
export const CACHE_TTL_MS = 1000 * 60 * 15 // 15 minutes cache

// Flush stale legacy cache keys from localStorage
if (typeof window !== 'undefined') {
  try {
    [
      'pranav_portfolio_github_certs_v1',
      'pranav_portfolio_github_certs_v2',
      'pranav_portfolio_github_certs_v3',
      'pranav_portfolio_github_certs_v4',
      'pranav_portfolio_github_certs_v5',
      'pranav_portfolio_github_certs_v6'
    ].forEach((k) => localStorage.removeItem(k))
  } catch (e) {}
}

const VALID_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']

// Clean filename (e.g. removes " (1)" duplicate suffixes)
export const cleanFileName = (path) => {
  const base = path.split('/').pop()
  return base.replace(/\s+\(1\)/g, '').trim()
}

// Convert filename to readable title
export const formatTitleFromFileName = (fileName) => {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '')
  // Replace underscores and hyphens with spaces
  let title = withoutExt.replace(/[_-]+/g, ' ').trim()

  // Handle Coursera prefix with hash
  if (/^Coursera\s+[A-Z0-9]+$/i.test(title)) {
    return title
  }

  if (title.toLowerCase().includes('presenting') && (title.toLowerCase().includes('veiw') || title.toLowerCase().includes('view'))) {
    return 'Presenting View - Live Hackathon Showcase'
  }

  return title
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Auto-detect category based on text, folder path, and origin repository
export const detectCategory = (title, path, repoName = '') => {
  if (repoName === GITHUB_HACK_REPO_NAME) {
    return 'Hackathons'
  }

  // 1. If placed in a custom folder inside the repository (e.g. "Web Development/cert.pdf" or "Cloud/aws.png")
  const pathParts = path.split('/')
  if (pathParts.length > 1) {
    const folder = pathParts[0].trim()
    const folderLower = folder.toLowerCase()

    if (/hackathon/i.test(folderLower)) return 'Hackathons'
    if (/ai|prompt/i.test(folderLower)) return 'AI & Prompting'
    if (/python|machine\s*learning|deep\s*learning/i.test(folderLower)) return 'Python & ML'
    if (/law|ip|patent|legal/i.test(folderLower)) return 'Law & IP'
    if (/design|ui|ux/i.test(folderLower)) return 'Design Thinking'
    if (/marketing|seo/i.test(folderLower)) return 'Digital Marketing'
    if (/security|cyber/i.test(folderLower)) return 'Cybersecurity & Risk'
    if (/web|frontend|backend|fullstack|javascript|react/i.test(folderLower)) return 'Web Development'
    if (/cloud|devops|docker|kubernetes|aws|azure/i.test(folderLower)) return 'Cloud & DevOps'
    if (/data|database|sql/i.test(folderLower)) return 'Data Science & Databases'
    if (/blockchain|web3|crypto/i.test(folderLower)) return 'Blockchain & Web3'
    if (/mobile|flutter|android|ios/i.test(folderLower)) return 'Mobile Development'
    if (/software|algorithm|dsa|programming/i.test(folderLower)) return 'Software Engineering'

    // If it's any dedicated custom folder, use the capitalized folder name as the new category tab!
    if (folder.length > 2 && !folderLower.includes('cert') && !folderLower.includes('asset') && !folderLower.includes('thumbnail')) {
      return folder
        .split(/[_\s-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }

  const full = `${title} ${path}`.toLowerCase()

  // 2. Check title or path for brackets / prefix e.g. "[Cloud] AWS Developer.pdf" or "WebDev - Fullstack.png"
  const prefixMatch = title.match(/^\[([^\]]+)\]|^([A-Za-z\s&]{3,24})\s*[-–:]\s*/)
  if (prefixMatch) {
    const rawTag = (prefixMatch[1] || prefixMatch[2]).trim()
    const rawLower = rawTag.toLowerCase()
    if (!/coursera|udemy|google|certificate|verified/i.test(rawLower) && rawTag.length > 2) {
      if (/web|frontend|backend/i.test(rawLower)) return 'Web Development'
      if (/cloud|devops/i.test(rawLower)) return 'Cloud & DevOps'
      if (/data|database/i.test(rawLower)) return 'Data Science & Databases'
      if (/blockchain|crypto/i.test(rawLower)) return 'Blockchain & Web3'
      if (/mobile|flutter/i.test(rawLower)) return 'Mobile Development'
      return rawTag
        .split(/[_\s-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
  }

  // 3. Keyword matching across topics
  if (/hackathon|hack\b|hackfest|hacknight|devhack|codefest|sih|smart india/i.test(full)) {
    return 'Hackathons'
  }
  if (/web\s*dev|frontend|backend|full\s*stack|react|angular|vue|node\.?js|javascript|typescript|html|css|next\.?js|tailwind|express/i.test(full)) {
    return 'Web Development'
  }
  if (/cloud|devops|docker|kubernetes|aws|amazon web services|azure|google cloud|gcp|terraform/i.test(full)) {
    return 'Cloud & DevOps'
  }
  if (/blockchain|solidity|ethereum|web3|crypto|smart contract/i.test(full)) {
    return 'Blockchain & Web3'
  }
  if (/mobile|flutter|android|ios|swift|react native|kotlin/i.test(full)) {
    return 'Mobile Development'
  }
  if (/data science|data analysis|analytics|sql|database|power bi|tableau|mongodb|postgres/i.test(full)) {
    return 'Data Science & Databases'
  }
  if (/cybersecurity|security|disaster|firewall|network|infosec|cryptography/.test(full)) {
    return 'Cybersecurity & Risk'
  }
  if (/python|machine learning|deep learning|tensorflow|pytorch|pandas|numpy/.test(full)) {
    return 'Python & ML'
  }
  if (/ai|prompt|gpt|generative|llm|artificial intelligence|deeplearning/.test(full)) {
    return 'AI & Prompting'
  }
  if (/marketing|social media|seo|analytics|facebook|instagram|twitter|youtube|digital marketing/.test(full)) {
    return 'Digital Marketing'
  }
  if (/design|ui|ux|figma|creative|human centered/.test(full)) {
    return 'Design Thinking'
  }
  if (/patent|copyright|trademark|intellectual property|law|legal/.test(full)) {
    return 'Law & IP'
  }
  if (/algorithm|dsa|data structure|leetcode|competitive programming|c\+\+|java\b|oop/i.test(full)) {
    return 'Software Engineering'
  }

  return 'AI & Prompting'
}

// Auto-detect hackathon issuer branding
export const detectHackathonIssuerBadge = (title, path) => {
  const full = `${title} ${path}`.toLowerCase()
  if (full.includes('sih') || full.includes('smart india')) {
    return { name: 'Smart India Hackathon', color: '#FF9933' }
  }
  if (full.includes('mlh') || full.includes('major league')) {
    return { name: 'Major League Hacking', color: '#E73427' }
  }
  if (full.includes('devpost')) {
    return { name: 'Devpost', color: '#003E54' }
  }
  if (full.includes('devfolio')) {
    return { name: 'Devfolio', color: '#3770FF' }
  }
  if (full.includes('unstop') || full.includes('dare2compete')) {
    return { name: 'Unstop', color: '#1C4980' }
  }
  if (full.includes('ethindia') || full.includes('ethereum') || full.includes('web3')) {
    return { name: 'ETHIndia', color: '#6366F1' }
  }
  if (full.includes('hackerearth')) {
    return { name: 'HackerEarth', color: '#323754' }
  }
  if (full.includes('ieee')) {
    return { name: 'IEEE', color: '#00629B' }
  }
  if (full.includes('gdg') || full.includes('google')) {
    return { name: 'Google Developer', color: '#4285F4' }
  }
  if (full.includes('microsoft') || full.includes('imagine cup')) {
    return { name: 'Microsoft', color: '#00A4EF' }
  }
  if (full.includes('aws') || full.includes('amazon')) {
    return { name: 'AWS', color: '#FF9900' }
  }
  return { name: 'Hackathon', color: '#00ff9d' }
}

// Auto-detect standard issuer branding
export const detectIssuerBadge = (title, path) => {
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

/**
 * Fast verification against raw.githubusercontent.com to ensure file actually exists on GitHub.
 * Returns false if deleted (HTTP 404) or unreachable.
 */
export const verifyRawFileExists = async (owner, repo, branch, path) => {
  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURI(path)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)
    const res = await fetch(rawUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    })
    clearTimeout(timer)
    return res.ok && res.status === 200
  } catch (e) {
    return false
  }
}

/**
 * Fetch Git Tree recursively with multi-tiered fallbacks:
 * 1. Serverless proxy endpoint (/api/certificates, /.netlify/functions/certificates)
 * 2. Official GitHub REST API (Direct, real-time source of truth)
 * 3. jsDelivr Data API with mandatory file existence verification
 */
const fetchRepoTree = async (owner, repo, branch = 'main') => {
  // Strategy 1: Serverless proxy endpoints (if available)
  const proxyEndpoints = [
    `/api/certificates?repo=${encodeURIComponent(repo)}`,
    `/.netlify/functions/certificates?repo=${encodeURIComponent(repo)}`
  ]

  for (const endpoint of proxyEndpoints) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      })
      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.tree)) {
          return { tree: data.tree, empty: data.tree.length === 0, source: 'serverless' }
        }
      }
    } catch (e) {}
  }

  // Strategy 2: Official GitHub REST API (Direct source of truth)
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      },
      signal: controller.signal
    })
    clearTimeout(timer)

    // HTTP 404 or 409 means the repository or branch is empty (0 files)
    if (res.status === 409 || res.status === 404) {
      return { tree: [], empty: true, source: 'github-empty' }
    }

    if (res.ok) {
      const data = await res.json()
      const rawTree = Array.isArray(data.tree) ? data.tree : []
      return { tree: rawTree, empty: rawTree.length === 0, source: 'github-api' }
    }

    if (res.status === 403 || res.status === 429) {
      console.warn(`[CertSync] GitHub API rate limit for ${repo} (HTTP ${res.status}), using verified fallback`)
    }
  } catch (err) {
    console.warn(`[CertSync] GitHub API direct request notice for ${repo}:`, err?.message || err)
  }

  // Strategy 3: jsDelivr Data API Fallback with mandatory file existence verification
  const cdnResult = await fetchJsDelivrTree(owner, repo, branch)
  if (cdnResult && Array.isArray(cdnResult.tree)) {
    // Discard any files that no longer exist on raw.githubusercontent.com
    const verifiedTree = []
    await Promise.all(
      cdnResult.tree.map(async (file) => {
        if (file.type !== 'blob') return
        const exists = await verifyRawFileExists(owner, repo, branch, file.path)
        if (exists) {
          verifiedTree.push(file)
        } else {
          console.info(`[CertSync] Discarded deleted/unreachable file from ${repo}: ${file.path}`)
        }
      })
    )
    return { tree: verifiedTree, empty: verifiedTree.length === 0, source: 'cdn-verified' }
  }

  return { tree: [], empty: true, source: 'none' }
}

/**
 * Fetch files from both GitHub repositories (Certificates + Hack-Certficates)
 * and merge seamlessly with existing certificates.
 * 
 * @param {Array} staticCertificates - Curated local certificate list
 * @param {boolean} forceRefresh - Bypass localStorage cache
 * @returns {Promise<{certificates: Array, newCount: number, hackathonCount: number, lastSyncTime: string}>}
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
            hackathonCount: cached.hackathonCount || 0,
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
    // Concurrently fetch git trees from both repositories
    const [certsResult, hackResult] = await Promise.allSettled([
      fetchRepoTree(GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_REPO_BRANCH),
      fetchRepoTree(GITHUB_REPO_OWNER, GITHUB_HACK_REPO_NAME, GITHUB_HACK_REPO_BRANCH)
    ])

    const certsTree = certsResult.status === 'fulfilled' ? certsResult.value.tree : []
    const hackTree = hackResult.status === 'fulfilled' ? hackResult.value.tree : []

    // Map existing filenames for fast lookup
    const existingMap = new Map()
    staticCertificates.forEach((c) => {
      if (c.fileName) {
        existingMap.set(c.fileName.toLowerCase(), c)
        existingMap.set(c.fileName.replace(/\.[^/.]+$/, '').toLowerCase(), c)
      }
    })

    const seenCleanNames = new Set()
    const newHackItems = []
    const newCertItems = []

    // 1. Process Hackathon certificates from PranavSharma1008/Hack-Certficates
    for (const item of hackTree) {
      if (item.type !== 'blob') continue

      const path = item.path
      const lowerPath = path.toLowerCase()
      const ext = VALID_EXTS.find((e) => lowerPath.endsWith(e))
      if (!ext) continue

      const cleanName = cleanFileName(path)
      const cleanLower = cleanName.toLowerCase()

      const dedupeKey = `hack-${cleanLower}`
      if (seenCleanNames.has(dedupeKey)) continue
      seenCleanNames.add(dedupeKey)

      if (existingMap.has(cleanLower) || existingMap.has(cleanLower.replace(/\.[^/.]+$/, ''))) {
        continue
      }

      const title = formatTitleFromFileName(cleanName)
      const badge = detectHackathonIssuerBadge(title, path)
      const isPdf = ext === '.pdf'
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_HACK_REPO_NAME}/${GITHUB_HACK_REPO_BRANCH}/${encodeURI(path)}`

      // Verify file is reachable on GitHub raw
      const exists = await verifyRawFileExists(GITHUB_REPO_OWNER, GITHUB_HACK_REPO_NAME, GITHUB_HACK_REPO_BRANCH, path)
      if (!exists) {
        console.warn(`[CertSync] Skipping unreachable/deleted hackathon certificate: ${cleanName}`)
        continue
      }

      newHackItems.push({
        id: `hack-${item.sha.slice(0, 8)}`,
        title,
        issuer: badge.name,
        category: 'Hackathons',
        date: '2026',
        credentialId: item.sha.slice(0, 10),
        verifyUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_HACK_REPO_NAME}/blob/${GITHUB_HACK_REPO_BRANCH}/${encodeURI(path)}`,
        fileUrl: rawUrl,
        thumbnailUrl: isPdf ? null : rawUrl,
        type: isPdf ? 'pdf' : 'image',
        fileName: cleanName,
        isLiveGithub: true,
        isHackathon: true,
        repoName: GITHUB_HACK_REPO_NAME,
        badge,
        priority: 9999
      })
    }

    // 2. Process general certificates from PranavSharma1008/Certificates
    for (const item of certsTree) {
      if (item.type !== 'blob') continue

      const path = item.path
      const lowerPath = path.toLowerCase()
      const ext = VALID_EXTS.find((e) => lowerPath.endsWith(e))
      if (!ext) continue

      const cleanName = cleanFileName(path)
      const cleanLower = cleanName.toLowerCase()

      const dedupeKey = `cert-${cleanLower}`
      if (seenCleanNames.has(dedupeKey)) continue
      seenCleanNames.add(dedupeKey)

      // If already in static certificates, skip (curated metadata preserved)
      if (existingMap.has(cleanLower) || existingMap.has(cleanLower.replace(/\.[^/.]+$/, ''))) {
        continue
      }

      const title = formatTitleFromFileName(cleanName)
      const category = detectCategory(title, path, GITHUB_REPO_NAME)
      const badge =
        category === 'Hackathons'
          ? detectHackathonIssuerBadge(title, path)
          : detectIssuerBadge(title, path)
      const isPdf = ext === '.pdf'
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_REPO_BRANCH}/${encodeURI(path)}`

      // Verify file is reachable on GitHub raw
      const exists = await verifyRawFileExists(GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_REPO_BRANCH, path)
      if (!exists) {
        console.warn(`[CertSync] Skipping unreachable/deleted certificate: ${cleanName}`)
        continue
      }

      newCertItems.push({
        id: `gh-${item.sha.slice(0, 8)}`,
        title,
        issuer: badge.name,
        category,
        date: '2026',
        credentialId: item.sha.slice(0, 10),
        verifyUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/blob/${GITHUB_REPO_BRANCH}/${encodeURI(path)}`,
        fileUrl: rawUrl,
        thumbnailUrl: isPdf ? null : rawUrl,
        type: isPdf ? 'pdf' : 'image',
        fileName: cleanName,
        isLiveGithub: true,
        isSpecialization: title.toLowerCase().includes('specialization'),
        isHackathon: category === 'Hackathons',
        repoName: GITHUB_REPO_NAME,
        badge,
        priority: category === 'Hackathons' ? 1000 : 80
      })
    }

    // Merge: Hackathon certificates first, then new general certs, then static curated list
    const mergedList = [...newHackItems, ...newCertItems, ...staticCertificates]
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const result = {
      certificates: mergedList,
      newCount: newHackItems.length + newCertItems.length,
      hackathonCount: newHackItems.length,
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
            newCount: result.newCount,
            hackathonCount: result.hackathonCount,
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
    return {
      certificates: staticCertificates,
      newCount: 0,
      hackathonCount: 0,
      lastSyncTime: 'Offline / Cached',
      error: err.message
    }
  }
}
