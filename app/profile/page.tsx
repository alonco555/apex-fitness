'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'
import { supabase } from '@/lib/supabase'

export default function Profile() {
  const { loading, user, profile, logout } = useAuth()
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [form, setForm]             = useState<Record<string,string>>({})
  const [initialized, setInitialized] = useState(false)

  if (loading) return <Loader />

  if (!initialized && profile) {
    setForm({
      name:           profile.name,
      age:            String(profile.age),
      gender:         profile.gender,
      height:         String(profile.height),
      weight:         String(profile.weight),
      goalWeight:     String(profile.goalWeight),
      goal:           profile.goal,
      activity:       profile.activity,
      targetCalories: String(profile.targetCalories),
      targetProtein:  String(profile.targetProtein),
    })
    setInitialized(true)
  }

  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const handleSave = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: {
      full_name:      form.name,
      age:            +form.age,
      gender:         form.gender,
      height:         +form.height,
      weight:         +form.weight,
      goal_weight:    +form.goalWeight,
      fitness_goal:   form.goal,
      activity_level: form.activity,
      target_calories:+form.targetCalories,
      target_protein: +form.targetProtein,
    }})
    setSaving(false)
    setSaved(true)
    setTimeout(()=>setSaved(false), 2500)
  }

  const initial = profile?.name?.charAt(0)?.toUpperCase() || 'A'

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:28,padding:24,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-head)',fontWeight:800,fontSize:22,color:'#07070F',flexShrink:0}}>
            {initial}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800}}>{profile?.name}</div>
            <div style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{user?.email}</div>
            <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:6,background:'var(--accent-dim)',color:'var(--accent)',border:'1px solid rgba(200,255,87,0.2)'}}>
                {(profile?.goal||'fat_loss').replace('_',' ').replace(/\b\w/g,(c: string)=>c.toUpperCase())}
              </span>
              <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:6,background:'var(--surface3)',color:'var(--text2)'}}>
                Free Plan
              </span>
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

          {/* Edit form */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={card}>
              <div style={sectionLabel}>Body Stats</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {l:'Full Name',      k:'name',           type:'text',   full:true},
                  {l:'Age',            k:'age',            type:'number'},
                  {l:'Gender',         k:'gender',         type:'select', opts:['male','female']},
                  {l:'Height (cm)',     k:'height',         type:'number'},
                  {l:'Weight (kg)',     k:'weight',         type:'number'},
                  {l:'Goal Weight (kg)',k:'goalWeight',     type:'number'},
                ].map(f=>(
                  <div key={f.k} style={{gridColumn:f.full?'1/-1':undefined}}>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5,letterSpacing:'0.02em'}}>{f.l}</label>
                    {f.type==='select'?(
                      <select value={form[f.k]||''} onChange={e=>set(f.k,e.target.value)} style={inputStyle}>
                        {f.opts?.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                      </select>
                    ):(
                      <input type={f.type} value={form[f.k]||''} onChange={e=>set(f.k,e.target.value)} style={inputStyle}/>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={sectionLabel}>Goals & Targets</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5,letterSpacing:'0.02em'}}>Fitness Goal</label>
                  <select value={form.goal||''} onChange={e=>set('goal',e.target.value)} style={inputStyle}>
                    {['fat_loss','muscle_gain','recomp','performance','endurance'].map(o=>(
                      <option key={o} value={o}>{o.replace('_',' ').replace(/\b\w/g,(c: string)=>c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5,letterSpacing:'0.02em'}}>Daily Calories</label>
                  <input type="number" value={form.targetCalories||''} onChange={e=>set('targetCalories',e.target.value)} style={inputStyle}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5,letterSpacing:'0.02em'}}>Protein Target (g)</label>
                  <input type="number" value={form.targetProtein||''} onChange={e=>set('targetProtein',e.target.value)} style={inputStyle}/>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                style={{width:'100%',marginTop:16,background:saved?'var(--green)':'var(--accent)',color:'#07070F',border:'none',borderRadius:8,padding:'12px',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer'}}>
                {saving?<Spin/>:saved?'Saved':'Save Changes'}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={card}>
              <div style={sectionLabel}>Account Info</div>
              {[
                {l:'Email',        v:user?.email||'—'},
                {l:'Member since', v:user?.created_at?new Date(user.created_at).toLocaleDateString('en-US',{month:'long',year:'numeric'}):'—'},
                {l:'Auth',         v:'Email / Password'},
                {l:'Plan',         v:'Free'},
              ].map(r=>(
                <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
                  <span style={{color:'var(--text2)'}}>{r.l}</span>
                  <span style={{fontWeight:600,fontSize:12,maxWidth:200,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.v}</span>
                </div>
              ))}
            </div>

            <div style={card}>
              <div style={sectionLabel}>Account</div>
              <button onClick={logout} style={{width:'100%',background:'transparent',border:'1px solid rgba(248,113,113,0.2)',borderRadius:8,padding:'11px',fontSize:14,color:'var(--red)',fontWeight:600,cursor:'pointer'}}>
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

function Spin() {
  return <span style={{width:16,height:16,border:'2px solid rgba(0,0,0,0.2)',borderTop:'2px solid #07070F',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/>
}

const card: React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:20}
const inputStyle: React.CSSProperties = {width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:9,padding:'10px 12px',color:'var(--text)',fontSize:14}
const sectionLabel: React.CSSProperties = {fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--text3)',marginBottom:14}
