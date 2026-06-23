'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Prediction } from '@/lib/types'

interface Props {
  matchId: number
  homeTeam: string
  awayTeam: string
  homeFlag?: string | null
  awayFlag?: string | null
  existingPrediction: Prediction | null
}

function AdjustBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: '#1e1e2e', border: 'none', borderRadius: '10px',
      width: '44px', height: '44px', color: '#f0f0f5', fontSize: '22px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 300, transition: 'background 0.15s', flexShrink: 0,
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#2a2a3e')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1e1e2e')}
    >
      {label}
    </button>
  )
}

export default function PredictionForm({ matchId, homeTeam, awayTeam, homeFlag, awayFlag, existingPrediction }: Props) {
  const [home, setHome] = useState<number>(existingPrediction?.home_score_pred ?? 0)
  const [away, setAway] = useState<number>(existingPrediction?.away_score_pred ?? 0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function adjust(team: 'home' | 'away', delta: number) {
    if (team === 'home') setHome(v => Math.max(0, v + delta))
    else setAway(v => Math.max(0, v + delta))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const { error: err } = await supabase.from('predictions').upsert({
      user_id: user.id,
      match_id: matchId,
      home_score_pred: home,
      away_score_pred: away,
    }, { onConflict: 'user_id,match_id' })

    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  const isEdit = !!existingPrediction

  // Color del resultado predicho
  const resultColor = home > away ? '#3b82f6' : home < away ? '#8b5cf6' : '#6b7280'
  const resultLabel = home > away ? `Gana ${homeTeam}` : home < away ? `Gana ${awayTeam}` : 'Empate'

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px',
    }}>

      {/* Score picker */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: '12px', marginBottom: '20px',
      }}>

        {/* Local */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {homeFlag
            ? <img src={homeFlag} style={{ width: '40px', height: '28px', objectFit: 'contain', borderRadius: '3px' }} alt="" />
            : <span style={{ fontSize: '28px' }}>🏳️</span>
          }
          <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '13px', textAlign: 'center' }}>{homeTeam}</div>
          <AdjustBtn onClick={() => adjust('home', 1)} label="+" />
          <div style={{
            width: '64px', height: '64px', borderRadius: '12px',
            background: '#0a0a0f', border: '2px solid #2a2a3e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 900, color: '#fff',
          }}>
            {home}
          </div>
          <AdjustBtn onClick={() => adjust('home', -1)} label="−" />
        </div>

        {/* Centro */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#374151', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>-</div>
          <div style={{
            marginTop: '12px', fontSize: '11px', fontWeight: 700,
            color: resultColor, background: resultColor + '22',
            padding: '4px 10px', borderRadius: '99px', whiteSpace: 'nowrap',
          }}>
            {resultLabel}
          </div>
        </div>

        {/* Visitante */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {awayFlag
            ? <img src={awayFlag} style={{ width: '40px', height: '28px', objectFit: 'contain', borderRadius: '3px' }} alt="" />
            : <span style={{ fontSize: '28px' }}>🏳️</span>
          }
          <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '13px', textAlign: 'center' }}>{awayTeam}</div>
          <AdjustBtn onClick={() => adjust('away', 1)} label="+" />
          <div style={{
            width: '64px', height: '64px', borderRadius: '12px',
            background: '#0a0a0f', border: '2px solid #2a2a3e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 900, color: '#fff',
          }}>
            {away}
          </div>
          <AdjustBtn onClick={() => adjust('away', -1)} label="−" />
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

      <button
        type="submit"
        style={{
          width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700,
          borderRadius: '10px', border: 'none', cursor: loading ? 'wait' : 'pointer',
          background: saved ? '#10b981' : 'linear-gradient(135deg, #003087, #0050c8)',
          color: '#fff', transition: 'all 0.2s',
        }}
        disabled={loading}
      >
        {loading ? '⏳ Guardando...' : saved ? '✅ ¡Predicción guardada!' : isEdit ? '✏️ Actualizar predicción' : '🎯 Guardar predicción'}
      </button>

      <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px', marginBottom: 0 }}>
        Podés cambiar tu predicción hasta que empiece el partido
      </p>
    </form>
  )
}
