import { createClient } from '@/lib/supabase/server'
import SimuladorView from '@/components/mundial/SimuladorView'
import type { Match } from '@/lib/types'

export const revalidate = 0

export default async function SimuladorPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('matches').select('*').eq('stage', 'GROUP_STAGE').order('match_date')
  return <SimuladorView matches={(data || []) as Match[]} />
}
