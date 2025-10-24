import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Server-side redirect to the actual signin page
  redirect('/auth/supabase-signin')
}
