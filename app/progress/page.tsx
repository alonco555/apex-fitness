'use client'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'

export default function Progress() {
  const { loading } = useAuth()

  if (loading) return <Loader />

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Progress</h1>
          <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Track your long-term results and trends</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>

          <EmptyChart
            title="Weight Trend"
            hint="Log your weight daily to see your trend over time."
          />
          <EmptyChart
            title="Daily Steps"
            hint="Connect a tracker or log steps manually to monitor your activity."
          />
          <EmptyChart
            title="Strength Progress"
            hint="Log workouts to automatically track your key lifts over time."
          />
          <EmptyChart
            title="Cardio Performance"
            hint="Log runs and cardio sessions to track your pace and endurance."
          />

        </div>

        {/* Personal Records */}
        <div style={card}>
          <div style={sectionLabel}>Personal Records</div>
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:13,color:'var(--text3)',marginBottom:6}}>No personal records yet.</div>
            <div style={{fontSize:12,color:'var(--text3)'}}>Log workouts to automatically set and track your PRs.</div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

function EmptyChart({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={card}>
      <div style={sectionLabel}>{title}</div>
      <div style={{height:90,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--surface2)',borderRadius:10,marginBottom:12}}>
        <div style={{fontSize:11,color:'var(--text3)',textAlign:'center',padding:'0 16px',lineHeight:1.6}}>{hint}</div>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:20}
const sectionLabel: React.CSSProperties = {fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--text3)',marginBottom:14}
