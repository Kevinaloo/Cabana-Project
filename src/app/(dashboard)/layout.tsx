import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const SESSION_TOKEN = 'cabana_session_v1_secure'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (cookieStore.get('cabana_auth')?.value !== SESSION_TOKEN) redirect('/login')

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '32px 28px', maxWidth: 1280, margin: '0 auto' }} id="main-pad">
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          #main-pad { padding: 76px 16px 32px !important; }
        }
      `}</style>
    </div>
  )
}
