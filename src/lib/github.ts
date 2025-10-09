import { createClient } from '@/lib/supabase/client'

export async function signInWithGitHub() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'read:user read:org repo',
      redirectTo: `${window.location.origin}/dashboard`
    }
  })

  if (error) {
    return { success: false, error: { message: error.message } }
  }

  return { success: true, data }
}

export async function getGitHubProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
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

export async function getGitHubRepos(accessToken: string) {
  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        'Authorization': `token ${accessToken}`,
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