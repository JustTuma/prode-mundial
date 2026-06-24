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
      background: 'radial-gradient(130% 90% at 50% -15%,#1b2a52 0%,#0c1228 45%,#080b14 100%)',
      padding: '24px', fontFamily: 'Archivo, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>🏆</div>
          <div className="font-display" style={{ fontSize: '34px', letterSpacing: '1px', color: '#F3F7FF' }}>
            PRODE<span style={{ color: '#5FB1FF' }}>26</span>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#FFD23F', marginLeft: '5px', verticalAlign: 'top' }} />
          </div>
          <p style={{ color: '#7E89A3', marginTop: '6px', fontSize: '14px' }}>El prode del Mundial 2026</p>
        </div>

        <div style={{ background: '#161E2E', border: '1px solid #23304A', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#0B1220', borderRadius: '999px', padding: '4px', marginBottom: '22px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
                flex: 1, padding: '10px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: mode === m ? '#5FB1FF' : 'transparent',
                color: mode === m ? '#04121F' : '#7E89A3',
                fontWeight: 800, fontSize: '13px', fontFamily: 'Archivo',
              }}>
                {m === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ color: '#7E89A3', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nombre de usuario</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="ej: pepito_golazo" required minLength={3}
                  style={{ width: '100%', background: '#0B1220', border: '1px solid #23304A', borderRadius: '12px', padding: '12px 14px', color: '#F3F7FF', outline: 'none', fontSize: '14px', fontFamily: 'Archivo' }} />
              </div>
            )}
            <div>
              <label style={{ color: '#7E89A3', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required
                style={{ width: '100%', background: '#0B1220', border: '1px solid #23304A', borderRadius: '12px', padding: '12px 14px', color: '#F3F7FF', outline: 'none', fontSize: '14px', fontFamily: 'Archivo' }} />
            </div>
            <div>
              <label style={{ color: '#7E89A3', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  style={{ width: '100%', background: '#0B1220', border: '1px solid #23304A', borderRadius: '12px', padding: '12px 44px 12px 14px', color: '#F3F7FF', outline: 'none', fontSize: '14px', fontFamily: 'Archivo' }} />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div style={{ background: 'rgba(224,69,123,.15)', border: '1px solid #E0457B', borderRadius: '10px', padding: '12px', color: '#E0457B', fontSize: '14px' }}>⚠️ {error}</div>}
            {message && <div style={{ background: 'rgba(30,158,106,.15)', border: '1px solid #1E9E6A', borderRadius: '10px', padding: '14px', color: '#1E9E6A', fontSize: '14px', lineHeight: 1.5 }}>✅ {message}</div>}

            <button type="submit" disabled={loading} style={{ marginTop: '6px', background: '#FFD23F', color: '#04121F', fontWeight: 800, fontSize: '16px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'Archivo' }}>
              {loading ? '⏳ Cargando...' : mode === 'login' ? '🚀 Entrar' : '🎉 Crear cuenta'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '16px' }}>¡No hacer trampa! 😄</p>
      </div>
    </div>
  )
}
