'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const EMOJIS = ['🏆', '⚽', '🦁', '🦅', '🐯', '🔥', '⚡', '🌟', '💪', '🎯', '🧙', '🦊']

export default function CreateLeagueForm() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [emoji, setEmoji] = useState('🏆')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [created, setCreated] = useState<{ name: string; code: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const code = generateInviteCode()
    const { data, error } = await supabase.from('leagues').insert({
      name, description: desc, invite_code: code, owner_id: user.id, avatar_emoji: emoji,
    }).select().single()

    if (!error && data) {
      await supabase.from('league_members').insert({ league_id: data.id, user_id: user.id })
      setCreated({ name, code })
      setName(''); setDesc('')
    }
    setLoading(false)
    router.refresh()
  }

  if (created) return (
    <div style={{ background: '#12121a', border: '1px solid #10b98144', borderRadius: '12px', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '48px' }}>🎉</div>
        <h3 style={{ color: '#10b981', margin: '8px 0' }}>¡Liga creada!</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Compartí este código con tus amigos:</p>
        <div style={{
          background: '#1e1e2e', borderRadius: '8px', padding: '12px 24px', marginTop: '12px',
          fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: '#f59e0b',
          letterSpacing: '6px',
        }}>
          {created.code}
        </div>
      </div>
      <button onClick={() => { setCreated(null); setShow(false) }} className="btn-secondary" style={{ width: '100%' }}>
        Cerrar
      </button>
    </div>
  )

  return (
    <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>➕ Crear Liga</h3>
      {!show ? (
        <button onClick={() => setShow(true)} className="btn-primary" style={{ width: '100%' }}>
          Crear nueva liga
        </button>
      ) : (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Emoji de la liga</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)} style={{
                  fontSize: '20px', padding: '4px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
                  background: emoji === e ? '#3b82f622' : 'transparent',
                  borderColor: emoji === e ? '#3b82f6' : 'transparent',
                }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <input className="input" placeholder="Nombre de la liga" value={name} onChange={e => setName(e.target.value)} required />
          <input className="input" placeholder="Descripción (opcional)" value={desc} onChange={e => setDesc(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setShow(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-gold" style={{ flex: 1 }} disabled={loading}>
              {loading ? '...' : '🚀 Crear'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
