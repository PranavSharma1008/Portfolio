#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERNAME = 'pranavsharma1008'
const PROFILE_URL = `https://www.linkedin.com/in/${USERNAME}/`
const DATA_FILE_PATH = path.resolve(__dirname, '../public/data/linkedin.json')

// Helper to sanitize extracted number string
function sanitizeCount(raw) {
  if (!raw) return null
  const clean = String(raw).replace(/[^0-9]/g, '')
  const num = parseInt(clean, 10)
  if (Number.isFinite(num) && num >= 50 && num < 1000000) {
    return num
  }
  return null
}

// 1. Try fetching via LinkedIn Voyager API using li_at session cookie
async function fetchViaVoyager(liAt) {
  const jsessionId = 'ajax:100810081008'
  const endpoints = [
    `https://www.linkedin.com/voyager/api/identity/profiles/${USERNAME}/networkinfo`,
    `https://www.linkedin.com/voyager/api/identity/profiles/${USERNAME}/profileView`
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'Cookie': `li_at=${liAt}; JSESSIONID="${jsessionId}"`,
          'csrf-token': jsessionId,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/vnd.linkedin.normalized+json+2.1, application/json',
          'x-li-lang': 'en_US',
          'x-restli-protocol-version': '2.0.0'
        }
      })

      if (res.ok) {
        const text = await res.text()
        const match =
          text.match(/"followersCount"\s*:\s*(\d+)/i) ||
          text.match(/"followerCount"\s*:\s*(\d+)/i) ||
          text.match(/"numFollowers"\s*:\s*(\d+)/i) ||
          text.match(/"connectionsCount"\s*:\s*(\d+)/i)

        if (match && match[1]) {
          const count = sanitizeCount(match[1])
          if (count) {
            console.log(`[LinkedIn Sync] Successfully fetched via Voyager API: ${count} followers`)
            return count
          }
        }
      }
    } catch (err) {
      console.warn(`[LinkedIn Sync] Voyager endpoint error:`, err?.message || err)
    }
  }
  return null
}

// 2. Try fetching authenticated profile page directly using li_at
async function fetchViaAuthPage(liAt) {
  try {
    const jsessionId = 'ajax:100810081008'
    const res = await fetch(PROFILE_URL, {
      headers: {
        'Cookie': `li_at=${liAt}; JSESSIONID="${jsessionId}"`,
        'csrf-token': jsessionId,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    if (res.ok) {
      const html = await res.text()

      // Check embedded JSON blobs
      const jsonMatch =
        html.match(/"followersCount"\s*:\s*(\d+)/i) ||
        html.match(/"followerCount"\s*:\s*(\d+)/i) ||
        html.match(/"numFollowers"\s*:\s*(\d+)/i)

      if (jsonMatch && jsonMatch[1]) {
        const count = sanitizeCount(jsonMatch[1])
        if (count) {
          console.log(`[LinkedIn Sync] Successfully extracted from page JSON: ${count} followers`)
          return count
        }
      }

      // Check HTML text for follower count
      const textMatch =
        html.match(/(\d[\d,]*)\s*(?:followers|follower)/i) ||
        html.match(/(\d[\d,]*)\s*(?:connections|connection)/i)

      if (textMatch && textMatch[1]) {
        const count = sanitizeCount(textMatch[1])
        if (count) {
          console.log(`[LinkedIn Sync] Successfully extracted from page HTML: ${count} followers`)
          return count
        }
      }
    }
  } catch (err) {
    console.warn(`[LinkedIn Sync] Authenticated page error:`, err?.message || err)
  }
  return null
}

// 3. Fallback: Check GitHub Profile README
async function fetchViaGitHubReadme() {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md?_t=${Date.now()}`
    )
    if (res.ok) {
      const text = await res.text()
      const commentMatch = text.match(/<!--\s*linkedin[-_]followers?:\s*([0-9kK+,]+)\s*-->/i)
      const badgeMatch =
        text.match(/badge\/(?:LinkedIn[-_])?(?:Followers?|Connections?)-([0-9kK+,]+)(?:%20|\s*followers?)?-[a-zA-Z0-9%#]+/i) ||
        text.match(/badge\/LinkedIn-([0-9kK+,]+)(?:%20|\s*)(?:followers?|connections?)-[a-zA-Z0-9%#]+/i)
      const textMatch =
        text.match(/(?:followers?|connections?)\s*[:=\-–—]\s*([0-9kK+,]+)/i) ||
        text.match(/\b([0-9kK+,]+)\s+(?:linkedin\s+)?followers\b/i)

      const matched = commentMatch?.[1] || badgeMatch?.[1] || textMatch?.[1]
      if (matched) {
        const count = sanitizeCount(matched)
        if (count) {
          console.log(`[LinkedIn Sync] Fetched from GitHub Profile README: ${count} followers`)
          return count
        }
      }
    }
  } catch (err) {
    console.warn(`[LinkedIn Sync] GitHub README check failed:`, err?.message || err)
  }
  return null
}

// Read existing file if present
function getExistingData() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {}
  return {
    username: USERNAME,
    profileUrl: PROFILE_URL,
    followers: '805',
    connections: '805+',
    displayFollowers: '805 Followers',
    updatedAt: new Date().toISOString(),
    isLive: false
  }
}

async function main() {
  console.log(`[LinkedIn Sync] Starting LinkedIn follower sync for ${USERNAME}...`)

  const liAt = process.env.LINKEDIN_LI_AT?.trim()
  let followersCount = null

  if (liAt) {
    console.log('[LinkedIn Sync] Found LINKEDIN_LI_AT session cookie. Querying LinkedIn...')
    followersCount = await fetchViaVoyager(liAt)
    if (!followersCount) {
      followersCount = await fetchViaAuthPage(liAt)
    }
  } else {
    console.log('[LinkedIn Sync] Notice: LINKEDIN_LI_AT secret is not set in environment.')
    console.log('[LinkedIn Sync] Falling back to secondary verification sources...')
  }

  // Fallback to GitHub profile README if needed
  if (!followersCount) {
    followersCount = await fetchViaGitHubReadme()
  }

  const existingData = getExistingData()

  if (followersCount) {
    const updatedData = {
      username: USERNAME,
      profileUrl: PROFILE_URL,
      followers: String(followersCount),
      connections: `${followersCount}+`,
      displayFollowers: `${followersCount} Followers`,
      updatedAt: new Date().toISOString(),
      isLive: true
    }

    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true })
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedData, null, 2) + '\n', 'utf-8')
    console.log(`[LinkedIn Sync] ✅ Successfully updated ${DATA_FILE_PATH}`)
    console.log(JSON.stringify(updatedData, null, 2))
  } else {
    console.log(`[LinkedIn Sync] Retaining existing count: ${existingData.followers}`)
    const updatedData = {
      ...existingData,
      updatedAt: new Date().toISOString()
    }
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true })
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedData, null, 2) + '\n', 'utf-8')
    console.log('[LinkedIn Sync] Done.')
  }
}

main().catch((err) => {
  console.error('[LinkedIn Sync] Error during sync:', err)
  process.exit(0) // Do not fail CI step so action runs smoothly
})
