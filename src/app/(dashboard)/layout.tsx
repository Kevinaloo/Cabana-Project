import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const SESSION_TOKEN = 'cabana_session_v1_secure'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('cabana_auth')?.value

  if (auth !== SESSION_TOKEN) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1526', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }} className="main-content">
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content { padding: 80px 16px 24px !important; }
        }
      `}</style>
    </div>
  )
}
