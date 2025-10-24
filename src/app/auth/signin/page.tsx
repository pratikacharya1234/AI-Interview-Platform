import { redirect } from 'next/navigation'

export default function SignInPage() {
  // Redirect to Supabase signin
  redirect('/auth/supabase-signin')
}
