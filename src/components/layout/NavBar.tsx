'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types'

type IconProps = { active: boolean }
const stroke = (active: boolean) => (active ? 'var(--accent)' : 'var(--muted)')

const Icons = {
  inicio: ({ active }: IconProps) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ),
  partidos: ({ active }: IconProps) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5 15.5 10l-1.3 4.2H9.8L8.5 10z" /></svg>
  ),
  ranking: ({ active }: IconProps) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6.5H4.5V8a3 3 0 0 0 3 3M17 6.5h2.5V8a3 3 0 0 1-3 3" /><path d="M9.5 20h5M12 13.5V20" /></svg>
  ),
  social: ({ active }: IconProps) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20l1.3-4.4A8 8 0 1 1 21 11.5Z" /></svg>
  ),
  perfil: ({ active }: IconProps) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></svg>
  ),
}

const NAV = [
  { href: '/dashboard', label: 'Inicio', icon: Icons.inicio },
  { href: '/matches', label: 'Partidos', icon: Icons.partidos },
  { href: '/ranking', label: 'Ranking', icon: Icons.ranking },
  { href: '/social', label: 'Social', icon: Icons.social },
  { href: '/profile', label: 'Perfil', icon: Icons.perfil },
]

export default function NavBar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar: wordmark PRODE26 + pozo + avatar */}
      <header style={{
        background: 'var(--bg)',
        paddingTop: 'calc(14px + env(safe-area-inset-top))',
        paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline' }}>
          <span className="font-display" style={{ fontSize: '23px', color: 'var(--ink)', letterSpacing: '.5px' }}>
            PRODE<span style={{ color: 'var(--accent)' }}>26</span>
          </span>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent2)', marginLeft: '4px', alignSelf: 'flex-start', marginTop: '4px' }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/profile" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            padding: '7px 11px', borderRadius: '999px', fontSize: '12px',
            fontWeight: 800, color: 'var(--ink)', textDecoration: 'none',
          }}>
            <span style={{ color: 'var(--accent2)' }}>⭐</span>
            {profile?.total_points ?? 0}
            <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '11px' }}>pts</span>
          </Link>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              fontFamily: 'Anton, sans-serif', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile?.username?.[0]?.toUpperCase() || 'T'
              }
            </div>
          </Link>
        </div>
      </header>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--surface)', borderTop: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100, padding: '11px 6px calc(11px + env(safe-area-inset-bottom))',
      }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              textDecoration: 'none',
            }}>
              <Icon active={active} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: active ? 'var(--accent)' : 'var(--muted)' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
