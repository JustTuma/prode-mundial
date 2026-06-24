'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme, type Theme } from '@/lib/theme'
import { InstallGuideSection } from '@/components/InstallGuide'

const ALL_ACHIEVEMENTS = [
  { id: 'first_pred', name: 'Primer pronóstico', emoji: '🎯' },
  { id: 'exacto_1', name: 'Ojo de águila', emoji: '🦅' },
  { id: 'exacto_5', name: 'Adivino', emoji: '🔮' },
  { id: 'exacto_10', name: 'Mago del prode', emoji: '🧙' },
  { id: 'points_50', name: 'En racha', emoji: '🔥' },
  { id: 'points_100', name: 'Centurión', emoji: '💯' },
  { id: 'points_200', name: 'Leyenda', emoji: '🏆' },
  { id: 'all_group', name: 'Fanático', emoji: '⚽' },
  { id: 'champion_correct', name: 'El oráculo', emoji: '🌟' },
]

const THEMES: { id: Theme; label: string; swatch: string[] }[] = [
  { id: 'hinchada', label: 'Hinchada', swatch: ['#2E8BE6', '#F6B400', '#E9F3FF'] },
  { id: 'negro', label: 'Negro', swatch: ['#4FA8FF', '#FFD23F', '#0A0A0F'] },
  { id: 'noche', label: 'Noche', swatch: ['#5FB1FF', '#FFD23F', '#0B1220'] },
]

export default function ProfileView({ profile, rank, myPoints, myExact, earnedIds }: {
  profile: any; rank: number; myPoints: number; myExact: number; earnedIds: string[]
}) {
  const { theme, setTheme } = useTheme()
  const [editOpen, setEditOpen] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const earned = new Set(earnedIds)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ username, avatar_url: avatarUrl }).eq('id', profile.id)
    setSaving(false)
    setEditOpen(false)
    router.refresh()
  }

  return (
    <div className="risein">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 18px' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Anton', fontSize: '34px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile?.username?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)', marginTop: '12px' }}>{profile?.full_name || profile?.username}</h1>
        <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>@{profile?.username}</span>
      </div>

      {/* Stats grid 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { v: myPoints, l: 'Puntos', c: 'var(--accent)' },
          { v: rank ? `#${rank}` : '-', l: 'Posición', c: 'var(--ink)' },
          { v: myExact, l: 'Marcadores exactos', c: 'var(--accent2)' },
          { v: profile?.predictions_made || 0, l: 'Pronósticos', c: 'var(--ink)' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '14px', borderRadius: '16px' }}>
            <div className="font-display" style={{ fontSize: '28px', color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Premios */}
      <div style={{ marginTop: '16px', borderRadius: '20px', padding: '18px', background: 'var(--grad)', color: '#fff', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.7px', opacity: .9 }}>Premio del grupo</div>
          <div className="font-display" style={{ fontSize: '34px', marginTop: '2px' }}>🍔 La hamburguesa</div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ganador de la semana</span><span className="font-display">🥇</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: .85, borderTop: '1px solid rgba(255,255,255,.25)', paddingTop: '8px' }}><span>Último del torneo</span><span>organiza el asado</span></div>
          </div>
        </div>
      </div>

      {/* Logros */}
      <h2 className="font-display" style={{ fontSize: '19px', color: 'var(--ink)', margin: '20px 0 12px' }}>Logros</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {ALL_ACHIEVEMENTS.map(a => {
          const got = earned.has(a.id)
          return (
            <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', textAlign: 'center', opacity: got ? 1 : 0.45 }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: got ? 'var(--accent2)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{a.emoji}</div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{a.name}</span>
            </div>
          )
        })}
      </div>

      {/* Estilo de la app */}
      <h2 className="font-display" style={{ fontSize: '19px', color: 'var(--ink)', margin: '22px 0 12px' }}>Estilo de la app</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)} style={{
            flex: 1, border: `2px solid ${theme === t.id ? 'var(--accent)' : 'var(--line)'}`,
            background: 'var(--surface)', borderRadius: '16px', padding: '12px 8px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ display: 'flex', gap: '4px' }}>
              {t.swatch.map((c, i) => <span key={i} style={{ width: '14px', height: '14px', borderRadius: '4px', background: c, border: '1px solid rgba(125,125,125,.25)' }} />)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Ajustes */}
      <div className="card" style={{ marginTop: '18px', borderRadius: '16px', overflow: 'hidden' }}>
        <button onClick={() => setEditOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: '1px solid var(--line)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', background: 'none', border: 'none', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--line)', cursor: 'pointer', fontFamily: 'Archivo' }}>
          Editar perfil <span style={{ color: 'var(--muted)' }}>{editOpen ? '▾' : '›'}</span>
        </button>
        {editOpen && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nombre de usuario" />
            <input className="input" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="URL de tu foto" />
            <button onClick={saveProfile} disabled={saving} className="btn-accent">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        )}
        <Link href="/predict/bonus" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: '1px solid var(--line)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Predicciones bonus <span style={{ color: 'var(--accent)', fontWeight: 800 }}>🌟</span></div>
        </Link>
        <div style={{ padding: '15px 16px', borderBottom: '1px solid var(--line)' }}>
          <InstallGuideSection />
        </div>
        <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--neg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Archivo' }}>
          Cerrar sesión <span>›</span>
        </button>
      </div>
    </div>
  )
}
