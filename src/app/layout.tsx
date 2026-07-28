import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cabana Finance',
  description: 'Investment Transparency Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{children}</body>
    </html>
  )
}
