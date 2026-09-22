export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const username = 'pranavsharma1008'
  const profileUrl = `https://www.linkedin.com/in/${username}/`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    // Attempt fetching public profile to extract latest connection stats
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    let connections = '700+'
    let followers = '700+'

    if (response.ok) {
      const html = await response.text()
      const connMatch = html.match(/(\d[\d,+]*(?:\+|k|K)?)\s*(?:connections|connection)/i)
      const follMatch = html.match(/(\d[\d,+]*(?:\+|k|K)?)\s*(?:followers|follower)/i)
      if (connMatch) connections = connMatch[1].trim()
      if (follMatch) followers = follMatch[1].trim()
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return res.status(200).json({
      username,
      profileUrl,
      connections: connections.includes('+') ? connections : `${connections}+`,
      followers: followers.includes('+') ? followers : `${followers}+`,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    return res.status(200).json({
      username,
      profileUrl,
      connections: '700+',
      followers: '700+',
      updatedAt: new Date().toISOString()
    })
  }
}
