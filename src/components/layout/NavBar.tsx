'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

const NAV = [
  { href: '/dashboard', label: 'Inicio', emoji: '🏠' },
  { href: '/matches', label: 'Partidos', emoji: '⚽' },
  { href: '/social', label: 'Social', emoji: '💬' },
  { href: '/ranking', label: 'Ranking', emoji: '🏅' },
  { href: '/profile', label: 'Perfil', emoji: '👤' },
]

export default function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Top bar */}
      <header style={{
        background: '#12121a', borderBottom: '1px solid #1e1e2e',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🏆</span>
          <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '18px' }}>Prode Mundial</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>2026</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '14px',
                overflow: 'hidden', border: '2px solid #2a2a3e',
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile.username?.[0]?.toUpperCase() || '?'
                }
              </div>
              <div style={{ display: 'none' }} className="md-show">
                <div style={{ color: '#f0f0f5', fontSize: '14px', fontWeight: 600 }}>{profile.username}</div>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>⭐ {profile.total_points} pts</div>
              </div>
            </div>
          )}
          <button onClick={signOut} style={{
            background: 'transparent', border: '1px solid #2a2a3e', borderRadius: '8px',
            padding: '6px 12px', color: '#6b7280', cursor: 'pointer', fontSize: '13px',
          }}>
            Salir
          </button>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#12121a', borderTop: '1px solid #1e1e2e',
        display: 'flex', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV.map(({ href, label, emoji }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 4px 6px', textDecoration: 'none', gap: '2px',
              borderTop: active ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '20px' }}>{emoji}</span>
              <span style={{ fontSize: '10px', color: active ? '#f59e0b' : '#6b7280', fontWeight: active ? 700 : 400 }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
