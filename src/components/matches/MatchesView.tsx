'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TeamAvatar from '@/components/ui/TeamAvatar'
import { matchLabel } from '@/lib/utils'
import type { Match, Prediction } from '@/lib/types'

type Filter = 'proximos' | 'jugados'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', fontSize: '22px', fontWeight: 700, cursor: 'pointer', lineHeight: 0 }}>−</button>
      <span className="font-display" style={{ fontSize: '30px', minWidth: '24px', textAlign: 'center', color: 'var(--ink)' }}>{value}</span>
      <button onClick={() => onChange(Math.min(20, value + 1))} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', fontSize: '20px', fontWeight: 700, cursor: 'pointer', lineHeight: 0 }}>+</button>
    </div>
  )
}

function PredictorCard({ match, pred, userId, onSaved, locked }: { match: Match; pred: Prediction | undefined; userId?: string; onSaved: (m: number, h: number, a: number) => void; locked?: boolean }) {
  const [h, setH] = useState(pred?.home_score_pred ?? 0)
  const [a, setA] = useState(pred?.away_score_pred ?? 0)
  const [editing, setEditing] = useState(!pred && !locked)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function submit() {
    if (!userId) return
    setSaving(true)
    await supabase.from('predictions').upsert({
      user_id: userId, match_id: match.id, home_score_pred: h, away_score_pred: a,
    }, { onConflict: 'user_id,match_id' })
    setSaving(false)
    setEditing(false)
    onSaved(match.id, h, a)
  }

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', background: 'var(--surface2)', padding: '4px 9px', borderRadius: '999px', letterSpacing: '.4px' }}>{matchLabel(match.group_name, match.stage)}</span>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>{fmtDate(match.match_date)} · {fmtTime(match.match_date)} hs</span>
      </div>

      {editing ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-start', gap: '6px', marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <TeamAvatar name={match.home_team} code={match.home_team_code} flag={match.home_team_flag} size={46} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{match.home_team}</span>
              <Stepper value={h} onChange={setH} />
            </div>
            <span className="font-display" style={{ fontSize: '16px', color: 'var(--muted)', marginTop: '14px' }}>VS</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <TeamAvatar name={match.away_team} code={match.away_team_code} flag={match.away_team_flag} size={46} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{match.away_team}</span>
              <Stepper value={a} onChange={setA} />
            </div>
          </div>
          <button onClick={submit} disabled={saving} className="btn-accent" style={{ marginTop: '16px', borderRadius: '13px', padding: '13px' }}>
            {saving ? 'Guardando…' : 'Cargar pronóstico'}
          </button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '90px' }}>
              <TeamAvatar name={match.home_team} code={match.home_team_code} flag={match.home_team_flag} size={46} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{match.home_team}</span>
            </div>
            <span className="font-display" style={{ fontSize: '34px', color: 'var(--ink)' }}>{h} - {a}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '90px' }}>
              <TeamAvatar name={match.away_team} code={match.away_team_code} flag={match.away_team_flag} size={46} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{match.away_team}</span>
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: '12px', padding: '10px 14px' }}>
            {locked ? (
              <>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--neg)' }}>🔒 En juego · bloqueado</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>{pred ? 'Tu pronóstico arriba' : 'Sin pronóstico'}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>✓ Pronóstico cargado</span>
                <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 800, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Archivo' }}>Editar</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function MatchesView({ matches, predictions, userId }: { matches: Match[]; predictions: Prediction[]; userId?: string }) {
  const [filter, setFilter] = useState<Filter>('proximos')
  const [toast, setToast] = useState('')
  const [localPreds, setLocalPreds] = useState<Record<number, Prediction>>(
    () => Object.fromEntries(predictions.map(p => [p.match_id, p]))
  )
  const router = useRouter()

  function onSaved(matchId: number, h: number, a: number) {
    setLocalPreds(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), match_id: matchId, home_score_pred: h, away_score_pred: a } as Prediction }))
    setToast('¡Pronóstico cargado!')
    setTimeout(() => setToast(''), 1900)
    router.refresh()
  }

  const now = Date.now()
  const started = (m: Match) => new Date(m.match_date).getTime() <= now || ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
  // Editables: no empezaron y no terminaron
  const upcoming = matches.filter(m => m.status !== 'FINISHED' && !started(m))
    .sort((x, y) => new Date(x.match_date).getTime() - new Date(y.match_date).getTime())
  // En juego: empezaron pero no terminaron -> bloqueados
  const live = matches.filter(m => m.status !== 'FINISHED' && started(m))
    .sort((x, y) => new Date(x.match_date).getTime() - new Date(y.match_date).getTime())
  const played = matches.filter(m => m.status === 'FINISHED')
    .sort((x, y) => new Date(y.match_date).getTime() - new Date(x.match_date).getTime())

  const chip = (f: Filter, label: string) => (
    <button onClick={() => setFilter(f)} style={{
      flexShrink: 0, border: '1px solid var(--line)',
      background: filter === f ? 'var(--accent)' : 'var(--surface)',
      color: filter === f ? 'var(--accent-ink)' : 'var(--muted)',
      borderRadius: '999px', padding: '10px 18px', fontWeight: 800, fontSize: '13px',
      cursor: 'pointer', fontFamily: 'Archivo', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div className="risein">
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 4px' }}>Partidos</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '14px' }}>Resultado exacto: 3 pts · acertar ganador: 1 pt</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
        {chip('proximos', 'Próximos')}
        {chip('jugados', 'Jugados')}
      </div>

      {filter === 'proximos' && (
        <>
          {live.map(m => <PredictorCard key={m.id} match={m} pred={localPreds[m.id]} userId={userId} onSaved={onSaved} locked />)}
          {upcoming.length === 0 && live.length === 0
            ? <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>No hay próximos partidos</div>
            : upcoming.map(m => <PredictorCard key={m.id} match={m} pred={localPreds[m.id]} userId={userId} onSaved={onSaved} />)}
        </>
      )}

      {filter === 'jugados' && (
        played.length === 0
          ? <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Todavía no hay partidos jugados</div>
          : played.map(m => {
            const pred = localPreds[m.id]
            const exacto = pred?.is_exact
            const correct = pred?.is_correct_result
            const tag = !pred ? 'SIN PRONÓSTICO' : exacto ? 'EXACTO' : correct ? 'RESULTADO' : 'NO ACERTÓ'
            const tagColor = exacto ? 'var(--pos)' : correct ? 'var(--accent)' : 'var(--muted)'
            return (
              <div key={m.id} className="card" style={{ padding: '16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', background: 'var(--surface2)', padding: '4px 9px', borderRadius: '999px' }}>{fmtDate(m.match_date)}</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '.5px', color: tagColor }}>{tag}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '90px' }}>
                    <TeamAvatar name={m.home_team} code={m.home_team_code} flag={m.home_team_flag} size={44} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{m.home_team}</span>
                  </div>
                  <span className="font-display" style={{ fontSize: '34px', color: 'var(--ink)' }}>{m.home_score} - {m.away_score}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '90px' }}>
                    <TeamAvatar name={m.away_team} code={m.away_team_code} flag={m.away_team_flag} size={44} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{m.away_team}</span>
                  </div>
                </div>
                {pred && (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', borderRadius: '12px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Tu pronóstico: <b style={{ color: 'var(--ink)', fontWeight: 800 }}>{pred.home_score_pred} - {pred.away_score_pred}</b></span>
                    <span className="font-display" style={{ fontSize: '16px', color: tagColor }}>{(pred.points_earned > 0 ? '+' : '') + pred.points_earned} pts</span>
                  </div>
                )}
              </div>
            )
          })
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '104px', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--bg)', padding: '12px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,.35)', zIndex: 200, whiteSpace: 'nowrap', animation: 'toastin .25s ease' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
