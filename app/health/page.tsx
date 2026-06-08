'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import {
  calculateBMI, getBMICategory, getBMILabel, getHeartAttackRisk, getAge
} from '@/lib/calculations'
import {
  obesityFacts, weightLossHealthBenefits, getHealthBenefitsAchieved, getNextHealthMilestone
} from '@/lib/healthData'

interface Profile {
  current_weight_kg: number
  start_weight_kg: number
  goal_weight_kg: number
  height_cm: number
  birth_date: string
  gender: 'male' | 'female'
}

export default function HealthPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [supabase])

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--red)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const bmi = calculateBMI(profile.current_weight_kg, profile.height_cm)
  const bmiCategory = getBMICategory(bmi)
  const bmiLabel = getBMILabel(bmiCategory)
  const risk = getHeartAttackRisk(bmi)
  const lostKg = profile.start_weight_kg - profile.current_weight_kg
  const achievedBenefits = getHealthBenefitsAchieved(lostKg)
  const nextMilestone = getNextHealthMilestone(lostKg)

  const bmiColor =
    bmiCategory === 'normal' ? '#22C55E' :
    bmiCategory === 'underweight' ? '#60A5FA' :
    bmiCategory === 'overweight' ? '#F59E0B' : '#FF2D2D'

  // BMI gauge (18.5 to 40 range)
  const bmiGaugePct = Math.min(100, Math.max(0, ((bmi - 16) / (42 - 16)) * 100))

  return (
    <div className="min-h-screen safe-bottom">
      <div className="px-5 pt-14 pb-4">
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Tvoje</p>
        <h1 className="font-display text-4xl text-white">ZDRAVIE</h1>
      </div>

      {/* BMI Card */}
      <div className="mx-5 mb-4 glow-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Index telesnej hmotnosti</p>
            <p className="font-display text-6xl" style={{ color: bmiColor }}>{bmi.toFixed(1)}</p>
            <p className="text-sm mt-1" style={{ color: bmiColor }}>{bmiLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--text-muted)] text-xs mb-1">Riziko infarktu</p>
            <p className="font-display text-3xl text-[var(--red)]">
              {risk.percentIncrease > 0 ? `+${risk.percentIncrease}%` : 'Normál'}
            </p>
            <p className="text-[var(--text-muted)] text-xs">vs. zdravá váha</p>
          </div>
        </div>

        {/* BMI gauge */}
        <div className="relative mb-2">
          <div className="h-3 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #22C55E 30%, #F59E0B 55%, #FF2D2D 100%)' }}>
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0a0a0a] shadow-lg transition-all duration-700"
            style={{ left: `calc(${bmiGaugePct}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Podváha</span>
          <span>Normál</span>
          <span>Nadváha</span>
          <span>Obezita</span>
        </div>
      </div>

      {/* Milestones */}
      {lostKg > 0 && (
        <div className="mx-5 mb-4">
          <h3 className="font-display text-lg text-white mb-3">🏆 DOSIAHNUTÉ MÍĽNIKY</h3>
          <div className="space-y-2">
            {achievedBenefits.map((b) => (
              <div key={b.kg} className="flex items-center gap-3 glow-card p-3 bg-green-950/20 border-green-900">
                <span className="text-green-400 font-display text-lg">-{b.kg}kg</span>
                <p className="text-white text-sm flex-1">{b.benefit}</p>
                <span className="text-green-400">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next milestone */}
      {nextMilestone && (
        <div className="mx-5 mb-4 glow-card p-4">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Ďalší míľnik</p>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl text-[var(--gold)]">-{nextMilestone.kg}kg</span>
            <p className="text-white text-sm">{nextMilestone.benefit}</p>
          </div>
          <div className="mt-3 progress-bar">
            <div className="progress-fill" style={{ width: `${(lostKg / nextMilestone.kg) * 100}%` }} />
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            {lostKg.toFixed(1)} / {nextMilestone.kg} kg
          </p>
        </div>
      )}

      {/* Obesity facts */}
      <div className="px-5 mb-4">
        <h3 className="font-display text-lg text-white mb-3">📊 FAKTY O OBEZITE</h3>
        <div className="space-y-3">
          {obesityFacts.map((fact, i) => (
            <div key={i} className="glow-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{fact.icon}</span>
                <p className="font-display text-lg text-white">{fact.title}</p>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{fact.fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All milestones table */}
      <div className="px-5 mb-6">
        <h3 className="font-display text-lg text-white mb-3">💊 ČO TI PRINESIE KAŽDÝ KG</h3>
        <div className="space-y-2">
          {weightLossHealthBenefits.map((b) => {
            const done = lostKg >= b.kg
            return (
              <div
                key={b.kg}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? 'border-green-900 bg-green-950/20'
                    : 'border-[var(--border)] opacity-50'
                }`}
              >
                <span className={`font-display text-lg w-12 text-center ${done ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
                  -{b.kg}
                </span>
                <p className="text-sm text-white flex-1">{b.benefit}</p>
                {done && <span className="text-green-400 text-lg">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
