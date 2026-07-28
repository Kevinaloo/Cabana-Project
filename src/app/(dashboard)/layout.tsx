import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1526', overflow: 'hidden' }}>
      <Sidebar user={user} profile={profile} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }} className="main-content">
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding: 80px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
