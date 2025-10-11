// Utility to clear corrupted browser storage data
export function clearCorruptedStorage() {
  if (typeof window !== 'undefined') {
    try {
      // Clear potentially corrupted localStorage items
      const keysToCheck = [
        'supabase.auth.token',
        'sb-auth-token', 
        'sb-refresh-token',
        'supabase-auth-token'
      ]
      
      keysToCheck.forEach(key => {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            // Try to parse to see if it's valid JSON
            JSON.parse(item)
          }
        } catch (e) {
          // If parsing fails, remove the corrupted item
          localStorage.removeItem(key)
          console.log(`Cleared corrupted localStorage item: ${key}`)
        }
      })
      
      // Clear sessionStorage as well
      keysToCheck.forEach(key => {
        try {
          const item = sessionStorage.getItem(key)
          if (item) {
            JSON.parse(item)
          }
        } catch (e) {
          sessionStorage.removeItem(key)
          console.log(`Cleared corrupted sessionStorage item: ${key}`)
        }
      })
      
      // Clear all Supabase-related cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=')
        if (name && (name.startsWith('sb-') || name.includes('supabase'))) {
          try {
            const value = cookie.split('=')[1]
            if (value && (value.startsWith('base64-') || value.length > 1000)) {
              // This looks suspicious, clear it
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
            }
          } catch (e) {
            // If we can't process it, clear it
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        }
      })
      
    } catch (error) {
      console.warn('Error during storage cleanup:', error)
    }
  }
}

// Call this on app initialization
if (typeof window !== 'undefined') {
  // Run cleanup on page load
  clearCorruptedStorage()
}