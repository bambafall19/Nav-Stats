import Header from '@/components/layout/Header'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import MobileOnboarding from '@/components/layout/MobileOnboarding'
import { motion } from 'framer-motion'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileOnboarding />
      <Header />
      <motion.main
        style={{ minHeight: '100vh' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      <MobileBottomNav />
    </>
  )
}