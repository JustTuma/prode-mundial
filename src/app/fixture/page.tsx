import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import FixtureView from '@/components/fixture/FixtureView'
import type { Match } from '@/lib/types'

export const revalidate = 0

export default async function FixturePage() {
  const supabase = await createClient()
  const { data: matches } = await supabase.from('matches').select('*').order('match_date')
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>}>
      <FixtureView matches={(matches || []) as Match[]} />
    </Suspense>
  )
}
