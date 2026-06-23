'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, full_name: username } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('¡Cuenta creada! Revisá tu email para confirmar.')
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1b2a 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <h1 style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Prode Mundial</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>FIFA 2026</p>
        </div>

        <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '32px' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === m ? '#1e1e2e' : 'transparent',
                color: mode === m ? '#f0f0f5' : '#6b7280',
                fontWeight: mode === m ? 600 : 400,
                fontSize: '14px', transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nombre de usuario</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="ej: pepito_golazo" required minLength={3} />
              </div>
            )}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} />
            </div>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', color: '#ef4444', fontSize: '14px' }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', color: '#10b981', fontSize: '14px' }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn-gold" style={{ marginTop: '8px', fontSize: '16px', padding: '12px' }} disabled={loading}>
              {loading ? '⏳ Cargando...' : mode === 'login' ? '🚀 Entrar' : '🎉 Crear cuenta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '16px' }}>
          Al registrarte aceptás las reglas del prode. ¡No hacer trampa! 😄
        </p>
      </div>
    </div>
  )
}
