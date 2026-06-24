'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'feed' | 'muro'

const REACTIONS = ['🔥','👏','😱','😂','💪','🎯','😤','❤️']

function Avatar({ profile, size = 36 }: { profile: any; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #003087, #0050c8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', border: '2px solid #2a2a3e',
    }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>{profile?.username?.[0]?.toUpperCase()}</span>
      }
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

function FeedCard({ item }: { item: any }) {
  const match = item.matches
  const profile = item.profiles
  if (!match || !profile) return null

  const isExact = item.is_exact
  const isCorrect = item.is_correct_result
  const resultColor = isExact ? '#f59e0b' : isCorrect ? '#10b981' : '#ef4444'
  const resultLabel = isExact ? '🎯 ¡Resultado exacto!' : isCorrect ? '✅ Resultado correcto' : '❌ Falló'
  const resultBg = isExact ? 'rgba(245,158,11,0.08)' : isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.05)'

  return (
    <div style={{
      background: resultBg || '#12121a',
      border: `1px solid ${resultColor}33`,
      borderRadius: '14px', padding: '14px 16px', marginBottom: '10px',
      borderLeft: `3px solid ${resultColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <Link href={`/profile/${profile.username}`} style={{ textDecoration: 'none' }}>
          <Avatar profile={profile} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/profile/${profile.username}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px' }}>{profile.username}</span>
          </Link>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>{timeAgo(item.updated_at || item.created_at)}</div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
          background: `${resultColor}22`, color: resultColor,
        }}>{resultLabel}</span>
      </div>

      {/* Partido */}
      <div style={{
        background: '#0a0a0f', borderRadius: '10px', padding: '12px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {match.home_team_flag && <img src={match.home_team_flag} style={{ width: '22px', height: '16px', objectFit: 'contain' }} alt="" />}
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f0f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.home_team}</span>
        </div>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontWeight: 900, fontSize: '16px', color: '#fff' }}>{match.home_score} - {match.away_score}</div>
          <div style={{ color: '#6b7280', fontSize: '10px' }}>resultado</div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: resultColor, marginTop: '2px' }}>
            pred: {item.home_score_pred}-{item.away_score_pred}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#f0f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{match.away_team}</span>
          {match.away_team_flag && <img src={match.away_team_flag} style={{ width: '22px', height: '16px', objectFit: 'contain' }} alt="" />}
        </div>
      </div>

      {item.points_earned > 0 && (
        <div style={{ textAlign: 'right', marginTop: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '14px' }}>
          +{item.points_earned} pts
        </div>
      )}
    </div>
  )
}

function WallPost({ post, userId, onDelete }: { post: any; userId?: string; onDelete: (id: string) => void }) {
  const [reactions, setReactions] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    ;(post.wall_reactions || []).forEach((r: any) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1 })
    return counts
  })
  const [myReactions, setMyReactions] = useState<Set<string>>(() =>
    new Set((post.wall_reactions || []).filter((r: any) => r.user_id === userId).map((r: any) => r.emoji))
  )
  const supabase = createClient()

  async function toggleReaction(emoji: string) {
    if (!userId) return
    const has = myReactions.has(emoji)
    const newSet = new Set(myReactions)
    const newCounts = { ...reactions }
    if (has) {
      newSet.delete(emoji)
      newCounts[emoji] = Math.max(0, (newCounts[emoji] || 1) - 1)
      await supabase.from('wall_reactions').delete().eq('post_id', post.id).eq('user_id', userId).eq('emoji', emoji)
    } else {
      newSet.add(emoji)
      newCounts[emoji] = (newCounts[emoji] || 0) + 1
      await supabase.from('wall_reactions').upsert({ post_id: post.id, user_id: userId, emoji })
    }
    setMyReactions(newSet)
    setReactions(newCounts)
  }

  async function handleDelete() {
    await supabase.from('wall_posts').delete().eq('id', post.id)
    onDelete(post.id)
  }

  const profile = post.profiles
  const activeReactions = REACTIONS.filter(e => (reactions[e] || 0) > 0 || myReactions.has(e))

  return (
    <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
        <Link href={`/profile/${profile?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Avatar profile={profile} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Link href={`/profile/${profile?.username}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '14px' }}>{profile?.username}</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#374151', fontSize: '11px' }}>{timeAgo(post.created_at)}</span>
              {userId === post.user_id && (
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', padding: '0' }}>🗑</button>
              )}
            </div>
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '14px', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{post.content}</p>
        </div>
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {activeReactions.map(emoji => (
          <button key={emoji} onClick={() => toggleReaction(emoji)} style={{
            background: myReactions.has(emoji) ? '#3b82f622' : '#1e1e2e',
            border: `1px solid ${myReactions.has(emoji) ? '#3b82f6' : '#2a2a3e'}`,
            borderRadius: '99px', padding: '4px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px',
            transition: 'all 0.15s',
          }}>
            {emoji}
            {reactions[emoji] > 0 && <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{reactions[emoji]}</span>}
          </button>
        ))}
        {userId && (
          <div style={{ position: 'relative' }}>
            <ReactionPicker onPick={toggleReaction} />
          </div>
        )}
      </div>
    </div>
  )
}

function ReactionPicker({ onPick }: { onPick: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: '#1e1e2e', border: '1px solid #2a2a3e', borderRadius: '99px',
        padding: '4px 10px', cursor: 'pointer', color: '#6b7280', fontSize: '16px',
      }}>+</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '36px', left: 0, zIndex: 50,
          background: '#1e1e2e', border: '1px solid #2a2a3e', borderRadius: '12px',
          padding: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', width: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {REACTIONS.map(e => (
            <button key={e} onClick={() => { onPick(e); setOpen(false) }} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px',
              padding: '4px', borderRadius: '6px', transition: 'background 0.1s',
            }}
              onMouseEnter={el => (el.currentTarget.style.background = '#2a2a3e')}
              onMouseLeave={el => (el.currentTarget.style.background = 'none')}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SocialView({ feedItems, wallPosts: initialPosts, userId }: {
  feedItems: any[]; wallPosts: any[]; userId?: string
}) {
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
    if (error) {
      console.error('Error posting:', error)
      alert('Error al publicar: ' + error.message)
      setPosting(false)
      return
    }
    if (data) { setPosts(prev => [data, ...prev]); setText('') }
    setPosting(false)
    router.refresh()
  }

  function removePost(id: string) { setPosts(prev => prev.filter(p => p.id !== id)) }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '20px' }}>💬 Social</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#0a0a0f', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
        {([['muro','🗣️ Muro'], ['feed','📊 Feed']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === v ? '#1e1e2e' : 'transparent',
            color: tab === v ? '#f0f0f5' : '#6b7280',
            fontWeight: tab === v ? 700 : 400, fontSize: '14px', transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* MURO */}
      {tab === 'muro' && (
        <div>
          {/* Input */}
          {userId ? (
            <form onSubmit={handlePost} style={{ marginBottom: '20px' }}>
              <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '14px' }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="¿Qué pensás del Mundial? Tirá tu análisis, burlas, predicciones... 🔥"
                  maxLength={280}
                  rows={3}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: '#f0f0f5', fontSize: '14px', resize: 'none', lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ color: text.length > 250 ? '#ef4444' : '#374151', fontSize: '12px' }}>{text.length}/280</span>
                  <button type="submit" disabled={posting || !text.trim()} style={{
                    background: text.trim() ? 'linear-gradient(135deg,#003087,#0050c8)' : '#1e1e2e',
                    color: '#fff', fontWeight: 700, padding: '8px 20px', borderRadius: '8px',
                    border: 'none', cursor: text.trim() ? 'pointer' : 'default', fontSize: '13px',
                  }}>
                    {posting ? '...' : '🗣️ Publicar'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <Link href="/auth" style={{ color: '#75aadb', textDecoration: 'none', fontWeight: 600 }}>Iniciá sesión</Link>
              <span style={{ color: '#6b7280' }}> para publicar en el muro</span>
            </div>
          )}

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗣️</div>
              <p>Sé el primero en escribir algo</p>
            </div>
          ) : (
            posts.map(post => <WallPost key={post.id} post={post} userId={userId} onDelete={removePost} />)
          )}
        </div>
      )}

      {/* FEED */}
      {tab === 'feed' && (
        <div>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
            Predicciones de todos los jugadores en partidos finalizados
          </p>
          {feedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
              <p>Todavía no hay predicciones para mostrar</p>
            </div>
          ) : (
            feedItems.map(item => <FeedCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  )
}
