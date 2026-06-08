'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { daysUntilWeighIn } from '@/lib/calculations'

interface WeighIn {
  id: string
  date: string
  weight_kg: number
}

interface Profile {
  id: string
  current_weight_kg: number
  start_weight_kg: number
  goal_weight_kg: number
  height_cm: number
  last_weigh_in: string | null
}

export default function ProgressPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [weighIns, setWeighIns] = useState<WeighIn[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof) setProfile(prof)

    const { data: wis } = await supabase
      .from('weigh_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    if (wis) setWeighIns(wis)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  const handleWeighIn = async () => {
    if (!profile || !newWeight) return
    setSaving(true)

    const today = new Date().toISOString().split('T')[0]
    const weight = parseFloat(newWeight)

    await supabase.from('weigh_ins').insert({
      user_id: profile.id,
      date: today,
      weight_kg: weight,
    })

    await supabase.from('profiles').update({
      current_weight_kg: weight,
      last_weigh_in: today,
    }).eq('id', profile.id)

    setNewWeight('')
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  const addToCalendar = () => {
    const today = new Date()
    const next = new Date(today)
    next.setDate(today.getDate() + 15)
    const dateStr = next.toISOString().split('T')[0].replace(/-/g, '')
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Váženie+%E2%9A%96%EF%B8%8F+SlimApp&dates=${dateStr}/${dateStr}&details=Čas+na+ďalšie+váženie!`
    window.open(url, '_blank')
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--red)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const daysLeft = daysUntilWeighIn(profile.last_weigh_in)
  const totalLost = profile.start_weight_kg - profile.current_weight_kg
  const maxWeight = Math.max(...weighIns.map(w => w.weight_kg), profile.start_weight_kg)
  const minWeight = Math.min(...weighIns.map(w => w.weight_kg), profile.goal_weight_kg)
  const range = maxWeight - minWeight || 1

  return (
    <div className="min-h-screen safe-bottom">
      <div className="px-5 pt-14 pb-4">
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Tvoj pokrok</p>
        <h1 className="font-display text-4xl text-white">HISTÓRIA VÁHY</h1>
      </div>

      {/* Stats row */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Schudnuté', value: `${totalLost > 0 ? '-' : '+'}${Math.abs(totalLost).toFixed(1)}kg`, color: totalLost > 0 ? 'text-green-400' : 'text-[var(--red)]' },
          { label: 'Aktuálne', value: `${profile.current_weight_kg.toFixed(1)}kg`, color: 'text-white' },
          { label: 'Cieľ', value: `${profile.goal_weight_kg}kg`, color: 'text-[var(--red)]' },
        ].map((s) => (
          <div key={s.label} className="glow-card p-3 text-center">
            <p className={`font-display text-xl ${s.color}`}>{s.value}</p>
            <p className="text-[var(--text-muted)] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Simple chart */}
      {weighIns.length > 1 && (
        <div className="mx-5 mb-5 glow-card p-5">
          <h3 className="font-display text-lg text-white mb-4">GRAF VÁHY</h3>
          <div className="relative h-32">
            <svg width="100%" height="100%" viewBox={`0 0 ${weighIns.length * 50} 120`} preserveAspectRatio="none">
              {/* Goal line */}
              <line
                x1="0" y1={((maxWeight - profile.goal_weight_kg) / range) * 100 + 10}
                x2={weighIns.length * 50} y2={((maxWeight - profile.goal_weight_kg) / range) * 100 + 10}
                stroke="rgba(255,45,45,0.3)" strokeWidth="1" strokeDasharray="4,4"
              />
              {/* Weight line */}
              <polyline
                points={weighIns.map((w, i) => {
                  const x = i * 50 + 25
                  const y = ((maxWeight - w.weight_kg) / range) * 100 + 10
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="var(--red)"
                strokeWidth="2"
              />
              {/* Dots */}
              {weighIns.map((w, i) => {
                const x = i * 50 + 25
                const y = ((maxWeight - w.weight_kg) / range) * 100 + 10
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill="var(--red)" />
                )
              })}
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-0 text-[10px] text-[var(--text-muted)]">
              {maxWeight.toFixed(1)}
            </div>
            <div className="absolute bottom-0 left-0 text-[10px] text-[var(--text-muted)]">
              {minWeight.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Weigh-in section */}
      <div className="mx-5 mb-4 glow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl text-white">VÁŽENIE</h3>
          {daysLeft > 0 ? (
            <span className="text-[var(--text-muted)] text-xs">za {daysLeft} dní</span>
          ) : (
            <span className="text-[var(--gold)] text-xs font-medium">⚖️ Dnes!</span>
          )}
        </div>

        {!showForm ? (
          <div className="space-y-3">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              ⚖️ ZADAŤ VÁHU
            </button>
            <button className="btn-ghost w-full" onClick={addToCalendar}>
              📅 Pridať pripomienku do kalendára
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">
              Naváženú hmotnosť (kg)
            </label>
            <input
              type="number"
              step="0.1"
              className="slim-input text-center text-2xl"
              placeholder="napr. 88.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Zrušiť</button>
              <button className="btn-primary flex-[2]" onClick={handleWeighIn} disabled={saving}>
                {saving ? 'Ukladám...' : 'ULOŽIŤ VÁHU'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History list */}
      <div className="mx-5 mb-4">
        <h3 className="font-display text-lg text-white mb-3">HISTÓRIA</h3>
        <div className="space-y-2">
          {[...weighIns].reverse().map((wi, i) => {
            const prev = [...weighIns].reverse()[i + 1]
            const diff = prev ? wi.weight_kg - prev.weight_kg : null
            return (
              <div key={wi.id} className="glow-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{wi.weight_kg} kg</p>
                  <p className="text-[var(--text-muted)] text-xs">{new Date(wi.date).toLocaleDateString('sk-SK')}</p>
                </div>
                {diff !== null && (
                  <span className={`font-display text-lg ${diff < 0 ? 'text-green-400' : 'text-[var(--red)]'}`}>
                    {diff < 0 ? '↓' : '↑'} {Math.abs(diff).toFixed(1)} kg
                  </span>
                )}
              </div>
            )
          })}
          {weighIns.length === 0 && (
            <p className="text-[var(--text-muted)] text-sm text-center py-4">Zatiaľ žiadne váženia.</p>
          )}
        </div>
      </div>
    </div>
  )
}
