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

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      },
      body: ''
    }
  }

  try {
    let query = LEETCODE_GRAPHQL_QUERY
    let variables = { username: 'SharmaPranav1008' }

    if (event.httpMethod === 'POST' && event.body) {
      try {
        const parsed = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
        if (parsed.query) query = parsed.query
        if (parsed.variables) variables = parsed.variables
      } catch (e) {
        // Fallback to default
      }
    } else if (event.queryStringParameters && event.queryStringParameters.username) {
      variables.username = event.queryStringParameters.username
    }

    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        Origin: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({ query, variables })
    })

    if (!leetcodeRes.ok) {
      return {
        statusCode: leetcodeRes.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: `LeetCode API responded with status ${leetcodeRes.status}` })
      }
    }

    const data = await leetcodeRes.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      },
      body: JSON.stringify(data)
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    }
  }
}
