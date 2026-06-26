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

export default function ProfileView({ profile, rank, myPoints, myExact, earnedIds, records }: {
  profile: any; rank: number; myPoints: number; myExact: number; earnedIds: string[]
  records?: { currentStreak: number; bestStreak: number; accuracy: number; played: number }
}) {
  const { theme, setTheme } = useTheme()
  const [editOpen, setEditOpen] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const earned = new Set(earnedIds)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    if (file.size > 5 * 1024 * 1024) { setUploadError('La imagen es muy grande (máx 5MB)'); return }
    setUploading(true)
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${profile.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setUploadError('Error al subir: ' + upErr.message); setUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploading(false)
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
        <button onClick={() => { setEditOpen(true); setTimeout(() => document.getElementById('editar-perfil')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60) }}
          style={{ marginTop: '12px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--accent)', fontWeight: 800, fontSize: '13px', padding: '8px 20px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'Archivo' }}>
          ✏️ Editar perfil
        </button>
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

      {/* Tus récords */}
      {records && records.played > 0 && (
        <>
          <h2 className="font-display" style={{ fontSize: '19px', color: 'var(--ink)', margin: '20px 0 12px' }}>Tus récords</h2>
          <div className="card" style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', textAlign: 'center' }}>
            <div>
              <div className="font-display" style={{ fontSize: '26px', color: records.currentStreak >= 2 ? 'var(--neg)' : 'var(--ink)' }}>{records.currentStreak >= 2 ? '🔥' : ''}{records.currentStreak}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>Racha actual</div>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '26px', color: 'var(--accent2)' }}>{records.bestStreak}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>Mejor racha</div>
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '26px', color: 'var(--accent)' }}>{records.accuracy}%</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>Acierto</div>
            </div>
          </div>
        </>
      )}

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
      <div id="editar-perfil" className="card" style={{ marginTop: '18px', borderRadius: '16px', overflow: 'hidden', scrollMarginTop: '80px' }}>
        <button onClick={() => setEditOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: '1px solid var(--line)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', background: 'none', border: 'none', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--line)', cursor: 'pointer', fontFamily: 'Archivo' }}>
          Editar perfil <span style={{ color: 'var(--muted)' }}>{editOpen ? '▾' : '›'}</span>
        </button>
        {editOpen && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Foto: preview + subir desde el celular */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Anton', fontSize: '24px', flexShrink: 0 }}>
                {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <span style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: '13px', padding: '10px 16px', borderRadius: '10px', textAlign: 'center', width: '100%', fontFamily: 'Archivo' }}>
                    {uploading ? 'Subiendo…' : '📷 Subir foto'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <p style={{ color: 'var(--muted)', fontSize: '11px', margin: '6px 0 0' }}>Elegí una foto de tu celu (máx 5MB)</p>
              </div>
            </div>
            {uploadError && <div style={{ color: 'var(--neg)', fontSize: '12px' }}>{uploadError}</div>}

            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nombre de usuario" />

            <details>
              <summary style={{ color: 'var(--muted)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>O pegar el link de una imagen</summary>
              <input className="input" style={{ marginTop: '8px' }} value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </details>

            <button onClick={saveProfile} disabled={saving || uploading} className="btn-accent">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        )}
        <Link href="/mundial/reglas" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: '1px solid var(--line)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Reglas del prode <span style={{ color: 'var(--muted)' }}>›</span></div>
        </Link>
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
