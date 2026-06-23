// DEV ONLY: Seeds mock match data into the database
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMockMatches } from '@/lib/football-api'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const matches = getMockMatches()
  const { error } = await supabase.from('matches').upsert(matches, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, count: matches.length })
}
