'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'

interface WeightEntry { date: string; weight: number }

function LineChart({ data, color, height = 90 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null
  const max   = Math.max(...data)
  const min   = Math.min(...data)
  const range = max - min || 1
  const w     = 100 / (data.length - 1)
  const y     = (v: number) => height - (((v - min) / range) * height * 0.8 + height * 0.1)
  const points = data.map((d, i) => `${i * w},${y(d)}`).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => (
        <circle key={i} cx={i * w} cy={y(d)} r="2.5" fill={color}/>
      ))}
    </svg>
  )
}

export default function Progress() {
  const { loading, profile } = useAuth()
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [inputWeight, setInputWeight] = useState('')
  const [inputDate, setInputDate]     = useState(new Date().toISOString().split('T')[0])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem('apex_weight') || '[]')) } catch {}
  }, [])

  if (loading) return <Loader />

  const goalWeight   = profile?.goalWeight  || 0
  const startWeight  = profile?.weight      || 0
  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : null
  const firstWeight   = entries.length > 0 ? entries[0].weight : startWeight
  const change        = currentWeight != null ? +(currentWeight - firstWeight).toFixed(1) : null
  const progressPct   = currentWeight != null && goalWeight && firstWeight !== goalWeight
    ? Math.min(100, Math.max(0, Math.round(((firstWeight - currentWeight) / (firstWeight - goalWeight)) * 100)))
    : 0

  const logWeight = () => {
    const w = parseFloat(inputWeight)
    if (!w || w < 20 || w > 400) return
    const entry: WeightEntry = { date: inputDate, weight: w }
    const updated = [...entries.filter(e => e.date !== inputDate), entry]
      .sort((a, b) => a.date.localeCompare(b.date))
    setEntries(updated)
    localStorage.setItem('apex_weight', JSON.stringify(updated))
    setInputWeight('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteEntry = (date: string) => {
    const updated = entries.filter(e => e.date !== date)
    setEntries(updated)
    localStorage.setItem('apex_weight', JSON.stringify(updated))
  }

  const chartData = entries.map(e => e.weight)

  return (
    <AppShell>
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Progress</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Track your weight and long-term results</p>
        </div>

        {/* Log weight */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={label}>Log Weight</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.03em' }}>Weight (kg)</div>
              <input
                type="number" value={inputWeight} onChange={e => setInputWeight(e.target.value)}
                placeholder="e.g. 82.5"
                onKeyDown={e => e.key === 'Enter' && logWeight()}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.03em' }}>Date</div>
              <input
                type="date" value={inputDate} onChange={e => setInputDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button onClick={logWeight}
              style={{ background: saved ? 'var(--green)' : 'var(--accent)', color: '#07070F', border: 'none', borderRadius: 9, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {saved ? 'Saved' : 'Log'}
            </button>
          </div>
        </div>

        {/* Stats + chart */}
        {entries.length > 0 && (
          <>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={label}>Weight Trend</div>
                {goalWeight > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{progressPct}% to goal</div>
                )}
              </div>

              {entries.length >= 2 ? (
                <>
                  <LineChart data={chartData} color="var(--accent)" height={100}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 6, marginBottom: 16 }}>
                    <span>{entries[0].date}</span>
                    <span>{entries[entries.length - 1].date}</span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Log at least 2 entries to see your trend.</div>
              )}

              {goalWeight > 0 && (
                <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: 3 }}/>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[
                  { l: 'Current',   v: currentWeight != null ? `${currentWeight} kg` : '—' },
                  { l: 'Starting',  v: `${firstWeight} kg` },
                  { l: 'Change',    v: change != null ? `${change > 0 ? '+' : ''}${change} kg` : '—' },
                  { l: 'Goal',      v: goalWeight ? `${goalWeight} kg` : '—' },
                ].map(s => (
                  <div key={s.l} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700 }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, letterSpacing: '0.04em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* History list */}
            <div style={card}>
              <div style={label}>All Entries</div>
              {[...entries].reverse().map(e => (
                <div key={e.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{e.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700 }}>{e.weight} kg</span>
                    <button onClick={() => deleteEntry(e.date)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {entries.length === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <EmptyChart title="Strength Progress"   hint="Log workouts to track your key lifts over time." />
            <EmptyChart title="Cardio Performance"  hint="Log cardio sessions to track pace and endurance." />
          </div>
        )}

      </div>
    </AppShell>
  )
}

function EmptyChart({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={card}>
      <div style={label}>{title}</div>
      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: '0 16px', lineHeight: 1.6 }}>{hint}</div>
      </div>
    </div>
  )
}

const card: React.CSSProperties      = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }
const label: React.CSSProperties     = { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 14 }
const inputStyle: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 13px', color: 'var(--text)', fontSize: 14, width: '100%' }
