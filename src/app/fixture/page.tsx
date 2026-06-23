import { createClient } from '@/lib/supabase/server'
import FixtureView from '@/components/fixture/FixtureView'
import type { Match } from '@/lib/types'

export const revalidate = 60

export default async function FixturePage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date')

  return <FixtureView matches={(matches || []) as Match[]} />
}
