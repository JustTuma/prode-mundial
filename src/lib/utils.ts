import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function getMatchResult(home: number, away: number): 'home' | 'draw' | 'away' {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

export function calculatePoints(
  predHome: number, predAway: number,
  actualHome: number, actualAway: number
): { points: number; isExact: boolean; isCorrectResult: boolean } {
  if (predHome === actualHome && predAway === actualAway) {
    return { points: 3, isExact: true, isCorrectResult: true }
  }
  const predResult = getMatchResult(predHome, predAway)
  const actualResult = getMatchResult(actualHome, actualAway)
  if (predResult === actualResult) {
    return { points: 1, isExact: false, isCorrectResult: true }
  }
  return { points: 0, isExact: false, isCorrectResult: false }
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    GROUP_STAGE: 'Fase de Grupos',
    LAST_32: 'Ronda de 32',
    ROUND_OF_16: 'Octavos de Final',
    LAST_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: 'Tercer Puesto',
    FINAL: 'Final',
  }
  return labels[stage] || stage
}

/** Etiqueta linda para grupo o etapa (ej: "GROUP_B" -> "Grupo B") */
export function matchLabel(groupName: string | null, stage: string): string {
  if (groupName) {
    const m = groupName.match(/group[_\s-]*([a-l])/i)
    if (m) return `Grupo ${m[1].toUpperCase()}`
    return groupName
  }
  return getStageLabel(stage)
}

export function getCountryFlag(code: string): string {
  if (!code) return '🏳️'
  const codePoints = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
