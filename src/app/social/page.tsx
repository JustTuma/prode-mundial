import { createClient } from '@/lib/supabase/server'
import SocialView from '@/components/social/SocialView'

export const revalidate = 0

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [feedRes, wallRes] = await Promise.all([
    // Feed: predicciones recientes de partidos ya finalizados
    supabase.from('predictions')
      .select('*, profiles(id, username, avatar_url), matches(home_team, away_team, home_score, away_score, status, home_team_flag, away_team_flag)')
      .eq('matches.status', 'FINISHED')
      .not('matches', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(30),
    // Muro
    supabase.from('wall_posts')
      .select('*, profiles(id, username, avatar_url), wall_reactions(emoji, user_id)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <SocialView
      feedItems={feedRes.data || []}
      wallPosts={wallRes.data || []}
      userId={user?.id}
    />
  )
}
