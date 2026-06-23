'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Prediction } from '@/lib/types'

interface Props {
  matchId: number
  homeTeam: string
  awayTeam: string
  existingPrediction: Prediction | null
}

export default function PredictionForm({ matchId, homeTeam, awayTeam, existingPrediction }: Props) {
  const [home, setHome] = useState<string>(existingPrediction?.home_score_pred?.toString() ?? '')
  const [away, setAway] = useState<string>(existingPrediction?.away_score_pred?.toString() ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (home === '' || away === '') return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const { error: err } = await supabase.from('predictions').upsert({
      user_id: user.id,
      match_id: matchId,
      home_score_pred: parseInt(home),
      away_score_pred: parseInt(away),
    }, { onConflict: 'user_id,match_id' })

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  function adjust(team: 'home' | 'away', delta: number) {
    if (team === 'home') setHome(prev => Math.max(0, (parseInt(prev) || 0) + delta).toString())
    else setAway(prev => Math.max(0, (parseInt(prev) || 0) + delta).toString())
  }

  const isEdit = !!existingPrediction

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        {/* Home */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>{homeTeam}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={() => adjust('home', 1)} style={{
              background: '#1e1e2e', border: 'none', borderRadius: '8px', width: '36px', height: '36px',
              color: '#f0f0f5', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <input className="score-input" type="number" min="0" max="20" value={home}
              onChange={e => setHome(e.target.value)} required />
            <button type="button" onClick={() => adjust('home', -1)} style={{
              background: '#1e1e2e', border: 'none', borderRadius: '8px', width: '36px', height: '36px',
              color: '#f0f0f5', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#6b7280', fontWeight: 700, fontSize: '1.5rem' }}>-</div>

        {/* Away */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>{awayTeam}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={() => adjust('away', 1)} style={{
              background: '#1e1e2e', border: 'none', borderRadius: '8px', width: '36px', height: '36px',
              color: '#f0f0f5', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <input className="score-input" type="number" min="0" max="20" value={away}
              onChange={e => setAway(e.target.value)} required />
            <button type="button" onClick={() => adjust('away', -1)} style={{
              background: '#1e1e2e', border: 'none', borderRadius: '8px', width: '36px', height: '36px',
              color: '#f0f0f5', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
          </div>
        </div>
      </div>

      {/* Quick score buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
        {[['1-0','1','0'],['2-0','2','0'],['2-1','2','1'],['1-1','1','1'],['0-0','0','0'],['0-1','0','1'],['0-2','0','2'],['1-2','1','2']].map(([label, h, a]) => (
          <button key={label} type="button"
            onClick={() => { setHome(h); setAway(a) }}
            style={{
              background: home === h && away === a ? '#3b82f6' : '#1e1e2e',
              border: '1px solid', borderColor: home === h && away === a ? '#3b82f6' : '#2a2a3e',
              borderRadius: '8px', padding: '6px 12px', color: '#f0f0f5', cursor: 'pointer',
              fontSize: '13px', fontWeight: home === h && away === a ? 700 : 400,
              transition: 'all 0.15s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

      <button type="submit" className={saved ? 'btn-secondary' : 'btn-primary'} style={{ width: '100%', padding: '12px', fontSize: '15px' }} disabled={loading}>
        {loading ? '⏳ Guardando...' : saved ? '✅ ¡Guardado!' : isEdit ? '✏️ Actualizar predicción' : '🎯 Guardar predicción'}
      </button>

      <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
        Podés cambiar tu predicción hasta que empiece el partido
      </p>
    </form>
  )
}
