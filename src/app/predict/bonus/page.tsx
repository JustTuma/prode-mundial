import { createClient } from '@/lib/supabase/server'
import BonusForm from '@/components/predictions/BonusForm'

const TEAMS = [
  'Argentina','Brasil','Francia','España','Alemania','Inglaterra','Portugal','Uruguay',
  'México','Colombia','Países Bajos','Italia','Bélgica','Croacia','Marruecos','Senegal',
  'Estados Unidos','Japón','Australia','Corea del Sur','Ecuador','Qatar','Ghana','Túnez',
]

export const revalidate = 0

export default async function BonusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: bonus } = await supabase.from('bonus_predictions').select('*').eq('user_id', user.id).single()

  return (
    <div className="risein" style={{ paddingBottom: '40px' }}>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 4px' }}>Bonus 🌟</h1>
      <p style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Pronósticos especiales con puntos extra al final del Mundial</p>

      <div className="card" style={{ padding: '16px', marginBottom: '20px', borderColor: 'var(--accent2)' }}>
        <h3 className="font-display" style={{ color: 'var(--accent2)', margin: '0 0 12px', fontSize: '15px' }}>Puntos bonus</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { emoji: '🏆', label: 'Campeón del Mundial', pts: 10 },
            { emoji: '🥈', label: 'Subcampeón', pts: 5 },
            { emoji: '🥉', label: 'Tercer puesto', pts: 3 },
            { emoji: '⚽', label: 'Goleador del torneo', pts: 5 },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{b.emoji} {b.label}</span>
              <span style={{ fontWeight: 800, color: 'var(--accent2)', background: 'var(--surface2)', padding: '3px 10px', borderRadius: '999px', fontSize: '13px' }}>+{b.pts}</span>
            </div>
          ))}
        </div>
      </div>
      <BonusForm teams={TEAMS} existingBonus={bonus} />
    </div>
  )
}
