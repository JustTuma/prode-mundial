'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function JoinLeagueForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const { data: league } = await supabase.from('leagues').select('*').eq('invite_code', code.toUpperCase().trim()).single()
    if (!league) { setError('Código inválido'); setLoading(false); return }

    const { error: err } = await supabase.from('league_members').upsert({ league_id: league.id, user_id: user.id }, { onConflict: 'league_id,user_id' })
    if (err) { setError('Ya estás en esta liga'); setLoading(false); return }

    setSuccess(`¡Te uniste a ${league.name}!`)
    setCode('')
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>🔑 Unirme a una Liga</h3>
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input className="input" placeholder="Código de invitación (ej: ABC123)" value={code}
          onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }} required />
        {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ color: '#10b981', fontSize: '13px' }}>{success}</div>}
        <button type="submit" className="btn-primary" disabled={loading || code.length < 6}>
          {loading ? '...' : '🚀 Unirme'}
        </button>
      </form>
    </div>
  )
}
