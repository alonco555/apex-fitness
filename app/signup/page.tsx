'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GOALS = [
  { id:'fat_loss', label:'Fat Loss', desc:'Lose body fat', icon:'🔥' },
  { id:'muscle_gain', label:'Muscle Gain', desc:'Build size & strength', icon:'💪' },
  { id:'recomp', label:'Recomp', desc:'Lean & muscular', icon:'⚡' },
  { id:'performance', label:'Performance', desc:'Athletic output', icon:'🏆' },
  { id:'endurance', label:'Endurance', desc:'Cardio & stamina', icon:'🏃' },
]

const ACTIVITY = [
  { id:'sedentary', label:'Sedentary', desc:'Desk job, little movement' },
  { id:'lightly_active', label:'Lightly Active', desc:'1–3 days/week' },
  { id:'moderately_active', label:'Moderately Active', desc:'3–5 days/week' },
  { id:'very_active', label:'Very Active', desc:'6–7 days/week' },
  { id:'extremely_active', label:'Athlete', desc:'Intense daily training' },
]

function calcTDEE(weight: number, height: number, age: number, gender: string, activity: string) {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161
  const mult: Record<string,number> = {sedentary:1.2,lightly_active:1.375,moderately_active:1.55,very_active:1.725,extremely_active:1.9}
  return Math.round(bmr * (mult[activity] || 1.55))
}

export default function SignUp() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0=account, 1=body, 2=goal, 3=activity, 4=done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirm:'',
    age:'25', gender:'male', height:'178', weight:'80', goalWeight:'75',
    goal:'fat_loss', activity:'moderately_active',
  })

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  const tdee = calcTDEE(+form.weight, +form.height, +form.age, form.gender, form.activity)
  const targetCals = form.goal === 'fat_loss' ? tdee - 500 : form.goal === 'muscle_gain' ? tdee + 300 : tdee
  const targetProtein = Math.round(+form.weight * (form.goal === 'fat_loss' ? 2.2 : 2.0))

  const handleFinish = async () => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          age: +form.age,
          gender: form.gender,
          height: +form.height,
          weight: +form.weight,
          goal_weight: +form.goalWeight,
          fitness_goal: form.goal,
          activity_level: form.activity,
          tdee,
          target_calories: targetCals,
          target_protein: targetProtein,
        }
      }
    })
    setLoading(false)
    if (err) { setError(err.message); setStep(0); return }
    setStep(4)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const steps = ['Account','Body Stats','Your Goal','Activity','Done']

  return (
    <main style={s.page}>
      <div style={s.glow1}/><div style={s.glow2}/>
      <div style={s.card}>
        <Link href="/" style={s.logo}>apex<span style={{color:'var(--accent)'}}>.</span></Link>

        {/* Progress dots */}
        <div style={s.dots}>
          {steps.map((_,i) => (
            <div key={i} style={{...s.dot, ...(i<=step ? s.dotActive : {}), ...(i===step ? s.dotCurrent : {})}}/>
          ))}
        </div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:24,fontWeight:500}}>Step {step+1} of {steps.length} — {steps[step]}</div>

        {/* STEP 0: Account */}
        {step === 0 && (
          <div>
            <h1 style={s.title}>Create your account</h1>
            <p style={s.sub}>Free forever. No credit card.</p>
            <Field label="Full Name"><input style={s.input} type="text" placeholder="Alex Johnson" value={form.name} onChange={e=>set('name',e.target.value)} autoFocus/></Field>
            <Field label="Email"><input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></Field>
            <Field label="Password"><input style={s.input} type="password" placeholder="Min. 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}/></Field>
            <Field label="Confirm Password">
              <input style={{...s.input, borderColor: form.confirm && form.confirm!==form.password?'var(--red)':'var(--border2)'}}
                type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>set('confirm',e.target.value)}/>
            </Field>
            {error && <div style={s.err}>{error}</div>}
            <button style={s.btn} onClick={() => {
              if (!form.name.trim()) { setError('Enter your name'); return }
              if (!form.email.includes('@')) { setError('Enter a valid email'); return }
              if (form.password.length < 8) { setError('Password must be 8+ characters'); return }
              if (form.password !== form.confirm) { setError('Passwords do not match'); return }
              setError(''); setStep(1)
            }}>Continue →</button>
            <div style={s.loginRow}>Already have an account? <Link href="/login" style={{color:'var(--accent)',fontWeight:600}}>Sign In</Link></div>
          </div>
        )}

        {/* STEP 1: Body Stats */}
        {step === 1 && (
          <div>
            <h1 style={s.title}>Your body stats</h1>
            <p style={s.sub}>Used to calculate your TDEE and personalized targets</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="Age (years)"><input style={s.input} type="number" value={form.age} onChange={e=>set('age',e.target.value)}/></Field>
              <Field label="Gender">
                <select style={s.select} value={form.gender} onChange={e=>set('gender',e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label="Height (cm)"><input style={s.input} type="number" value={form.height} onChange={e=>set('height',e.target.value)}/></Field>
              <Field label="Weight (kg)"><input style={s.input} type="number" value={form.weight} onChange={e=>set('weight',e.target.value)}/></Field>
            </div>
            <Field label="Goal Weight (kg)"><input style={s.input} type="number" value={form.goalWeight} onChange={e=>set('goalWeight',e.target.value)}/></Field>
            <div style={s.btnRow}>
              <button style={s.backBtn} onClick={()=>setStep(0)}>← Back</button>
              <button style={s.btn} onClick={()=>setStep(2)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Goal */}
        {step === 2 && (
          <div>
            <h1 style={s.title}>What&apos;s your goal?</h1>
            <p style={s.sub}>We&apos;ll personalize your experience around this</p>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {GOALS.map(g => (
                <div key={g.id} onClick={()=>set('goal',g.id)} style={{...s.optRow, ...(form.goal===g.id?s.optActive:{})}}>
                  <span style={{fontSize:22}}>{g.icon}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{g.label}</div>
                    <div style={{fontSize:12,color:'var(--text2)'}}>{g.desc}</div>
                  </div>
                  <div style={{...s.radio, ...(form.goal===g.id?s.radioActive:{})}}>{form.goal===g.id&&'●'}</div>
                </div>
              ))}
            </div>
            <div style={s.btnRow}>
              <button style={s.backBtn} onClick={()=>setStep(1)}>← Back</button>
              <button style={s.btn} onClick={()=>setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Activity */}
        {step === 3 && (
          <div>
            <h1 style={s.title}>Activity level</h1>
            <p style={s.sub}>How active are you outside of planned workouts?</p>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {ACTIVITY.map(a => (
                <div key={a.id} onClick={()=>set('activity',a.id)} style={{...s.optRow, ...(form.activity===a.id?s.optActive:{})}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{a.label}</div>
                    <div style={{fontSize:12,color:'var(--text2)'}}>{a.desc}</div>
                  </div>
                  <div style={{...s.radio, ...(form.activity===a.id?s.radioActive:{})}}>{form.activity===a.id&&'●'}</div>
                </div>
              ))}
            </div>

            {/* TDEE Preview */}
            <div style={{background:'linear-gradient(135deg,var(--accent-dim),var(--accent2-dim))',border:'1px solid rgba(200,255,87,0.15)',borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase'}}>Your Estimated Targets</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,color:'var(--accent)'}}>{tdee}</div>
                  <div style={{fontSize:10,color:'var(--text2)'}}>Maintenance</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,color:'var(--accent2)'}}>{targetCals}</div>
                  <div style={{fontSize:10,color:'var(--text2)'}}>Target kcal</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,color:'var(--blue)'}}>{targetProtein}g</div>
                  <div style={{fontSize:10,color:'var(--text2)'}}>Protein</div>
                </div>
              </div>
            </div>

            {error && <div style={s.err}>{error}</div>}
            <div style={s.btnRow}>
              <button style={s.backBtn} onClick={()=>setStep(2)}>← Back</button>
              <button style={s.btn} onClick={handleFinish} disabled={loading}>
                {loading ? <Spin/> : 'Build My Plan →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:52,marginBottom:16}}>🎉</div>
            <h2 style={{fontFamily:'var(--font-head)',fontSize:22,fontWeight:700,marginBottom:8}}>You&apos;re all set!</h2>
            <p style={{color:'var(--text2)',fontSize:14}}>Redirecting to your dashboard...</p>
            <div style={{width:32,height:32,border:'2px solid var(--surface3)',borderTop:'2px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'24px auto 0'}}/>
          </div>
        )}
      </div>
    </main>
  )
}

function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <div style={{marginBottom:12}}><label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5}}>{label}</label>{children}</div>
}
function Spin() {
  return <span style={{width:17,height:17,border:'2px solid rgba(0,0,0,0.2)',borderTop:'2px solid #07070F',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/>
}

const s: Record<string,React.CSSProperties> = {
  page:{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'},
  glow1:{position:'absolute',top:'-20%',right:'-10%',width:500,height:500,background:'radial-gradient(circle,rgba(200,255,87,0.05),transparent 70%)',borderRadius:'50%',pointerEvents:'none'},
  glow2:{position:'absolute',bottom:'-20%',left:'-10%',width:400,height:400,background:'radial-gradient(circle,rgba(87,200,255,0.04),transparent 70%)',borderRadius:'50%',pointerEvents:'none'},
  card:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:460,position:'relative',zIndex:1,animation:'fadeUp 0.5s ease both',maxHeight:'92vh',overflowY:'auto'},
  logo:{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,display:'block',marginBottom:20},
  dots:{display:'flex',gap:5,marginBottom:8},
  dot:{width:6,height:6,borderRadius:3,background:'var(--surface4)',transition:'var(--transition)'},
  dotActive:{background:'rgba(200,255,87,0.4)'},
  dotCurrent:{width:20,background:'var(--accent)'},
  title:{fontFamily:'var(--font-head)',fontSize:22,fontWeight:700,marginBottom:5},
  sub:{color:'var(--text2)',fontSize:13,marginBottom:20},
  input:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:10,padding:'10px 13px',color:'var(--text)',fontSize:14},
  select:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:10,padding:'10px 13px',color:'var(--text)',fontSize:14,WebkitAppearance:'none'},
  err:{background:'var(--red-dim)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:9,padding:'9px 13px',fontSize:13,color:'var(--red)',marginBottom:14},
  btn:{flex:1,background:'var(--accent)',color:'#07070F',borderRadius:100,padding:'12px 20px',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,border:'none',cursor:'pointer'},
  backBtn:{background:'transparent',border:'1px solid var(--border2)',borderRadius:100,padding:'12px 20px',fontSize:14,color:'var(--text2)',cursor:'pointer'},
  btnRow:{display:'flex',gap:10,marginTop:4},
  loginRow:{textAlign:'center',fontSize:13,color:'var(--text2)',marginTop:14},
  optRow:{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:'1px solid var(--border)',borderRadius:12,cursor:'pointer',transition:'var(--transition)'},
  optActive:{background:'var(--accent-dim)',border:'1px solid rgba(200,255,87,0.3)'},
  radio:{width:18,height:18,borderRadius:'50%',border:'1.5px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--accent)',flexShrink:0},
  radioActive:{border:'1.5px solid var(--accent)',background:'var(--accent-dim)'},
}
