import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AWS EC2 Dashboard',
  description: 'Manage and monitor your AWS EC2 instances',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
