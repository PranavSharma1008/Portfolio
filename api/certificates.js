export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const repo = (req.query && req.query.repo) || 'Certificates'
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
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
      return res.status(200).json({ tree: [], empty: true, repo })
    }

    if (!ghRes.ok) {
      return res.status(ghRes.status).json({
        error: `GitHub API responded with ${ghRes.status}`,
        tree: [],
        empty: false
      })
    }

    const data = await ghRes.json()
    const tree = Array.isArray(data.tree) ? data.tree : []
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    return res.status(200).json({ tree, empty: tree.length === 0, repo })
  } catch (error) {
    return res.status(500).json({ error: error.message, tree: [], empty: false })
  }
}
