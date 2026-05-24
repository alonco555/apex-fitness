'use client'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar />
      <main style={{flex:1,marginLeft:'var(--sidebar)',padding:'32px',minHeight:'100vh',maxWidth:'100%',overflowX:'hidden'}}>
        {children}
      </main>
    </div>
  )
}
