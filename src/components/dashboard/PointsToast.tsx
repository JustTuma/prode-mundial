'use client'
import { useEffect, useState } from 'react'
import Confetti from '@/components/ui/Confetti'

interface Props {
  totalPoints: number
  userId: string
}

export default function PointsToast({ totalPoints, userId }: Props) {
  const [show, setShow] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [gained, setGained] = useState(0)

  useEffect(() => {
    const key = `pts_${userId}`
    const prev = parseInt(localStorage.getItem(key) || '0')
    if (totalPoints > prev && prev > 0) {
      setGained(totalPoints - prev)
      setShow(true)
      setConfetti(true)
      setTimeout(() => setShow(false), 4000)
    }
    localStorage.setItem(key, totalPoints.toString())
  }, [totalPoints, userId])

  if (!show || gained <= 0) return null

  return (
    <>
    {confetti && <Confetti onDone={() => setConfetti(false)} />}
    <div style={{
      position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, animation: 'slideDown 0.4s ease',
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOut {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, #1a1200, #2a1f00)',
        border: '2px solid #f59e0b',
        borderRadius: '16px', padding: '16px 24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
        animation: 'fadeOut 4s ease forwards',
        minWidth: '220px',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏆</div>
        <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>
          +{gained} pts
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>
          ¡Sumaste puntos!
        </div>
        <div style={{ color: '#f59e0b', fontSize: '12px', marginTop: '2px', fontWeight: 600 }}>
          Total: {totalPoints} ⭐
        </div>
      </div>
    </div>
    </>
  )
}
