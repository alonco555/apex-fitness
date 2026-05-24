'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'

interface Session {
  id: string
  name: string
  date: string
  duration: string
  volume: number
  sets: number
  type: 'gym' | 'cardio'
}

const TEMPLATES = [
  { id:'push', name:'Push Day', muscles:'Chest · Shoulders · Triceps',
    exercises:[
      {name:'Bench Press',sets:4,reps:'5',weight:100,muscle:'Chest'},
      {name:'Incline DB Press',sets:3,reps:'10',weight:32,muscle:'Upper Chest'},
      {name:'Overhead Press',sets:3,reps:'8',weight:60,muscle:'Shoulders'},
      {name:'Lateral Raises',sets:4,reps:'15',weight:12,muscle:'Shoulders'},
      {name:'Tricep Pushdown',sets:3,reps:'12',weight:30,muscle:'Triceps'},
    ]},
  { id:'pull', name:'Pull Day', muscles:'Back · Biceps · Rear Delts',
    exercises:[
      {name:'Pull-Ups',sets:4,reps:'6',weight:0,muscle:'Back'},
      {name:'Barbell Row',sets:4,reps:'8',weight:80,muscle:'Back'},
      {name:'Lat Pulldown',sets:3,reps:'10',weight:60,muscle:'Back'},
      {name:'Face Pulls',sets:3,reps:'15',weight:20,muscle:'Rear Delts'},
      {name:'Barbell Curl',sets:3,reps:'10',weight:40,muscle:'Biceps'},
    ]},
  { id:'legs', name:'Leg Day', muscles:'Quads · Hamstrings · Glutes',
    exercises:[
      {name:'Barbell Squat',sets:4,reps:'5',weight:120,muscle:'Quads'},
      {name:'Romanian Deadlift',sets:3,reps:'10',weight:90,muscle:'Hamstrings'},
      {name:'Leg Press',sets:3,reps:'12',weight:180,muscle:'Quads'},
      {name:'Leg Curl',sets:3,reps:'12',weight:50,muscle:'Hamstrings'},
      {name:'Calf Raises',sets:4,reps:'15',weight:60,muscle:'Calves'},
    ]},
  { id:'upper', name:'Upper Body', muscles:'Full Upper Body',
    exercises:[
      {name:'Bench Press',sets:4,reps:'8',weight:90,muscle:'Chest'},
      {name:'Barbell Row',sets:4,reps:'8',weight:75,muscle:'Back'},
      {name:'Overhead Press',sets:3,reps:'8',weight:55,muscle:'Shoulders'},
      {name:'Pull-Ups',sets:3,reps:'8',weight:0,muscle:'Back'},
      {name:'Dumbbell Curl',sets:3,reps:'12',weight:16,muscle:'Biceps'},
    ]},
  { id:'full', name:'Full Body', muscles:'All Major Groups',
    exercises:[
      {name:'Deadlift',sets:3,reps:'5',weight:140,muscle:'Full Body'},
      {name:'Bench Press',sets:3,reps:'8',weight:85,muscle:'Chest'},
      {name:'Barbell Row',sets:3,reps:'8',weight:70,muscle:'Back'},
      {name:'Overhead Press',sets:3,reps:'10',weight:50,muscle:'Shoulders'},
      {name:'Barbell Squat',sets:3,reps:'10',weight:100,muscle:'Legs'},
    ]},
  { id:'arms', name:'Arms Day', muscles:'Biceps · Triceps · Forearms',
    exercises:[
      {name:'Barbell Curl',sets:4,reps:'10',weight:45,muscle:'Biceps'},
      {name:'Skull Crushers',sets:4,reps:'10',weight:40,muscle:'Triceps'},
      {name:'Hammer Curl',sets:3,reps:'12',weight:18,muscle:'Biceps'},
      {name:'Tricep Dips',sets:3,reps:'12',weight:0,muscle:'Triceps'},
      {name:'Reverse Curl',sets:3,reps:'12',weight:25,muscle:'Forearms'},
    ]},
]

const CARDIO = [
  // Running
  { id:'easy_run',      name:'Easy Run',          category:'Running' },
  { id:'recovery_run',  name:'Recovery Run',       category:'Running' },
  { id:'tempo_run',     name:'Tempo Run',          category:'Running' },
  { id:'long_run',      name:'Long Run',           category:'Running' },
  { id:'intervals',     name:'Interval Training',  category:'Running' },
  { id:'track',         name:'Track Session',      category:'Running' },
  { id:'fartlek',       name:'Fartlek',            category:'Running' },
  { id:'hill_reps',     name:'Hill Repeats',       category:'Running' },
  { id:'5k',            name:'5K Time Trial',      category:'Running' },
  { id:'10k',           name:'10K Run',            category:'Running' },
  { id:'half_marathon', name:'Half Marathon Pace', category:'Running' },
  { id:'progression',   name:'Progression Run',    category:'Running' },
  // Cardio
  { id:'cycling',       name:'Cycling',            category:'Cardio' },
  { id:'swimming',      name:'Swimming',           category:'Cardio' },
  { id:'rowing',        name:'Rowing',             category:'Cardio' },
  { id:'hiit',          name:'HIIT',               category:'Cardio' },
  { id:'jump_rope',     name:'Jump Rope',          category:'Cardio' },
  { id:'elliptical',    name:'Elliptical',         category:'Cardio' },
  { id:'stair_climber', name:'Stair Climber',      category:'Cardio' },
  // Sport
  { id:'football',      name:'Football',           category:'Sport' },
  { id:'basketball',    name:'Basketball',         category:'Sport' },
  { id:'tennis',        name:'Tennis',             category:'Sport' },
  { id:'volleyball',    name:'Volleyball',         category:'Sport' },
  { id:'boxing',        name:'Boxing',             category:'Sport' },
  { id:'martial_arts',  name:'Martial Arts',       category:'Sport' },
  { id:'other',         name:'Other',              category:'Sport' },
]

const CARDIO_CATEGORIES = ['Running', 'Cardio', 'Sport'] as const

export default function Workouts() {
  const { loading, profile } = useAuth()
  const [tab, setTab]           = useState<'log'|'cardio'|'history'>('log')
  const [selected, setSelected] = useState<typeof TEMPLATES[0]|null>(null)
  const [cardioCategory, setCardioCategory] = useState<typeof CARDIO_CATEGORIES[number]>('Running')
  const [cardioType, setCardioType]   = useState<typeof CARDIO[0]|null>(null)
  const [cardioForm, setCardioForm]   = useState({duration:'',distance:'',calories:'',notes:''})
  const [loggedSets, setLoggedSets]   = useState<Record<string,{reps:string,weight:string,done:boolean}[]>>({})
  const [history, setHistory]         = useState<Session[]>([])
  const startTimeRef                  = useRef<number>(0)

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('apex_workouts') || '[]')) } catch {}
  }, [])

  if (loading) return <Loader />

  const initSets = (t: typeof TEMPLATES[0]) => {
    const sets: Record<string,{reps:string,weight:string,done:boolean}[]> = {}
    t.exercises.forEach(ex => {
      sets[ex.name] = Array.from({length:ex.sets},()=>({reps:ex.reps,weight:String(ex.weight),done:false}))
    })
    setLoggedSets(sets)
    setSelected(t)
    startTimeRef.current = Date.now()
  }

  const saveSession = (session: Session) => {
    const updated = [session, ...history]
    setHistory(updated)
    localStorage.setItem('apex_workouts', JSON.stringify(updated))
  }

  const finishWorkout = () => {
    if (!selected) return
    const durationMin = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000))
    const userWeight  = profile?.weight || 80
    const calories    = Math.round(4 * userWeight * (durationMin / 60)) // MET 4 for weight training
    saveSession({
      id:       Date.now().toString(),
      name:     selected.name,
      date:     new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      duration: `${durationMin} min`,
      volume:   Math.round(totalVol),
      sets:     doneSets,
      type:     'gym',
    })
    setSelected(null); setLoggedSets({}); setTab('history')
  }

  const finishCardio = () => {
    if (!cardioType) return
    const durationMin = (() => {
      const [m, s] = cardioForm.duration.split(':').map(Number)
      return isNaN(m) ? 0 : m + (s || 0) / 60
    })()
    saveSession({
      id:       Date.now().toString(),
      name:     cardioType.name,
      date:     new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      duration: cardioForm.duration || '—',
      volume:   0,
      sets:     0,
      type:     'cardio',
    })
    setCardioType(null); setCardioForm({duration:'',distance:'',calories:'',notes:''}); setTab('history')
  }

  const toggleSet = (exName:string, idx:number) => {
    setLoggedSets(prev => ({...prev,[exName]:prev[exName].map((s,i)=>i===idx?{...s,done:!s.done}:s)}))
  }

  const totalVol = selected
    ? Object.entries(loggedSets).reduce((acc,[,sets])=>acc+sets.filter(s=>s.done).reduce((a,s)=>a+(+s.weight*+s.reps||0),0),0)
    : 0
  const doneSets = selected ? Object.values(loggedSets).flat().filter(s=>s.done).length : 0

  const filteredCardio = CARDIO.filter(c=>c.category===cardioCategory)

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Workouts</h1>
            <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Log gym sessions and cardio</p>
          </div>
          {selected && (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{fontSize:13,color:'var(--accent)',fontWeight:600,background:'var(--accent-dim)',border:'1px solid rgba(200,255,87,0.2)',borderRadius:8,padding:'6px 14px'}}>
                {selected.name} · {doneSets} sets · {Math.round(totalVol)} kg
              </div>
              <button onClick={finishWorkout}
                style={{background:'var(--green)',color:'#07070F',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                Finish
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'var(--surface)',borderRadius:10,padding:3,gap:2,marginBottom:24,width:'fit-content'}}>
          {(['log','cardio','history'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 20px',borderRadius:7,fontSize:13,fontWeight:600,border:'none',background:tab===t?'var(--surface3)':'transparent',color:tab===t?'var(--text)':'var(--text2)',cursor:'pointer',textTransform:'capitalize'}}>
              {t==='log'?'Gym':t==='cardio'?'Cardio':'History'}
            </button>
          ))}
        </div>

        {/* GYM TEMPLATES */}
        {tab==='log' && !selected && (
          <div>
            <div style={sectionLabel}>Choose a Template</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>initSets(t)} style={{...card,cursor:'pointer'}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,marginBottom:4}}>{t.name}</div>
                  <div style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>{t.muscles}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginBottom:14}}>{t.exercises.length} exercises</div>
                  <div style={{background:'var(--accent)',color:'#07070F',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,textAlign:'center'}}>Start →</div>
                </div>
              ))}
              <div style={{...card,cursor:'pointer',border:'1px dashed var(--border2)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,minHeight:140}}>
                <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700}}>Custom Workout</div>
                <div style={{fontSize:12,color:'var(--text2)'}}>Build your own</div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE WORKOUT */}
        {tab==='log' && selected && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <button onClick={()=>{setSelected(null);setLoggedSets({})}}
                style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 14px',fontSize:13,color:'var(--text2)',cursor:'pointer'}}>
                ← Back
              </button>
              <div style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>{selected.name}</div>
            </div>
            {selected.exercises.map(ex=>(
              <div key={ex.name} style={{...card,marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>{ex.name}</div>
                    <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{ex.muscle}</div>
                  </div>
                  <div style={{fontSize:11,background:'var(--surface3)',padding:'3px 10px',borderRadius:6,color:'var(--text2)'}}>{ex.sets} sets · {ex.reps} reps</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'32px 1fr 80px 80px 40px',gap:8,marginBottom:6}}>
                  {['Set','Previous','kg','Reps',''].map(h=>(
                    <div key={h} style={{fontSize:11,color:'var(--text3)',fontWeight:600,textAlign:'center'}}>{h}</div>
                  ))}
                </div>
                {(loggedSets[ex.name]||[]).map((s,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'32px 1fr 80px 80px 40px',gap:8,marginBottom:6,alignItems:'center'}}>
                    <div style={{width:24,height:24,borderRadius:6,background:s.done?'var(--accent-dim)':'var(--surface3)',border:s.done?'1px solid rgba(200,255,87,0.3)':'none',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:s.done?'var(--accent)':'var(--text2)',margin:'0 auto'}}>{i+1}</div>
                    <div style={{fontSize:11,color:'var(--text3)',textAlign:'center'}}>{ex.weight>0?`${ex.weight}×${ex.reps}`:'BW'}</div>
                    <input value={s.weight} onChange={e=>setLoggedSets(p=>({...p,[ex.name]:p[ex.name].map((ss,ii)=>ii===i?{...ss,weight:e.target.value}:ss)}))}
                      style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,padding:'6px',color:'var(--text)',fontSize:13,textAlign:'center',width:'100%'}} type="number"/>
                    <input value={s.reps} onChange={e=>setLoggedSets(p=>({...p,[ex.name]:p[ex.name].map((ss,ii)=>ii===i?{...ss,reps:e.target.value}:ss)}))}
                      style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,padding:'6px',color:'var(--text)',fontSize:13,textAlign:'center',width:'100%'}} type="number"/>
                    <div onClick={()=>toggleSet(ex.name,i)} style={{width:28,height:28,borderRadius:7,background:s.done?'var(--accent)':'var(--surface3)',border:s.done?'none':'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13,color:s.done?'#07070F':'var(--text3)',margin:'0 auto'}}>
                      {s.done?'✓':'○'}
                    </div>
                  </div>
                ))}
                <button onClick={()=>setLoggedSets(p=>({...p,[ex.name]:[...p[ex.name],{reps:ex.reps,weight:String(ex.weight),done:false}]}))}
                  style={{width:'100%',marginTop:6,background:'transparent',border:'1px solid var(--border)',borderRadius:8,padding:'7px',fontSize:12,color:'var(--text2)',cursor:'pointer'}}>
                  + Add Set
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CARDIO */}
        {tab==='cardio' && !cardioType && (
          <div>
            <div style={{display:'flex',gap:6,marginBottom:16}}>
              {CARDIO_CATEGORIES.map(cat=>(
                <button key={cat} onClick={()=>setCardioCategory(cat)} style={{padding:'6px 16px',borderRadius:8,fontSize:12,fontWeight:600,border:`1px solid ${cardioCategory===cat?'var(--border2)':'var(--border)'}`,background:cardioCategory===cat?'var(--surface3)':'transparent',color:cardioCategory===cat?'var(--text)':'var(--text3)',cursor:'pointer'}}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {filteredCardio.map(c=>(
                <div key={c.id} onClick={()=>setCardioType(c)} style={{...card,cursor:'pointer',padding:'16px 18px'}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700,marginBottom:4}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--text3)',textTransform:'capitalize'}}>{c.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='cardio' && cardioType && (
          <div style={{maxWidth:500}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <button onClick={()=>setCardioType(null)} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 14px',fontSize:13,color:'var(--text2)',cursor:'pointer'}}>← Back</button>
              <div style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>{cardioType.name}</div>
            </div>
            <div style={card}>
              {[
                {label:'Duration',key:'duration',placeholder:'32:15  (mm:ss)'},
                {label:'Distance (km)',key:'distance',placeholder:'5.2'},
                {label:'Calories burned',key:'calories',placeholder:'310'},
                {label:'Notes',key:'notes',placeholder:'How did it feel?'},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5,letterSpacing:'0.03em'}}>{f.label}</label>
                  <input value={cardioForm[f.key as keyof typeof cardioForm]} onChange={e=>setCardioForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:9,padding:'11px 13px',color:'var(--text)',fontSize:14}}
                    placeholder={f.placeholder}/>
                </div>
              ))}
              <button onClick={finishCardio}
                style={{width:'100%',background:'var(--accent)',color:'#07070F',border:'none',borderRadius:8,padding:'13px',fontWeight:700,fontSize:14,cursor:'pointer'}}>
                Log {cardioType.name}
              </button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab==='history' && (
          <div>
            {history.length === 0 ? (
              <div style={{textAlign:'center',padding:'72px 0'}}>
                <div style={{fontSize:13,color:'var(--text3)',marginBottom:6}}>No sessions logged yet.</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>Complete a workout to see it here.</div>
              </div>
            ) : history.map(h => (
              <div key={h.id} style={{...card,marginBottom:10,display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--surface3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--text3)',flexShrink:0}}>
                  {h.type==='gym'?'GYM':'RUN'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{h.name}</div>
                  <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>{h.date} · {h.duration}</div>
                </div>
                <div style={{display:'flex',gap:16,textAlign:'right',flexShrink:0}}>
                  {h.sets > 0 && (
                    <div>
                      <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700,color:'var(--accent)'}}>{h.sets}</div>
                      <div style={{fontSize:10,color:'var(--text3)'}}>sets</div>
                    </div>
                  )}
                  {h.volume > 0 && (
                    <div>
                      <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700,color:'var(--green)'}}>{h.volume.toLocaleString()} kg</div>
                      <div style={{fontSize:10,color:'var(--text3)'}}>volume</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  )
}

const card: React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}
const sectionLabel: React.CSSProperties = {fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--text3)',marginBottom:14}
