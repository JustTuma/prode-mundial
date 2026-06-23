import { createClient } from '@/lib/supabase/server'
import BonusForm from '@/components/predictions/BonusForm'

const TEAMS = [
  'Argentina','Brasil','Francia','España','Alemania','Inglaterra','Portugal','Uruguay',
  'México','Colombia','Países Bajos','Italia','Bélgica','Croacia','Marruecos','Senegal',
  'Estados Unidos','Japón','Australia','Corea del Sur','Ecuador','Qatar','Ghana','Túnez',
]

export default async function BonusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: bonus } = await supabase.from('bonus_predictions').select('*').eq('user_id', user.id).single()

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px' }}>🌟 Predicciones Bonus</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Predicciones especiales con puntos extra</p>
      </div>
      <div style={{ background: '#12121a', border: '1px solid #f59e0b44', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ color: '#f59e0b', margin: '0 0 12px', fontSize: '14px' }}>Sistema de puntos bonus</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { emoji: '🏆', label: 'Campeón del Mundial', pts: 10 },
            { emoji: '🥈', label: 'Subcampeón', pts: 5 },
            { emoji: '🥉', label: 'Tercer puesto', pts: 3 },
            { emoji: '⚽', label: 'Goleador del torneo', pts: 5 },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>{b.emoji} {b.label}</span>
              <span style={{ fontWeight: 700, color: '#f59e0b', background: '#f59e0b22', padding: '2px 10px', borderRadius: '99px', fontSize: '14px' }}>+{b.pts} pts</span>
            </div>
          ))}
        </div>
      </div>
      <BonusForm teams={TEAMS} existingBonus={bonus} />
    </div>
  )
}
