'use client'

import { useEffect, useRef, useState } from 'react'

interface WeightDisplayProps {
  weight: number
  delta?: number | null // grams changed today
  animate?: boolean
}

function useCountUp(target: number, duration: number = 800) {
  const [current, setCurrent] = useState(target)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (prevTarget.current === target) return
    const start = prevTarget.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCurrent(start + diff * ease)
      if (progress < 1) requestAnimationFrame(tick)
      else {
        setCurrent(target)
        prevTarget.current = target
      }
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return current
}

export default function WeightDisplay({ weight, delta, animate }: WeightDisplayProps) {
  const animatedWeight = useCountUp(weight, 1000)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (animate && delta != null) {
      setIsPulsing(true)
      const t = setTimeout(() => setIsPulsing(false), 1200)
      return () => clearTimeout(t)
    }
  }, [animate, delta])

  const whole = Math.floor(animatedWeight)
  const decimal = Math.round((animatedWeight - whole) * 10)

  const deltaKg = delta != null ? delta / 1000 : null
  const isLoss = deltaKg != null && deltaKg < 0

  return (
    <div className="flex flex-col items-center py-6">
      {/* Main weight */}
      <div className={`weight-display text-center ${isPulsing ? 'weight-pulse' : ''}`}>
        <div className="flex items-end justify-center gap-0">
          <span style={{ fontSize: 'clamp(80px, 22vw, 130px)' }}>{whole}</span>
          <span style={{ fontSize: 'clamp(40px, 11vw, 70px)', marginBottom: '8px', opacity: 0.7 }}>
            .{decimal}
          </span>
          <span style={{ fontSize: 'clamp(24px, 7vw, 40px)', marginBottom: '12px', marginLeft: '6px', opacity: 0.5 }}>
            kg
          </span>
        </div>
      </div>

      {/* Delta */}
      {deltaKg != null && (
        <div
          className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${isLoss
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
        >
          <span className="text-lg">{isLoss ? '↓' : '↑'}</span>
          <span>
            {isLoss ? '-' : '+'}{Math.abs(Math.round(delta!))}g dnes
          </span>
        </div>
      )}

      {deltaKg == null && (
        <p className="text-[var(--text-muted)] text-sm mt-2">Zadaj dnešné kalórie</p>
      )}
    </div>
  )
}
