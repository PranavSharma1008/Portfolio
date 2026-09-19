/**
 * Automated Real-Time Live Sync Engine
 * 
 * Automatically triggered on every visit / login to pranavshrmaportfolio.netlify.app.
 * Fetches and synchronizes fresh live data from:
 * 1. LeetCode GraphQL & Public Mirror APIs (Problem Counts, Rankings, Avatar)
 * 2. GitHub LeetcodeBadges Repository (Milestone badges 250+, 200, 150)
 * 3. GitHub LeetcodeSerieGithub Repository (Latest solutions push activity)
 * 4. GitHub Certificates Repository (Newly uploaded certificates)
 * 5. GitHub TypingAchivenments Repository (Typing speed milestone screenshots)
 * 
 * Runs silently in the background with zero user action required.
 */

import { syncLeetCodeWithLiveSources } from './githubLeetcodeSync'
import { syncWithGitHubRepo } from './githubCertSync'
import { syncTypingWithGitHub } from './githubTypingSync'
import certificates from '../data/certificates'
import typingAchievements from '../data/typingAchievements'

let isSyncRunning = false

export const runAutoLiveSync = async (force = true) => {
  if (isSyncRunning) return
  isSyncRunning = true

  try {
    // Run all live fetching pipelines concurrently in the background
    await Promise.allSettled([
      // 1. Fetch live LeetCode problem stats + GitHub milestone badges
      syncLeetCodeWithLiveSources(force).catch((err) => {
        console.warn('[AutoLiveSync] LeetCode sync notice:', err?.message || err)
      }),

      // 2. Fetch live certificates from GitHub repository
      syncWithGitHubRepo(certificates, force).catch((err) => {
        console.warn('[AutoLiveSync] Certificates sync notice:', err?.message || err)
      }),

      // 3. Fetch live typing records from GitHub repository
      syncTypingWithGitHub(typingAchievements, force).catch((err) => {
        console.warn('[AutoLiveSync] Typing records sync notice:', err?.message || err)
      })
    ])
  } finally {
    isSyncRunning = false
  }
}

export default runAutoLiveSync
