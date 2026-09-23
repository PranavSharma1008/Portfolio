export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      },
      body: ''
    }
  }

  const repo = (event.queryStringParameters && event.queryStringParameters.repo) || 'Certificates'
  const owner = 'PranavSharma1008'
  const branch = 'main'

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Certificates-Sync'
    }

    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`
    }

    const ghRes = await fetch(apiUrl, { headers })

    if (ghRes.status === 404 || ghRes.status === 409) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        },
        body: JSON.stringify({ tree: [], empty: true, repo })
      }
    }

    if (!ghRes.ok) {
      return {
        statusCode: ghRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: `GitHub API responded with ${ghRes.status}`, tree: [], empty: false })
      }
    }

    const data = await ghRes.json()
    const tree = Array.isArray(data.tree) ? data.tree : []

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      },
      body: JSON.stringify({ tree, empty: tree.length === 0, repo })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message, tree: [], empty: false })
    }
  }
}
