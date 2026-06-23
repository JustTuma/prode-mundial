'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        email,
        password,
        options: {
          data: { username, full_name: username },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      })
      if (error) { console.error("Signup error:", error, Object.getOwnPropertyNames(error).map(k => [k, (error as any)[k]])); setError(error.message || error.name || error.toString() || "Error desconocido"); setLoading(false); return }
      setMessage(`¡Cuenta creada! Te enviamos un email de confirmación a ${email}. Revisá tu bandeja de entrada.`)
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : error.message === 'Email not confirmed'
          ? 'Confirmá tu email antes de ingresar. Revisá tu bandeja de entrada.'
          : error.message)
        setLoading(false)
        return
      }
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
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
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
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Nombre de usuario
                </label>
                <input
                  className="input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ej: pepito_golazo"
                  required
                  minLength={3}
                />
              </div>
            )}

            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: '18px', padding: '0', lineHeight: 1,
                  }}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {mode === 'signup' && password.length > 0 && password.length < 6 && (
                <p style={{ color: '#ef4444', fontSize: '11px', margin: '4px 0 0' }}>
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', color: '#ef4444', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}
            {message && (
              <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '8px', padding: '16px', color: '#10b981', fontSize: '14px', lineHeight: 1.5 }}>
                ✅ {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-gold"
              style={{ marginTop: '8px', fontSize: '16px', padding: '12px' }}
              disabled={loading}
            >
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
