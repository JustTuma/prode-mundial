'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfileForm({ profile }: { profile: any }) {
  const [username, setUsername] = useState(profile?.username || '')
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(profile?.avatar_url || '')
  const supabase = createClient()
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('profiles')
      .update({ username, full_name: fullName, avatar_url: avatarUrl })
      .eq('id', user.id)

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        ✏️ Editar Perfil
      </h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Avatar preview + URL */}
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Foto de perfil</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '2px solid #2a2a3e',
            }}>
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setPreview('')}
                />
              ) : (
                <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>
                  {username?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                className="input"
                placeholder="Pegá la URL de tu foto (ej: https://...)"
                value={avatarUrl}
                onChange={e => { setAvatarUrl(e.target.value); setPreview(e.target.value) }}
              />
              <p style={{ color: '#374151', fontSize: '11px', margin: '4px 0 0' }}>
                Podés usar el link de tu foto de Google, WhatsApp o cualquier imagen
              </p>
            </div>
          </div>
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Nombre de usuario</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} minLength={3} required />
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Nombre completo</label>
          <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Opcional" />
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}

        <button type="submit" className={saved ? 'btn-secondary' : 'btn-primary'} disabled={loading}>
          {loading ? '...' : saved ? '✅ ¡Guardado! Todos pueden ver los cambios' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
