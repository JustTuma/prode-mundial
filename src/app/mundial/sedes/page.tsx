import Link from 'next/link'

export const revalidate = 86400

const SEDES = [
  { city: 'Nueva York / Nueva Jersey', country: '🇺🇸', stadium: 'MetLife Stadium', cap: '82.500', note: 'Sede de la FINAL' },
  { city: 'Los Ángeles', country: '🇺🇸', stadium: 'SoFi Stadium', cap: '70.000', note: '' },
  { city: 'Dallas', country: '🇺🇸', stadium: 'AT&T Stadium', cap: '80.000', note: '' },
  { city: 'Atlanta', country: '🇺🇸', stadium: 'Mercedes-Benz Stadium', cap: '71.000', note: '' },
  { city: 'Miami', country: '🇺🇸', stadium: 'Hard Rock Stadium', cap: '65.000', note: '' },
  { city: 'Houston', country: '🇺🇸', stadium: 'NRG Stadium', cap: '72.000', note: '' },
  { city: 'Kansas City', country: '🇺🇸', stadium: 'Arrowhead Stadium', cap: '76.000', note: '' },
  { city: 'Filadelfia', country: '🇺🇸', stadium: 'Lincoln Financial Field', cap: '69.000', note: '' },
  { city: 'San Francisco', country: '🇺🇸', stadium: 'Levi\'s Stadium', cap: '68.500', note: '' },
  { city: 'Seattle', country: '🇺🇸', stadium: 'Lumen Field', cap: '69.000', note: '' },
  { city: 'Boston', country: '🇺🇸', stadium: 'Gillette Stadium', cap: '65.000', note: '' },
  { city: 'Ciudad de México', country: '🇲🇽', stadium: 'Estadio Azteca', cap: '87.000', note: 'Partido inaugural' },
  { city: 'Guadalajara', country: '🇲🇽', stadium: 'Estadio Akron', cap: '49.000', note: '' },
  { city: 'Monterrey', country: '🇲🇽', stadium: 'Estadio BBVA', cap: '53.000', note: '' },
  { city: 'Toronto', country: '🇨🇦', stadium: 'BMO Field', cap: '45.000', note: '' },
  { city: 'Vancouver', country: '🇨🇦', stadium: 'BC Place', cap: '54.000', note: '' },
]

export default function SedesPage() {
  return (
    <div className="risein">
      <Link href="/mundial" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>← Mundial</Link>
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '8px 0 4px' }}>🏟️ Sedes</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '16px' }}>16 estadios en 3 países · USA 🇺🇸 · Canadá 🇨🇦 · México 🇲🇽</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SEDES.map(s => (
          <div key={s.stadium} className="card" style={{ padding: '14px 16px', borderColor: s.note ? 'var(--accent2)' : 'var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontSize: '24px' }}>{s.country}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.stadium}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{s.city}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="font-display" style={{ fontSize: '15px', color: 'var(--ink)' }}>{s.cap}</div>
                <div style={{ color: 'var(--muted)', fontSize: '10px' }}>capacidad</div>
              </div>
            </div>
            {s.note && <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 800, color: 'var(--accent2)' }}>⭐ {s.note}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
