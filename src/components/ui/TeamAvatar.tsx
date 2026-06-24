import { teamColor, teamCode } from '@/lib/teams'

interface Props {
  name?: string | null
  code?: string | null
  flag?: string | null
  size?: number
}

/** Avatar de equipo estilo handoff: círculo de color con sigla en Anton.
 *  Si hay bandera real de la API, la muestra dentro del círculo. */
export default function TeamAvatar({ name, code, flag, size = 46 }: Props) {
  const col = teamColor(code || name)
  const c = teamCode(name, code)

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: col, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: size * 0.32,
        boxShadow: '0 6px 14px rgba(0,0,0,.18)', overflow: 'hidden',
      }}
    >
      {flag ? (
        <img src={flag} alt={c} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        c
      )}
    </div>
  )
}
