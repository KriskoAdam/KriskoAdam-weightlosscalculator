import BottomNav from '@/components/BottomNav'

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
