import Header from '@/components/layout/Header'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import MobileOnboarding from '@/components/layout/MobileOnboarding'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileOnboarding />
      <Header />
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      <MobileBottomNav />
    </>
  )
}
