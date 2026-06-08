'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Nesprávny email alebo heslo.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 safe-top grain">
      {/* Top */}
      <div className="stagger">
        <div className="mb-12 mt-8">
          <p className="text-[var(--text-muted)] text-sm tracking-widest uppercase font-display mb-2">
            Vitaj späť
          </p>
          <h1 className="font-display text-6xl text-white leading-none">
            ZAČNI<br />
            <span className="text-[var(--red)]">CHUDNÚŤ</span><br />
            DNES.
          </h1>
        </div>

        <div className="text-[var(--text-muted)] text-sm italic border-l-2 border-[var(--red)] pl-4 mb-10">
          „Disciplína je pamätanie na to, čo chceš."
        </div>
      </div>

      {/* Form */}
      <div className="stagger space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
            Email
          </label>
          <input
            type="email"
            className="slim-input"
            placeholder="tvoj@email.sk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div>
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
            Heslo
          </label>
          <input
            type="password"
            className="slim-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          className="btn-primary mt-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Prihlasovanie...' : 'PRIHLÁSIŤ SA'}
        </button>

        <p className="text-center text-[var(--text-muted)] text-sm pt-2">
          Ešte nemáš účet?{' '}
          <Link href="/auth/register" className="text-[var(--red)] font-medium">
            Zaregistruj sa
          </Link>
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="text-[var(--text-muted)] text-xs text-center pb-4">
        Každý gram sa počíta. 🔥
      </div>
    </div>
  )
}
