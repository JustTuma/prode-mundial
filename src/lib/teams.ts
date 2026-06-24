// Colores de equipos del handoff de diseño + fallback determinístico

const TEAM_COLORS: Record<string, string> = {
  ARG: '#4F9BD8', BRA: '#E0A800', FRA: '#2C5BB0', ESP: '#C8102E',
  ALE: '#2B2B33', GER: '#2B2B33', ENG: '#D6303B', NED: '#F36C21',
  POR: '#A01124', URU: '#5BB0E0', MEX: '#1B7A3E', NGA: '#1E9E55',
  CRO: '#C8102E', KSA: '#1E7A4D', USA: '#2C5BB0', JPN: '#C8102E',
  SEN: '#1E9E55', COL: '#E0A800', KOR: '#2C5BB0', GHA: '#1E9E55',
  SUI: '#D6303B', ECU: '#E0A800', ITA: '#2C5BB0', BEL: '#D6303B',
  MAR: '#1E7A4D', QAT: '#A01124', CAN: '#D6303B', AUS: '#E0A800',
}

const PALETTE = ['#E0457B', '#F6850F', '#2E8BE6', '#7A4DE0', '#1E9E6A', '#0FB5B5', '#9A4DE0', '#E07A2E']

export function teamColor(code: string | null | undefined): string {
  if (!code) return '#7E89A3'
  const up = code.toUpperCase().slice(0, 3)
  if (TEAM_COLORS[up]) return TEAM_COLORS[up]
  let h = 0
  for (let i = 0; i < up.length; i++) h = up.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

// Color determinístico para usuarios (avatares de personas)
export function personColor(name: string | null | undefined): string {
  if (!name) return '#7E89A3'
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export function teamCode(name: string | null | undefined, fallbackCode?: string | null): string {
  if (fallbackCode && fallbackCode !== 'TBD') return fallbackCode.toUpperCase().slice(0, 3)
  if (!name || name === 'Por definir') return '?'
  return name.toUpperCase().slice(0, 3)
}
