import { signIn } from "next-auth/react"

export async function signInWithGitHub() {
  try {
    const result = await signIn('github', { 
      callbackUrl: '/dashboard',
      redirect: false 
    })
    
    if (result?.error) {
      return { success: false, error: { message: result.error } }
    }
    
    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export async function getGitHubProfile(accessToken?: string) {
  try {
    // Use provided access token or fallback to API token
    const token = accessToken || process.env.GITHUB_API_TOKEN
    
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub profile')
    }

    const profile = await response.json()
    return { success: true, profile }
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export async function getGitHubRepos(accessToken?: string) {
  try {
    // Use provided access token or fallback to API token
    const token = accessToken || process.env.GITHUB_API_TOKEN
    
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repositories')
    }

    const repos = await response.json()
    return { success: true, repos }
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}