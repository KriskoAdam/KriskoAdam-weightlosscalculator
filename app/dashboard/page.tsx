'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import WeightDisplay from '@/components/WeightDisplay'
import BottomNav from '@/components/BottomNav'
import {
  calculateBMR,
  calculateDeficit,
  calculateNewWeight,
  calculateBMI,
  getBMICategory,
  getBMILabel,
  getHeartAttackRisk,
  getAge,
  daysUntilWeighIn,
  daysUntilPhotoUpdate,
} from '@/lib/calculations'
import { motivationalQuotes } from '@/lib/healthData'

interface Profile {
  id: string
  full_name: string
  height_cm: number
  birth_date: string
  gender: 'male' | 'female'
  start_weight_kg: number
  current_weight_kg: number
  goal_weight_kg: number
  last_weigh_in: string | null
  last_photo_date: string | null
}

interface DailyLog {
  kcal_intake: number
  kcal_burned: number
  deficit_kcal: number
  weight_change_g: number
  calculated_weight_kg: number
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [intake, setIntake] = useState('')
  const [burned, setBurned] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (prof) setProfile(prof)

    const { data: log } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (log) {
      setTodayLog(log)
      setIntake(log.kcal_intake.toString())
      setBurned(log.kcal_burned.toString())
      setSaved(true)
    }
  }, [supabase, today])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!profile || !intake || !burned) return
    setSaving(true)

    const age = getAge(profile.birth_date)
    const bmr = calculateBMR({ ...profile, age, weight_kg: profile.current_weight_kg })
    const deficitKcal = calculateDeficit(parseInt(intake), parseInt(burned), bmr)
    const newWeight = calculateNewWeight(profile.current_weight_kg, deficitKcal)
    const weightChangeG = (newWeight - profile.current_weight_kg) * 1000

    const logData = {
      user_id: profile.id,
      date: today,
      kcal_intake: parseInt(intake),
      kcal_burned: parseInt(burned),
      bmr: Math.round(bmr),
      deficit_kcal: Math.round(deficitKcal),
      weight_change_g: Math.round(weightChangeG * 10) / 10,
      calculated_weight_kg: Math.round(newWeight * 100) / 100,
    }

    await supabase.from('daily_logs').upsert(logData, { onConflict: 'user_id,date' })
    await supabase.from('profiles').update({ current_weight_kg: newWeight }).eq('id', profile.id)

    setTodayLog({
      kcal_intake: parseInt(intake),
      kcal_burned: parseInt(burned),
      deficit_kcal: Math.round(deficitKcal),
      weight_change_g: Math.round(weightChangeG * 10) / 10,
      calculated_weight_kg: Math.round(newWeight * 100) / 100,
    })

    setProfile((p) => p ? { ...p, current_weight_kg: newWeight } : p)
    setAnimate(true)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setAnimate(false), 1500)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--red)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const age = getAge(profile.birth_date)
  const bmi = calculateBMI(profile.current_weight_kg, profile.height_cm)
  const bmiCategory = getBMICategory(bmi)
  const bmiLabel = getBMILabel(bmiCategory)
  const risk = getHeartAttackRisk(bmi)
  const lostKg = profile.start_weight_kg - profile.current_weight_kg
  const remainingKg = profile.current_weight_kg - profile.goal_weight_kg
  const progressPct = Math.max(0, Math.min(100,
    ((profile.start_weight_kg - profile.current_weight_kg) / (profile.start_weight_kg - profile.goal_weight_kg)) * 100
  ))

  const weighInDays = daysUntilWeighIn(profile.last_weigh_in)
  const photoDays = daysUntilPhotoUpdate(profile.last_photo_date)

  return (
    <div className="min-h-screen safe-bottom">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest">Ahoj,</p>
          <h1 className="font-display text-3xl text-white">{profile.full_name?.split(' ')[0] || 'Bojovník'} 👋</h1>
        </div>
        <div className="text-right">
          <p className="text-[var(--text-muted)] text-xs">Cieľ</p>
          <p className="font-display text-2xl text-[var(--red)]">{profile.goal_weight_kg} kg</p>
        </div>
      </div>

      {/* Quote */}
      <div className="mx-5 mb-4 px-4 py-3 border-l-2 border-[var(--red)] bg-[var(--surface)] rounded-r-xl">
        <p className="text-white text-sm italic leading-snug">„{quote.text}"</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">— {quote.author}</p>
      </div>

      {/* Weight hero */}
      <WeightDisplay
        weight={profile.current_weight_kg}
        delta={todayLog?.weight_change_g ?? null}
        animate={animate}
      />

      {/* Progress bar */}
      <div className="mx-5 mb-5">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Začiatok: <strong className="text-white">{profile.start_weight_kg} kg</strong></span>
          <span>Zostáva: <strong className="text-[var(--red)]">{Math.max(0, remainingKg).toFixed(1)} kg</strong></span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-[var(--text-muted)] text-xs mt-1 text-right">{progressPct.toFixed(0)}% hotovo</p>
      </div>

      {/* Calorie input */}
      <div className="mx-5 mb-4 glow-card p-5">
        <h3 className="font-display text-xl text-white mb-4">DNEŠNÉ KALÓRIE</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 block">
              🍽 Príjem (kcal)
            </label>
            <input
              type="number"
              className="slim-input text-center text-lg"
              placeholder="1800"
              value={intake}
              onChange={(e) => { setIntake(e.target.value); setSaved(false) }}
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 block">
              🏃 Výdaj (kcal)
            </label>
            <input
              type="number"
              className="slim-input text-center text-lg"
              placeholder="450"
              value={burned}
              onChange={(e) => { setBurned(e.target.value); setSaved(false) }}
            />
          </div>
        </div>

        {/* Preview */}
        {intake && burned && !saved && (
          <div className="mb-4 p-3 bg-[var(--surface-2)] rounded-xl text-sm">
            {(() => {
              const bmr = calculateBMR({ ...profile, age, weight_kg: profile.current_weight_kg })
              const def = calculateDeficit(parseInt(intake), parseInt(burned), bmr)
              const changeG = (def / 7700) * 1000
              const isDeficit = def < 0
              return (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Predpokladaná zmena:</span>
                  <span className={isDeficit ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {isDeficit ? '↓' : '↑'} {Math.abs(Math.round(changeG))}g
                  </span>
                </div>
              )
            })()}
          </div>
        )}

        <button
          className={`btn-primary ${saved ? 'opacity-60' : ''}`}
          onClick={handleSave}
          disabled={saving || !intake || !burned}
        >
          {saving ? 'Ukladám...' : saved ? '✓ ULOŽENÉ' : 'ULOŽIŤ & VYPOČÍTAŤ'}
        </button>
      </div>

      {/* BMI + Risk */}
      <div className="mx-5 mb-4 grid grid-cols-2 gap-3">
        <div className="glow-card p-4">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">BMI</p>
          <p className="font-display text-3xl text-white">{bmi.toFixed(1)}</p>
          <p className={`text-xs mt-1 ${
            bmiCategory === 'normal' ? 'text-green-400' :
            bmiCategory === 'underweight' ? 'text-blue-400' : 'text-[var(--red)]'
          }`}>{bmiLabel}</p>
        </div>

        <div className="glow-card p-4">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">❤️ Riziko</p>
          <p className="font-display text-3xl text-[var(--red)]">
            {risk.percentIncrease > 0 ? `+${risk.percentIncrease}` : '✓'}%
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">vs. normál váha</p>
        </div>
      </div>

      {/* Reminders */}
      <div className="mx-5 mb-6 space-y-3">
        {weighInDays === 0 && (
          <div className="glow-card p-4 border-[var(--gold)] bg-amber-950/20">
            <p className="text-[var(--gold)] font-medium text-sm">⚖️ Čas na váženie!</p>
            <p className="text-[var(--text-muted)] text-xs">Choď na stránku Pokrok a zadaj svoju váhu.</p>
          </div>
        )}

        {photoDays === 0 && (
          <div className="glow-card p-4">
            <p className="text-white font-medium text-sm">📸 Čas na nové fotky!</p>
            <p className="text-[var(--text-muted)] text-xs">Aktualizuj svoju progress fotku v Profile.</p>
          </div>
        )}

        {lostKg > 0 && (
          <div className="glow-card p-4 bg-green-950/20 border-green-900">
            <p className="text-green-400 font-display text-lg">🎉 SCHUDOL SI {lostKg.toFixed(1)} KG!</p>
            <p className="text-[var(--text-muted)] text-xs mt-1">Riziko infarktu sa znížilo. Tak ďalej!</p>
          </div>
        )}
      </div>
    </div>
  )
}
