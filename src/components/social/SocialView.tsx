'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { personColor } from '@/lib/teams'
import TeamAvatar from '@/components/ui/TeamAvatar'

type Tab = 'muro' | 'feed'

function Avatar({ name, url, size = 42 }: { name?: string; url?: string | null; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: personColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Anton', fontSize: size * 0.38, overflow: 'hidden' }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.[0]?.toUpperCase()}
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

const HEART = (filled: boolean) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.3 5c2 0 3.4 1.2 4.2 2.4l.5.8.5-.8C11.3 6.2 12.7 5 14.7 5 18 5 19.5 8.5 18 11.7 15.5 16.4 12 21 12 21Z" /></svg>
)

function WallPost({ post, userId }: { post: any; userId?: string }) {
  const initialReacts = post.wall_reactions || []
  const [liked, setLiked] = useState(initialReacts.some((r: any) => r.user_id === userId))
  const [count, setCount] = useState(initialReacts.length)
  const supabase = createClient()
  const p = post.profiles

  async function toggle() {
    if (!userId) return
    if (liked) {
      setLiked(false); setCount((c: number) => Math.max(0, c - 1))
      await supabase.from('wall_reactions').delete().eq('post_id', post.id).eq('user_id', userId).eq('emoji', '❤️')
    } else {
      setLiked(true); setCount((c: number) => c + 1)
      await supabase.from('wall_reactions').upsert({ post_id: post.id, user_id: userId, emoji: '❤️' })
    }
  }

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
      <Link href={`/profile/${p?.username}`}><Avatar name={p?.username} url={p?.avatar_url} /></Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45 }}>
          <Link href={`/profile/${p?.username}`} style={{ textDecoration: 'none', color: 'var(--ink)', fontWeight: 800 }}>{p?.username}</Link> {post.content}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
          <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: liked ? 'var(--accent2)' : 'var(--muted)', fontSize: '12px', fontWeight: 800, fontFamily: 'Archivo' }}>
            {HEART(liked)} {count > 0 ? count : ''}
          </button>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function SocialView({ feedItems, wallPosts: initialPosts, userId }: { feedItems: any[]; wallPosts: any[]; userId?: string }) {
  const [tab, setTab] = useState<Tab>('muro')
  const [posts, setPosts] = useState(initialPosts)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setPosting(true)
    const { data, error } = await supabase.from('wall_posts')
      .insert({ user_id: userId, content: text.trim() })
      .select('*, profiles!wall_posts_user_id_fkey(id, username, avatar_url), wall_reactions(emoji, user_id)')
      .single()
    if (error) { alert('Error: ' + error.message); setPosting(false); return }
    if (data) { setPosts(prev => [data, ...prev]); setText('') }
    setPosting(false)
    router.refresh()
  }

  const seg = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, border: 'none', borderRadius: '999px', padding: '10px', fontWeight: 800, fontSize: '13px',
      cursor: 'pointer', fontFamily: 'Archivo',
      background: tab === t ? 'var(--accent)' : 'transparent',
      color: tab === t ? 'var(--accent-ink)' : 'var(--muted)',
    }}>{label}</button>
  )

  return (
    <div className="risein">
      <h1 className="font-display" style={{ fontSize: '30px', color: 'var(--ink)', margin: '6px 0 10px' }}>Social</h1>
      <div style={{ display: 'flex', gap: '6px', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: '999px', padding: '4px', marginBottom: '14px' }}>
        {seg('muro', 'Muro')}
        {seg('feed', 'Resultados')}
      </div>

      {tab === 'muro' && (
        <>
          {userId && (
            <form onSubmit={handlePost} style={{ marginBottom: '14px' }}>
              <div className="card" style={{ padding: '14px' }}>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Tirá tu análisis, burlas o pronósticos… 🔥" maxLength={280} rows={2}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', fontSize: '14px', resize: 'none', fontFamily: 'Archivo', lineHeight: 1.5 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{text.length}/280</span>
                  <button type="submit" disabled={posting || !text.trim()} style={{ background: text.trim() ? 'var(--accent)' : 'var(--surface2)', color: text.trim() ? 'var(--accent-ink)' : 'var(--muted)', fontWeight: 800, padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Archivo' }}>
                    {posting ? '…' : 'Publicar'}
                  </button>
                </div>
              </div>
            </form>
          )}
          {posts.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Sé el primero en escribir 🗣️</div>
          ) : (
            <div className="card" style={{ padding: '2px 16px' }}>
              {posts.map(post => <WallPost key={post.id} post={post} userId={userId} />)}
            </div>
          )}
        </>
      )}

      {tab === 'feed' && (
        feedItems.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Todavía no hay resultados</div>
        ) : (
          feedItems.map(item => {
            const m = item.matches, prof = item.profiles
            if (!m || !prof) return null
            const exacto = item.is_exact, correct = item.is_correct_result
            const col = exacto ? 'var(--pos)' : correct ? 'var(--accent)' : 'var(--muted)'
            const label = exacto ? '🎯 Exacto' : correct ? '✅ Resultado' : '❌ Sin puntos'
            return (
              <div key={item.id} className="card" style={{ padding: '14px 16px', marginBottom: '10px', borderLeft: `3px solid ${col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Link href={`/profile/${prof.username}`}><Avatar name={prof.username} url={prof.avatar_url} size={36} /></Link>
                  <div style={{ flex: 1 }}>
                    <Link href={`/profile/${prof.username}`} style={{ textDecoration: 'none', color: 'var(--ink)', fontWeight: 800, fontSize: '14px' }}>{prof.username}</Link>
                    <div style={{ color: 'var(--muted)', fontSize: '11px' }}>{timeAgo(item.updated_at || item.created_at)}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'var(--surface2)', color: col }}>{label}</span>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <TeamAvatar name={m.home_team} code={m.home_team_code} flag={m.home_team_flag} size={26} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>{m.home_score}-{m.away_score}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: col }}>pred {item.home_score_pred}-{item.away_score_pred}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', minWidth: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away_team}</span>
                    <TeamAvatar name={m.away_team} code={m.away_team_code} flag={m.away_team_flag} size={26} />
                  </div>
                </div>
              </div>
            )
          })
        )
      )}
    </div>
  )
}
