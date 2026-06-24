'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const REACTIONS = ['⚽', '🔥', '😱', '🎉', '👏', '😤', '❤️', '🤯']

interface Comment { id: string; content: string; created_at: string; profiles?: { username: string } }

interface Props {
  matchId: number
  comments: Comment[]
  reactionCounts: Record<string, number>
  userReactions: string[]
  userId?: string
}

export default function MatchComments({ matchId, comments: initial, reactionCounts: initRC, userReactions: initUR, userId }: Props) {
  const [comments, setComments] = useState(initial)
  const [reactionCounts, setReactionCounts] = useState(initRC)
  const [userReactions, setUserReactions] = useState(new Set(initUR))
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggleReaction(emoji: string) {
    if (!userId) return
    const has = userReactions.has(emoji)
    const newSet = new Set(userReactions)
    const newCounts = { ...reactionCounts }

    if (has) {
      newSet.delete(emoji)
      newCounts[emoji] = Math.max(0, (newCounts[emoji] || 1) - 1)
      await supabase.from('match_reactions').delete().eq('match_id', matchId).eq('user_id', userId).eq('emoji', emoji)
    } else {
      newSet.add(emoji)
      newCounts[emoji] = (newCounts[emoji] || 0) + 1
      await supabase.from('match_reactions').upsert({ match_id: matchId, user_id: userId, emoji })
    }
    setUserReactions(newSet)
    setReactionCounts(newCounts)
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setLoading(true)

    const { data } = await supabase.from('match_comments').insert({
      match_id: matchId, user_id: userId, content: text.trim()
    }).select('*, profiles(username)').single()

    if (data) {
      setComments(prev => [...prev, data as Comment])
      setText('')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Reactions */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1e1e2e' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Reacciones
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {REACTIONS.map(emoji => (
            <button key={emoji} onClick={() => toggleReaction(emoji)} style={{
              background: userReactions.has(emoji) ? '#3b82f622' : '#1e1e2e',
              border: '1px solid', borderColor: userReactions.has(emoji) ? '#3b82f6' : '#2a2a3e',
              borderRadius: '99px', padding: '6px 12px', cursor: userId ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px',
              transition: 'all 0.15s', color: '#f0f0f5',
            }}>
              {emoji}
              {reactionCounts[emoji] > 0 && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{reactionCounts[emoji]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💬 Comentarios ({comments.length})
        </h3>

        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {comments.length === 0 && (
            <p style={{ color: '#374151', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
              Sé el primero en comentar 👇
            </p>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '12px',
              }}>
                {c.profiles?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#94a3b8' }}>{c.profiles?.username || 'Usuario'}</span>
                  <span style={{ color: '#374151', fontSize: '11px' }}>
                    {new Date(c.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
                  </span>
                </div>
                <div style={{ color: '#f0f0f5', fontSize: '14px', lineHeight: 1.4 }}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>

        {userId ? (
          <form onSubmit={postComment} style={{ display: 'flex', gap: '8px' }}>
            <input className="input" value={text} onChange={e => setText(e.target.value)}
              placeholder="Escribí algo..." maxLength={200} style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" disabled={loading || !text.trim()} style={{ flexShrink: 0 }}>
              {loading ? '...' : 'Enviar'}
            </button>
          </form>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
            <a href="/auth" style={{ color: '#3b82f6' }}>Iniciá sesión</a> para comentar
          </p>
        )}
      </div>
    </div>
  )
}
