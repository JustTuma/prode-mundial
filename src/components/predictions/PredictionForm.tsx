'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeamAvatar from '@/components/ui/TeamAvatar'
import type { Prediction } from '@/lib/types'

interface Props {
  matchId: number
  homeTeam: string
  awayTeam: string
  homeFlag?: string | null
  awayFlag?: string | null
  existingPrediction: Prediction | null
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', fontSize: '22px', fontWeight: 700, cursor: 'pointer', lineHeight: 0 }}>−</button>
      <span className="font-display" style={{ fontSize: '30px', minWidth: '24px', textAlign: 'center', color: 'var(--ink)' }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', fontSize: '20px', fontWeight: 700, cursor: 'pointer', lineHeight: 0 }}>+</button>
    </div>
  )
}

export default function PredictionForm({ matchId, homeTeam, awayTeam, homeFlag, awayFlag, existingPrediction }: Props) {
  const [home, setHome] = useState<number>(existingPrediction?.home_score_pred ?? 0)
  const [away, setAway] = useState<number>(existingPrediction?.away_score_pred ?? 0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    await supabase.from('predictions').upsert({
      user_id: user.id, match_id: matchId, home_score_pred: home, away_score_pred: away,
    }, { onConflict: 'user_id,match_id' })
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-start', gap: '6px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <TeamAvatar name={homeTeam} flag={homeFlag} size={46} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{homeTeam}</span>
          <Stepper value={home} onChange={setHome} />
        </div>
        <span className="font-display" style={{ fontSize: '16px', color: 'var(--muted)', marginTop: '14px' }}>VS</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <TeamAvatar name={awayTeam} flag={awayFlag} size={46} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{awayTeam}</span>
          <Stepper value={away} onChange={setAway} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-accent" style={{ marginTop: '16px', background: saved ? 'var(--pos)' : 'var(--accent)' }}>
        {loading ? 'Guardando…' : saved ? '✓ ¡Guardado!' : existingPrediction ? 'Actualizar pronóstico' : 'Cargar pronóstico'}
      </button>
    </form>
  )
}
