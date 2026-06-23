import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/layout/NavBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar profile={profile} />
      <main style={{ flex: 1, padding: '24px 16px 100px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
