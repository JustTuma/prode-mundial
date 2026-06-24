'use client'
import { ThemeProvider } from '@/lib/theme'
import NavBar from '@/components/layout/NavBar'
import type { Profile } from '@/lib/types'

export default function AppShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <NavBar profile={profile} />
        <main style={{ flex: 1, padding: '4px 16px 100px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
