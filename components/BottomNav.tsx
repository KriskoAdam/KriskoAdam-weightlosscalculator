'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dnes', icon: '🔥' },
  { href: '/progress', label: 'Pokrok', icon: '📈' },
  { href: '/health', label: 'Zdravie', icon: '❤️' },
  { href: '/profile', label: 'Profil', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 ${
                active ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span className={`text-2xl transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span
                className={`text-xs font-medium transition-all ${
                  active ? 'text-[var(--red)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-[var(--red)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
