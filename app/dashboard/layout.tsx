import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Apex',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
