'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import { daysUntilPhotoUpdate } from '@/lib/calculations'

interface Profile {
  id: string
  full_name: string
  current_weight_kg: number
  start_weight_kg: number
  goal_weight_kg: number
  height_cm: number
  last_photo_date: string | null
}

interface PhotoSet {
  id: string
  date: string
  front_url: string | null
  left_url: string | null
  right_url: string | null
  weight_at_photo: number | null
}

const PHOTO_VIEWS = [
  { key: 'front', label: 'Spredu', icon: '🧍' },
  { key: 'left', label: 'Zľava', icon: '🧍‍♂️' },
  { key: 'right', label: 'Sprava', icon: '🧍‍♀️' },
] as const

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [photoSets, setPhotoSets] = useState<PhotoSet[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [newPhotos, setNewPhotos] = useState<{ front?: File; left?: File; right?: File }>({})
  const [previewUrls, setPreviewUrls] = useState<{ front?: string; left?: string; right?: string }>({})
  const [savingPhotos, setSavingPhotos] = useState(false)
  const [selectedSet, setSelectedSet] = useState<number>(0)
  const fileRefs = { front: useRef<HTMLInputElement>(null), left: useRef<HTMLInputElement>(null), right: useRef<HTMLInputElement>(null) }

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof) setProfile(prof)

    const { data: photos } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (photos) {
      // Get signed URLs for each photo
      const setsWithUrls = await Promise.all(photos.map(async (p) => {
        const getUrl = async (path: string | null) => {
          if (!path) return null
          const { data } = await supabase.storage.from('progress-photos').createSignedUrl(path, 3600)
          return data?.signedUrl || null
        }
        return {
          ...p,
          front_url: await getUrl(p.front_url),
          left_url: await getUrl(p.left_url),
          right_url: await getUrl(p.right_url),
        }
      }))
      setPhotoSets(setsWithUrls)
    }
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  const handleFileSelect = (view: 'front' | 'left' | 'right', file: File) => {
    setNewPhotos((p) => ({ ...p, [view]: file }))
    const url = URL.createObjectURL(file)
    setPreviewUrls((p) => ({ ...p, [view]: url }))
  }

  const uploadPhotos = async () => {
    if (!profile) return
    if (!newPhotos.front || !newPhotos.left || !newPhotos.right) {
      alert('Nahraj všetky 3 fotky (spredu, zľava, sprava)')
      return
    }
    setSavingPhotos(true)

    const today = new Date().toISOString().split('T')[0]
    const paths: Record<string, string> = {}

    for (const view of ['front', 'left', 'right'] as const) {
      const file = newPhotos[view]!
      const path = `${profile.id}/${today}_${view}.jpg`
      setUploading(view)
      const { error } = await supabase.storage.from('progress-photos').upload(path, file, { upsert: true })
      if (!error) paths[view] = path
    }

    await supabase.from('progress_photos').insert({
      user_id: profile.id,
      date: today,
      front_url: paths.front,
      left_url: paths.left,
      right_url: paths.right,
      weight_at_photo: profile.current_weight_kg,
    })

    await supabase.from('profiles').update({ last_photo_date: today }).eq('id', profile.id)

    setNewPhotos({})
    setPreviewUrls({})
    setUploading(null)
    setSavingPhotos(false)
    loadData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--red)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const photoDays = daysUntilPhotoUpdate(profile.last_photo_date)
  const needsNewPhotos = photoDays === 0

  return (
    <div className="min-h-screen safe-bottom">
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Tvoj</p>
          <h1 className="font-display text-4xl text-white">PROFIL</h1>
        </div>
        <button onClick={handleLogout} className="text-[var(--text-muted)] text-sm btn-ghost px-3 py-2">
          Odhlásiť
        </button>
      </div>

      {/* Profile info */}
      <div className="mx-5 mb-4 glow-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-3xl">
            💪
          </div>
          <div>
            <h2 className="font-display text-2xl text-white">{profile.full_name}</h2>
            <p className="text-[var(--text-muted)] text-sm">{profile.height_cm} cm</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Začiatok', value: `${profile.start_weight_kg}kg` },
            { label: 'Teraz', value: `${profile.current_weight_kg.toFixed(1)}kg` },
            { label: 'Cieľ', value: `${profile.goal_weight_kg}kg` },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl text-white">{s.value}</p>
              <p className="text-[var(--text-muted)] text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Photos section */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl text-white">📸 PROGRESS FOTKY</h3>
          {photoDays > 0 && (
            <span className="text-[var(--text-muted)] text-xs">Aktualizácia za {photoDays}d</span>
          )}
          {needsNewPhotos && (
            <span className="text-[var(--gold)] text-xs font-medium">Čas na nové!</span>
          )}
        </div>

        {/* New photo upload */}
        {(needsNewPhotos || photoSets.length === 0) && (
          <div className="glow-card p-5 mb-4">
            <p className="text-white text-sm mb-4">
              {photoSets.length === 0 ? '👋 Nahraj prvé fotky na štart svojej cesty!' : '🔄 Nahraj nové fotky a sleduj zmenu!'}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {PHOTO_VIEWS.map(({ key, label, icon }) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => fileRefs[key].current?.click()}
                    className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                      previewUrls[key]
                        ? 'border-[var(--red)] p-0 overflow-hidden'
                        : 'border-[var(--border)] hover:border-[var(--red)]'
                    }`}
                  >
                    {previewUrls[key] ? (
                      <img src={previewUrls[key]} alt={label} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <>
                        <span className="text-2xl mb-1">{icon}</span>
                        <span className="text-[var(--text-muted)] text-xs">+</span>
                      </>
                    )}
                  </button>
                  <span className="text-[var(--text-muted)] text-xs">{label}</span>
                  <input
                    ref={fileRefs[key]}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileSelect(key, f)
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={uploadPhotos}
              disabled={savingPhotos || !newPhotos.front || !newPhotos.left || !newPhotos.right}
            >
              {savingPhotos
                ? `Nahrávam ${uploading}...`
                : '📤 NAHRAŤ FOTKY'}
            </button>
          </div>
        )}

        {/* Photo history */}
        {photoSets.length > 0 && (
          <div>
            {/* Date selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {photoSets.map((set, i) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(i)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedSet === i
                      ? 'bg-[var(--red)] border-[var(--red)] text-white'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  {new Date(photoSets[i].date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })}
                  {i === 0 && ' (najnovšie)'}
                </button>
              ))}
            </div>

            {/* Selected photo set */}
            {photoSets[selectedSet] && (
              <div>
                <div className="grid grid-cols-3 gap-2">
                  {['front_url', 'left_url', 'right_url'].map((key, i) => {
                    const url = photoSets[selectedSet][key as keyof PhotoSet] as string | null
                    const labels = ['Spredu', 'Zľava', 'Sprava']
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        {url ? (
                          <img
                            src={url}
                            alt={labels[i]}
                            className="w-full aspect-[3/4] object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full aspect-[3/4] bg-[var(--surface-2)] rounded-xl flex items-center justify-center">
                            <span className="text-[var(--text-muted)] text-xs">N/A</span>
                          </div>
                        )}
                        <p className="text-[var(--text-muted)] text-xs text-center">{labels[i]}</p>
                      </div>
                    )
                  })}
                </div>
                {photoSets[selectedSet].weight_at_photo && (
                  <p className="text-[var(--text-muted)] text-xs text-center mt-2">
                    Váha pri fotke: <span className="text-white font-medium">{photoSets[selectedSet].weight_at_photo} kg</span>
                  </p>
                )}
              </div>
            )}

            {/* Comparison – newest vs oldest */}
            {photoSets.length >= 2 && (
              <div className="mt-5">
                <h4 className="font-display text-lg text-white mb-3">POROVNANIE: VTEDY VS TERAZ</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[photoSets[photoSets.length - 1], photoSets[0]].map((set, i) => (
                    <div key={set.id}>
                      <p className="text-[var(--text-muted)] text-xs mb-1 text-center">
                        {i === 0 ? '🏁 Začiatok' : '⭐ Teraz'}
                      </p>
                      {set.front_url ? (
                        <img
                          src={set.front_url}
                          alt=""
                          className="w-full aspect-[3/4] object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full aspect-[3/4] bg-[var(--surface-2)] rounded-xl" />
                      )}
                      <p className="text-white text-xs text-center mt-1 font-medium">
                        {set.weight_at_photo} kg
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <p className="font-display text-2xl text-green-400">
                    -{(profile.start_weight_kg - profile.current_weight_kg).toFixed(1)} KG
                  </p>
                  <p className="text-[var(--text-muted)] text-xs">celkový úbytok</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
