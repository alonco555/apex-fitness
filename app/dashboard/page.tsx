'use client'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'
import Link from 'next/link'

export default function Dashboard() {
  const { loading, profile, user } = useAuth()

  if (loading) return <Loader />

  const name = profile?.name || 'Athlete'
  const firstName = name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const targetCals = profile?.targetCalories || 0
  const targetProt = profile?.targetProtein  || 0
  const weight     = profile?.weight         || 0
  const goalWeight = profile?.goalWeight      || 0
  const goal       = (profile?.goal || 'fat_loss').replace(/_/g, ' ')

  return (
    <AppShell>
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={sectionLabel}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            {greeting}, {firstName}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>
            Goal: <span style={{ color: 'var(--accent)', fontWeight: 600, textTransform: 'capitalize' }}>{goal}</span>
            &nbsp;&middot;&nbsp;
            Target: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{targetCals > 0 ? `${targetCals} kcal / day` : 'Not set'}</span>
          </p>
        </div>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLabel}>Your Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { l: 'Current Weight', v: weight     ? `${weight} kg`                            : '—' },
              { l: 'Goal Weight',    v: goalWeight  ? `${goalWeight} kg`                        : '—' },
              { l: 'To Lose',        v: weight && goalWeight ? `${(weight - goalWeight).toFixed(1)} kg` : '—' },
              { l: 'Daily Calories', v: targetCals  ? `${targetCals} kcal`                      : '—' },
              { l: 'Protein Target', v: targetProt  ? `${targetProt} g`                         : '—' },
              { l: 'Activity Level', v: (profile?.activity || '').replace(/_/g, ' ')            || '—' },
            ].map(s => (
              <div key={s.l} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, textTransform: 'capitalize' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, letterSpacing: '0.03em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { href: '/workouts',  title: 'Log a Workout',   desc: 'No sessions logged yet. Start your first.' },
            { href: '/nutrition', title: 'Track Nutrition',  desc: 'No meals logged today. Add your first meal.' },
            { href: '/progress',  title: 'Log Your Weight',  desc: 'No weigh-ins yet. Start logging to see your trend.' },
            { href: '/programs',  title: 'Build a Program',  desc: 'No training schedule set. Build your week.' },
          ].map(item => (
            <div key={item.href} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, flex: 1 }}>{item.desc}</div>
              <Link href={item.href} style={{ display: 'block', textAlign: 'center', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600 }}>
                Get started →
              </Link>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={sectionLabel}>Account</div>
          {[
            { l: 'Email',        v: user?.email || '—' },
            { l: 'Member since', v: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            { l: 'Height',       v: profile?.height ? `${profile.height} cm` : '—' },
            { l: 'Age',          v: profile?.age    ? `${profile.age} years`  : '—' },
            { l: 'Gender',       v: profile?.gender || '—' },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{r.l}</span>
              <span style={{ fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Link href="/profile" style={{ display: 'block', textAlign: 'center', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
              Edit Profile & Targets →
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 20,
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
  marginBottom: 14,
}
