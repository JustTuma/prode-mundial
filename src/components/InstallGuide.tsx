'use client'
import { useState, useEffect } from 'react'

function InstallSteps({ onClose }: { onClose?: () => void }) {
  return (
    <div>
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
        Instalá el Prode como app en tu celu para una experiencia nativa 📱
      </p>

      {/* iPhone */}
      <div style={{ background: 'var(--line)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🍎</span>
          <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>iPhone / iPad</span>
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>(Safari)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { n: 1, icon: '🌐', text: 'Abrí Safari y entrá a prode-mundialito2026.vercel.app' },
            { n: 2, icon: '⬆️', text: 'Tocá el botón de compartir (cuadrado con flecha arriba)' },
            { n: 3, icon: '➕', text: 'Deslizá y tocá "Agregar a pantalla de inicio"' },
            { n: 4, icon: '✅', text: 'Tocá "Agregar" — ¡listo! Aparece el ícono en tu pantalla' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{
                background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '11px',
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.n}</span>
              <span style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>
                <span style={{ marginRight: '4px' }}>{s.icon}</span>{s.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Android */}
      <div style={{ background: 'var(--line)', borderRadius: '12px', padding: '16px', marginBottom: onClose ? '20px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>Android</span>
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>(Chrome)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { n: 1, icon: '🌐', text: 'Abrí Chrome y entrá a prode-mundialito2026.vercel.app' },
            { n: 2, icon: '⋮', text: 'Tocá los tres puntos (menú) arriba a la derecha' },
            { n: 3, icon: '➕', text: 'Tocá "Agregar a pantalla de inicio" o "Instalar app"' },
            { n: 4, icon: '✅', text: 'Tocá "Instalar" — ¡listo! Aparece el ícono en tu pantalla' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{
                background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '11px',
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.n}</span>
              <span style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>
                <span style={{ marginRight: '4px' }}>{s.icon}</span>{s.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {onClose && (
        <button onClick={onClose} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, var(--accent), #0050c8)',
          color: '#fff', fontWeight: 700, fontSize: '15px',
          border: 'none', borderRadius: '12px', cursor: 'pointer',
        }}>
          ¡Entendido, vamos a predecir! ⚽
        </button>
      )}
    </div>
  )
}

// Modal de bienvenida (primera vez)
export function InstallModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('install_guide_seen')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (!seen && !isStandalone) {
      setTimeout(() => setShow(true), 1500)
    }
  }, [])

  function close() {
    localStorage.setItem('install_guide_seen', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0',
    }}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div style={{
        background: 'var(--surface)', borderTop: '1px solid var(--line)',
        borderRadius: '20px 20px 0 0', padding: '24px 20px',
        width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: 'var(--line)', borderRadius: '2px', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src="/icon-192.png" style={{ width: '48px', height: '48px', borderRadius: '12px' }} alt="" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--ink)' }}>
              ¡Instalá el Prode! 🏆
            </h2>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '12px' }}>
              Funciona como una app nativa
            </p>
          </div>
        </div>

        <InstallSteps onClose={close} />
      </div>
    </div>
  )
}

// Sección estática para el perfil
export function InstallGuideSection() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '16px 18px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>📲</span>
          <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '14px' }}>Instalar como app</span>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '18px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <InstallSteps />
        </div>
      )}
    </div>
  )
}
