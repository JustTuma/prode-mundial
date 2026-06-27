import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FloatingBalls } from '@/components/ui/Decorations'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(130% 90% at 50% -15%,#1b2a52 0%,#0c1228 45%,#080b14 100%)',
      fontFamily: 'Archivo, sans-serif', color: '#F3F7FF',
    }}>
      <FloatingBalls count={8} />
      <div style={{ maxWidth: '440px', width: '100%', position: 'relative' }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>🏆</div>
        <div className="font-display" style={{ fontSize: '44px', letterSpacing: '1px', lineHeight: 1 }}>
          PRODE<span className="shimmer-gold">26</span>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#FFD23F', marginLeft: '6px', verticalAlign: 'top' }} />
        </div>
        <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '12px 0 4px' }}>El prode del Mundial 2026 🇦🇷</p>
        <p style={{ color: '#7E89A3', fontSize: '1rem', margin: '0 0 28px', lineHeight: 1.6 }}>
          Cargá tus pronósticos, competí con tus amigos<br />y trepá al ranking.
        </p>

        <div style={{ background: 'linear-gradient(135deg,#1a1200,#2a1f00)', border: '1px solid rgba(246,180,0,.3)', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>🍔</div>
          <div style={{ color: '#FFD23F', fontWeight: 800, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>El premio</div>
          <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem', margin: 0 }}>La satisfacción de saber más de fútbol que todos 😏</p>
          <p style={{ color: '#7E89A3', fontSize: '13px', margin: '6px 0 0' }}>+ una hamburguesa para el campeón semanal 🏆</p>
        </div>

        <div style={{ background: '#161E2E', border: '1px solid #23304A', borderRadius: '16px', padding: '18px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ color: '#5FB1FF', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Cómo se juega</div>
          {[
            { n: '3', t: 'Marcador exacto', d: 'Predijiste 2-1 y salió 2-1' },
            { n: '1', t: 'Acertar el ganador', d: 'Victoria, empate o derrota' },
            { n: '0', t: 'Sin puntos', d: 'No acertaste' },
          ].map(p => (
            <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="font-display" style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(95,177,255,.15)', color: '#5FB1FF', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.n}</span>
              <div>
                <div style={{ color: '#F3F7FF', fontWeight: 600, fontSize: '14px' }}>{p.t}</div>
                <div style={{ color: '#7E89A3', fontSize: '12px' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/auth" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: '#5FB1FF', color: '#04121F', fontWeight: 800, fontSize: '16px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer' }}>
            🚀 Empezar a jugar
          </button>
        </Link>
        <p style={{ color: '#374151', fontSize: '12px', marginTop: '20px' }}>Programado con ❤️ por Matias Tuma</p>
      </div>
    </main>
  )
}
