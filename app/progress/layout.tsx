import BottomNav from '@/components/BottomNav'

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
