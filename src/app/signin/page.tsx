import { redirect } from 'next/navigation'

export default function SignInPage() {
  redirect('/auth/supabase-signin')
}
