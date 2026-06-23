import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1b2a 50%, #0a0a0f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <div style={{ position: 'relative', maxWidth: '560px', width: '100%' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🏆</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 8px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Prode Mundial
        </h1>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>FIFA 2026 🇺🇸🇨🇦🇲🇽</p>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: '0 0 40px', lineHeight: 1.6 }}>
          Predecí los resultados, competí con tus amigos,<br/>ganá puntos y trepá al ranking global.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { emoji: '⚽', title: 'Todos los partidos', desc: 'Grupos y eliminatorias' },
            { emoji: '🏅', title: 'Ranking en tiempo real', desc: 'Global y por liga' },
            { emoji: '👥', title: 'Ligas privadas', desc: 'Jugá con tus amigos' },
            { emoji: '🎯', title: 'Predicciones bonus', desc: 'Campeón, goleador y más' },
            { emoji: '💬', title: 'Chat del partido', desc: 'Comentarios y reacciones' },
            { emoji: '🏆', title: 'Logros y badges', desc: 'Desbloqueá tus premios' },
          ].map(f => (
            <div key={f.title} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{f.emoji}</div>
              <div style={{ fontWeight: 600, color: '#f0f0f5', fontSize: '14px' }}>{f.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
          <h3 style={{ color: '#f59e0b', fontWeight: 700, margin: '0 0 12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sistema de Puntos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { pts: '3', label: 'Resultado exacto', example: 'Predijiste 2-1 y salió 2-1', color: '#f59e0b' },
              { pts: '1', label: 'Resultado correcto', example: 'Predijiste victoria/empate/derrota', color: '#10b981' },
              { pts: '0', label: 'Sin puntos', example: 'Resultado incorrecto', color: '#6b7280' },
            ].map(p => (
              <div key={p.pts} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: p.color + '22', color: p.color, fontWeight: 800, fontSize: '18px', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.pts}</span>
                <div>
                  <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '14px' }}>{p.label}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>{p.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{ textDecoration: 'none' }}>
            <button className="btn-gold" style={{ fontSize: '16px', padding: '14px 32px' }}>🚀 Empezar a jugar</button>
          </Link>
          <Link href="/ranking" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>📊 Ver ranking</button>
          </Link>
        </div>
        <p style={{ color: '#374151', fontSize: '12px', marginTop: '24px' }}>Gratis · Sin publicidad · Hecho por fans del fútbol 🇦🇷</p>
        <p style={{ color: '#374151', fontSize: '11px', marginTop: '6px' }}>
          Programado con ❤️ por <span style={{ color: '#6b7280', fontWeight: 600 }}>Matias Tuma</span>
        </p>
      </div>
    </main>
  )
}
