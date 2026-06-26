import Link from 'next/link'

export const revalidate = 86400

export default function ReglasPage() {
  return (
    <div className="risein" style={{ paddingBottom: '40px' }}>
      <Link href="/mundial" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>← Mundial</Link>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '8px 0 4px' }}>📖 Cómo se juega</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '20px' }}>Todo lo que necesitás saber, aunque no sepas nada de fútbol 😄</p>

      {/* Qué es */}
      <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '8px' }}>⚽ ¿Qué es el prode?</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Un juego entre amigos: antes de cada partido del Mundial, vos predecís el resultado (cuántos goles hace cada equipo).
          Según qué tan cerca le pegues, sumás puntos. El que más puntos junta al final, gana.
        </p>
      </div>

      {/* Sistema de puntos */}
      <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '12px' }}>🎯 Cómo se suman los puntos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { pts: '3', color: 'var(--accent2)', t: 'Resultado exacto', d: 'Acertaste el marcador justo. Ej: pusiste 2-1 y salió 2-1.' },
            { pts: '1', color: 'var(--accent)', t: 'Acertaste el ganador', d: 'Le erraste al marcador pero acertaste quién ganó (o el empate). Ej: pusiste 2-1 y salió 3-0 — igual ganó el mismo equipo.' },
            { pts: '0', color: 'var(--muted)', t: 'Sin puntos', d: 'No acertaste ni el ganador. Ej: pusiste que ganaba uno y ganó el otro.' },
          ].map(r => (
            <div key={r.pts} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span className="font-display" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface2)', color: r.color, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.pts}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{r.t}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reglas clave */}
      <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '12px' }}>📌 Reglas importantes</h2>
        <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            ['⏰', 'Cargá antes de que empiece', 'Podés predecir y cambiar tu pronóstico hasta que el partido arranca. Una vez que empieza, se bloquea: nadie puede tocar nada (así nadie hace trampa viendo el resultado).'],
            ['🔄', 'Podés editar', 'Mientras el partido no haya empezado, podés cambiar tu pronóstico las veces que quieras.'],
            ['🤖', 'Los puntos se cargan solos', 'Cuando termina un partido, el sistema reparte los puntos automáticamente. No tenés que hacer nada.'],
          ].map(([e, t, d]) => (
            <li key={t} style={{ display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{e}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{t}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bonus */}
      <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '8px' }}>🌟 Pronósticos bonus</h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '10px' }}>
          Aparte de los partidos, podés predecir cosas grandes del torneo y sumar puntos extra al final:
        </p>
        {[['🏆', 'Campeón del Mundial', '+10'], ['🥈', 'Subcampeón', '+5'], ['🥉', 'Tercer puesto', '+3'], ['⚽', 'Goleador del torneo', '+5']].map(([e, t, p]) => (
          <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{e} {t}</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent2)', background: 'var(--surface2)', padding: '2px 10px', borderRadius: '999px' }}>{p} pts</span>
          </div>
        ))}
      </div>

      {/* Premios */}
      <div className="card" style={{ padding: '18px', marginBottom: '14px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '8px' }}>🍔 Premios</h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Cada semana, el que más puntos sume gana una hamburguesa 🍔. Y al final del Mundial, el campeón general se lleva la gloria
          (y la satisfacción de saber más de fútbol que todos 😏).
        </p>
      </div>

      {/* Conceptos del Mundial */}
      <div className="card" style={{ padding: '18px' }}>
        <h2 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '12px' }}>🌎 El Mundial en 1 minuto</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            ['Fase de grupos', 'Los equipos se dividen en grupos. Cada uno juega 3 partidos. Los 2 mejores de cada grupo pasan a la siguiente ronda; el resto queda eliminado.'],
            ['Eliminatorias', 'A partir de ahí es mata-mata: el que pierde, se va a su casa. Octavos → Cuartos → Semifinal → Final.'],
            ['Puntos en la tabla', 'En los grupos, ganar da 3 puntos, empatar 1, perder 0. Por eso en la app ves columnas como PTS (puntos) y DG (diferencia de gol).'],
            ['Argentina', 'La actual campeona del mundo 🇦🇷. Tenés una sección dedicada para seguirla en el hub Mundial.'],
          ].map(([t, d]) => (
            <div key={t}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>{t}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
