export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        Origin: 'https://leetcode.com'
      },
      body
    })

    const data = await leetcodeRes.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
