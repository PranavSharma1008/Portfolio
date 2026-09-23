export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const username = 'pranavsharma1008'
  const profileUrl = `https://www.linkedin.com/in/${username}/`
  let followers = '805'
  let connections = '805+'

  try {
    // 1. Try checking GitHub Profile README for any live followers badge or metric
    try {
      const ghController = new AbortController()
      const ghTimer = setTimeout(() => ghController.abort(), 2500)
      const ghRes = await fetch(
        `https://raw.githubusercontent.com/PranavSharma1008/PranavSharma1008/main/README.md?_t=${Date.now()}`,
        { signal: ghController.signal, cache: 'no-store' }
      )
      clearTimeout(ghTimer)
      if (ghRes.ok) {
        const md = await ghRes.text()

        const commentMatch = md.match(/<!--\s*linkedin[-_]followers?:\s*([0-9kK+,]+)\s*-->/i)
        const badgeMatch =
          md.match(/badge\/(?:LinkedIn[-_])?(?:Followers?|Connections?)-([0-9kK+,]+)(?:%20|\s*followers?)?-[a-zA-Z0-9%#]+/i) ||
          md.match(/badge\/LinkedIn-([0-9kK+,]+)(?:%20|\s*)(?:followers?|connections?)-[a-zA-Z0-9%#]+/i)
        const textMatch =
          md.match(/(?:followers?|connections?)\s*[:=\-–—]\s*([0-9kK+,]+)/i) ||
          md.match(/\b([0-9kK+,]+)\s+(?:linkedin\s+)?followers\b/i)

        const matched = commentMatch?.[1] || badgeMatch?.[1] || textMatch?.[1]
        if (matched) {
          const num = parseInt(matched.trim(), 10)
          if (num >= 50 && num < 100000) {
            followers = matched.trim()
            connections = followers.includes('+') ? followers : `${followers}+`
          }
        }
      }
    } catch (e) {}

    // 2. Attempt fetching public LinkedIn profile
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2500)

      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (response.ok) {
        const html = await response.text()
        const connMatch = html.match(/(\d[\d,+]*(?:\+|k|K)?)\s*(?:connections|connection)/i)
        const follMatch = html.match(/(\d[\d,+]*(?:\+|k|K)?)\s*(?:followers|follower)/i)
        if (connMatch) {
          const num = parseInt(connMatch[1], 10)
          if (num >= 50 && num < 100000) connections = connMatch[1].trim()
        }
        if (follMatch) {
          const num = parseInt(follMatch[1], 10)
          if (num >= 50 && num < 100000) followers = follMatch[1].trim()
        }
      }
    } catch (e) {}

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=1800, s-maxage=3600'
      },
      body: JSON.stringify({
        username,
        profileUrl,
        connections: connections.includes('+') ? connections : `${connections}+`,
        followers: followers.replace(/\+$/, ''),
        displayFollowers: `${followers.replace(/\+$/, '')} Followers`,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        username,
        profileUrl,
        connections: '805+',
        followers: '805',
        displayFollowers: '805 Followers',
        updatedAt: new Date().toISOString()
      })
    }
  }
}
