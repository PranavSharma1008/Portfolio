exports.handler = async (event, context) => {
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

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

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
        followers: followers.includes('+') ? followers : `${followers}+`,
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
        connections: '700+',
        followers: '700+',
        updatedAt: new Date().toISOString()
      })
    }
  }
}
