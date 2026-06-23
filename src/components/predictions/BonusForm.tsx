'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  teams: string[]
  existingBonus: any
}

export default function BonusForm({ teams, existingBonus }: Props) {
  const [champion, setChampion] = useState(existingBonus?.champion || '')
  const [runnerUp, setRunnerUp] = useState(existingBonus?.runner_up || '')
  const [third, setThird] = useState(existingBonus?.third_place || '')
  const [topScorer, setTopScorer] = useState(existingBonus?.top_scorer || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('bonus_predictions').upsert({
      user_id: user.id,
      champion, runner_up: runnerUp, third_place: third, top_scorer: topScorer,
    }, { onConflict: 'user_id' })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
    router.refresh()
  }

  const fields = [
    { emoji: '🏆', label: 'Campeón', value: champion, setter: setChampion, pts: 10 },
    { emoji: '🥈', label: 'Subcampeón', value: runnerUp, setter: setRunnerUp, pts: 5 },
    { emoji: '🥉', label: 'Tercer puesto', value: third, setter: setThird, pts: 3 },
  ]

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fields.map(f => (
        <div key={f.label} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label style={{ fontWeight: 700, fontSize: '15px' }}>{f.emoji} {f.label}</label>
            <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>+{f.pts} pts</span>
          </div>
          <select
            value={f.value}
            onChange={e => f.setter(e.target.value)}
            style={{
              background: '#1e1e2e', border: '1px solid #2a2a3e', borderRadius: '8px',
              padding: '10px 12px', color: '#f0f0f5', width: '100%', outline: 'none',
              fontSize: '14px', cursor: 'pointer',
            }}
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      ))}

      {/* Top scorer - text input */}
      <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label style={{ fontWeight: 700, fontSize: '15px' }}>⚽ Goleador</label>
          <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>+5 pts</span>
        </div>
        <input className="input" placeholder="Nombre del jugador (ej: Messi)" value={topScorer}
          onChange={e => setTopScorer(e.target.value)} />
      </div>

      <button type="submit" className={saved ? 'btn-secondary' : 'btn-gold'} style={{ padding: '14px', fontSize: '16px' }} disabled={loading}>
        {loading ? '⏳ Guardando...' : saved ? '✅ ¡Guardado!' : '🌟 Guardar predicciones bonus'}
      </button>
      <p style={{ color: '#374151', fontSize: '12px', textAlign: 'center', margin: 0 }}>
        Podés cambiar tus bonus hasta que empiece el primer partido
      </p>
    </form>
  )
}
