'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfileForm({ profile }: { profile: any }) {
  const [username, setUsername] = useState(profile?.username || '')
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('profiles').update({ username, full_name: fullName }).eq('id', user.id)
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
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          {loading ? '...' : saved ? '✅ Guardado' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
