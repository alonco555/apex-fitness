'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

interface WorkoutOption {
  id: string
  label: string
  category: 'Gym' | 'Running' | 'Cardio' | 'Sport' | 'Recovery'
}

const WORKOUT_OPTIONS: WorkoutOption[] = [
  // Gym
  { id:'push',      label:'Push Day',       category:'Gym' },
  { id:'pull',      label:'Pull Day',       category:'Gym' },
  { id:'legs',      label:'Leg Day',        category:'Gym' },
  { id:'upper',     label:'Upper Body',     category:'Gym' },
  { id:'lower',     label:'Lower Body',     category:'Gym' },
  { id:'full',      label:'Full Body',      category:'Gym' },
  { id:'chest',     label:'Chest',          category:'Gym' },
  { id:'back',      label:'Back',           category:'Gym' },
  { id:'shoulders', label:'Shoulders',      category:'Gym' },
  { id:'arms',      label:'Arms',           category:'Gym' },
  { id:'deadlift',  label:'Deadlift Day',   category:'Gym' },
  // Running
  { id:'easy_run',      label:'Easy Run',          category:'Running' },
  { id:'recovery_run',  label:'Recovery Run',       category:'Running' },
  { id:'tempo_run',     label:'Tempo Run',          category:'Running' },
  { id:'long_run',      label:'Long Run',           category:'Running' },
  { id:'intervals',     label:'Intervals',          category:'Running' },
  { id:'track',         label:'Track Session',      category:'Running' },
  { id:'fartlek',       label:'Fartlek',            category:'Running' },
  { id:'hill_reps',     label:'Hill Repeats',       category:'Running' },
  { id:'progression',   label:'Progression Run',    category:'Running' },
  { id:'5k',            label:'5K Time Trial',      category:'Running' },
  { id:'10k',           label:'10K Run',            category:'Running' },
  { id:'half_marathon', label:'Half Marathon Pace', category:'Running' },
  // Cardio
  { id:'cycling',       label:'Cycling',            category:'Cardio' },
  { id:'swimming',      label:'Swimming',           category:'Cardio' },
  { id:'rowing',        label:'Rowing',             category:'Cardio' },
  { id:'hiit',          label:'HIIT',               category:'Cardio' },
  { id:'jump_rope',     label:'Jump Rope',          category:'Cardio' },
  { id:'elliptical',    label:'Elliptical',         category:'Cardio' },
  { id:'stair_climber', label:'Stair Climber',      category:'Cardio' },
  // Sport
  { id:'football',      label:'Football',           category:'Sport' },
  { id:'basketball',    label:'Basketball',         category:'Sport' },
  { id:'tennis',        label:'Tennis',             category:'Sport' },
  { id:'volleyball',    label:'Volleyball',         category:'Sport' },
  { id:'boxing',        label:'Boxing',             category:'Sport' },
  { id:'martial_arts',  label:'Martial Arts',       category:'Sport' },
  { id:'other_sport',   label:'Other Sport',        category:'Sport' },
  // Recovery
  { id:'rest',          label:'Rest',               category:'Recovery' },
  { id:'active',        label:'Active Recovery',    category:'Recovery' },
  { id:'mobility',      label:'Mobility',           category:'Recovery' },
  { id:'yoga',          label:'Yoga',               category:'Recovery' },
  { id:'foam_roll',     label:'Foam Rolling',       category:'Recovery' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Gym:      'var(--accent)',
  Running:  'var(--green)',
  Cardio:   'var(--accent2)',
  Sport:    'var(--accent3)',
  Recovery: 'var(--text3)',
}

type WeekPlan = Record<string, WorkoutOption[]>

const EMPTY_PLAN: WeekPlan = {
  Monday:[], Tuesday:[], Wednesday:[], Thursday:[],
  Friday:[], Saturday:[], Sunday:[],
}

const PROGRAMS: { name:string; desc:string; tags:string[]; plan:WeekPlan }[] = [
  {
    name:'Push / Pull / Legs',
    desc:'Classic 6-day strength split for hypertrophy.',
    tags:['Hypertrophy','Strength','6 days/week'],
    plan:{
      Monday:   [{id:'push',    label:'Push Day', category:'Gym'}],
      Tuesday:  [{id:'pull',    label:'Pull Day', category:'Gym'}],
      Wednesday:[{id:'legs',    label:'Leg Day',  category:'Gym'}],
      Thursday: [{id:'push',    label:'Push Day', category:'Gym'}],
      Friday:   [{id:'pull',    label:'Pull Day', category:'Gym'}],
      Saturday: [{id:'legs',    label:'Leg Day',  category:'Gym'}],
      Sunday:   [{id:'rest',    label:'Rest',     category:'Recovery'}],
    },
  },
  {
    name:'Upper / Lower',
    desc:'4-day split, great for beginners and intermediates.',
    tags:['Strength','Beginner','4 days/week'],
    plan:{
      Monday:   [{id:'upper',  label:'Upper Body',     category:'Gym'}],
      Tuesday:  [{id:'lower',  label:'Lower Body',     category:'Gym'}],
      Wednesday:[{id:'rest',   label:'Rest',           category:'Recovery'}],
      Thursday: [{id:'upper',  label:'Upper Body',     category:'Gym'}],
      Friday:   [{id:'lower',  label:'Lower Body',     category:'Gym'}],
      Saturday: [{id:'active', label:'Active Recovery',category:'Recovery'}],
      Sunday:   [{id:'rest',   label:'Rest',           category:'Recovery'}],
    },
  },
  {
    name:'Hybrid — Lift + Run',
    desc:'Combines strength training with structured running.',
    tags:['Hybrid','Strength','Running','5 days/week'],
    plan:{
      Monday:   [{id:'push',      label:'Push Day',    category:'Gym'},    {id:'easy_run',  label:'Easy Run',   category:'Running'}],
      Tuesday:  [{id:'tempo_run', label:'Tempo Run',   category:'Running'}],
      Wednesday:[{id:'pull',      label:'Pull Day',    category:'Gym'}],
      Thursday: [{id:'intervals', label:'Intervals',   category:'Running'}],
      Friday:   [{id:'legs',      label:'Leg Day',     category:'Gym'}],
      Saturday: [{id:'long_run',  label:'Long Run',    category:'Running'}],
      Sunday:   [{id:'rest',      label:'Rest',        category:'Recovery'}],
    },
  },
  {
    name:'Marathon Prep',
    desc:'Running-focused 5-day schedule with structured variety.',
    tags:['Endurance','Running','5 days/week'],
    plan:{
      Monday:   [{id:'easy_run',     label:'Easy Run',      category:'Running'}],
      Tuesday:  [{id:'intervals',    label:'Intervals',     category:'Running'}],
      Wednesday:[{id:'recovery_run', label:'Recovery Run',  category:'Running'}],
      Thursday: [{id:'tempo_run',    label:'Tempo Run',     category:'Running'}],
      Friday:   [{id:'rest',         label:'Rest',          category:'Recovery'}],
      Saturday: [{id:'long_run',     label:'Long Run',      category:'Running'}],
      Sunday:   [{id:'active',       label:'Active Recovery',category:'Recovery'}],
    },
  },
]

const CATEGORIES = ['Gym','Running','Cardio','Sport','Recovery'] as const

export default function Programs() {
  const { loading } = useAuth()
  const [plan, setPlan]               = useState<WeekPlan>(EMPTY_PLAN)
  const [addingTo, setAddingTo]       = useState<string|null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Gym')
  const [tab, setTab]                 = useState<'my'|'explore'>('my')

  if (loading) return <Loader />

  const addWorkout = (day: string, wo: WorkoutOption) => {
    setPlan(p=>({...p,[day]:[...(p[day]||[]),wo]}))
  }

  const removeWorkout = (day: string, idx: number) => {
    setPlan(p=>({...p,[day]:p[day].filter((_,i)=>i!==idx)}))
  }

  const applyTemplate = (templatePlan: WeekPlan) => {
    setPlan(templatePlan)
    setTab('my')
  }

  const totalSlots = Object.values(plan).flat().length
  const trainDays  = Object.values(plan).filter(d=>d.some(w=>w.category!=='Recovery')).length

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Programs</h1>
            <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Build your weekly training schedule</p>
          </div>
          <button style={{background:'var(--accent)',color:'#07070F',border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Save Program
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'var(--surface)',borderRadius:10,padding:3,gap:2,marginBottom:24,width:'fit-content'}}>
          {(['my','explore'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 20px',borderRadius:7,fontSize:13,fontWeight:600,border:'none',background:tab===t?'var(--surface3)':'transparent',color:tab===t?'var(--text)':'var(--text2)',cursor:'pointer'}}>
              {t==='my'?'My Program':'Explore Templates'}
            </button>
          ))}
        </div>

        {tab==='my' && (
          <div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
              {[
                {l:'Training Days',   v:String(trainDays)},
                {l:'Total Sessions',  v:String(totalSlots)},
                {l:'Rest Days',       v:String(7-trainDays)},
              ].map(s=>(
                <div key={s.l} style={card}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:22,fontWeight:800,color:'var(--accent)'}}>{s.v}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:4,letterSpacing:'0.04em'}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* 7-day grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8,marginBottom:20}}>
              {DAYS.map(day=>{
                const slots  = plan[day]||[]
                const isOpen = addingTo===day
                return (
                  <div key={day} style={{position:'relative'}}>
                    <div style={{...card,minHeight:148,display:'flex',flexDirection:'column',gap:5,padding:'12px 10px'}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:'var(--text3)',textTransform:'uppercase',marginBottom:4}}>
                        {day.slice(0,3)}
                      </div>

                      {slots.length===0 && (
                        <div style={{fontSize:11,color:'var(--text3)',flex:1,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',lineHeight:1.4}}>
                          Rest
                        </div>
                      )}

                      {slots.map((wo,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:`${CATEGORY_COLORS[wo.category]}12`,border:`1px solid ${CATEGORY_COLORS[wo.category]}28`,borderRadius:6,padding:'5px 7px',gap:3}}>
                          <span style={{fontSize:10,fontWeight:600,color:CATEGORY_COLORS[wo.category],flex:1,lineHeight:1.3}}>{wo.label}</span>
                          <button onClick={()=>removeWorkout(day,i)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:12,lineHeight:1,padding:'0 1px',flexShrink:0}}>×</button>
                        </div>
                      ))}

                      <button
                        onClick={()=>{setAddingTo(isOpen?null:day); setActiveCategory('Gym')}}
                        style={{width:'100%',background:'transparent',border:'1px solid var(--border)',borderRadius:6,padding:'5px',fontSize:10,color:'var(--text3)',cursor:'pointer',marginTop:'auto',letterSpacing:'0.03em'}}>
                        + Add
                      </button>
                    </div>

                    {/* Picker */}
                    {isOpen && (
                      <div style={{position:'absolute',top:'calc(100% + 6px)',left:day==='Sunday'?'auto':0,right:day==='Sunday'?0:'auto',background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:12,padding:12,zIndex:300,width:210,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                        {/* Category filter */}
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                          {CATEGORIES.map(cat=>(
                            <button key={cat} onClick={()=>setActiveCategory(cat)}
                              style={{padding:'3px 8px',borderRadius:4,fontSize:10,fontWeight:600,border:`1px solid ${activeCategory===cat?CATEGORY_COLORS[cat]:'var(--border)'}`,background:activeCategory===cat?`${CATEGORY_COLORS[cat]}15`:'transparent',color:activeCategory===cat?CATEGORY_COLORS[cat]:'var(--text3)',cursor:'pointer'}}>
                              {cat}
                            </button>
                          ))}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:1,maxHeight:220,overflowY:'auto'}}>
                          {WORKOUT_OPTIONS.filter(o=>o.category===activeCategory).map(wo=>(
                            <div key={wo.id}
                              onClick={()=>{addWorkout(day,wo);setAddingTo(null)}}
                              style={{padding:'8px 10px',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:500,color:'var(--text2)'}}>
                              {wo.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:4}}>
              {CATEGORIES.map(cat=>(
                <div key={cat} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--text3)'}}>
                  <div style={{width:8,height:8,borderRadius:2,background:CATEGORY_COLORS[cat]}}/>
                  {cat}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='explore' && (
          <div>
            <div style={sectionLabel}>Program Templates</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {PROGRAMS.map((p,i)=>(
                <div key={i} style={card}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>{p.desc}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:16}}>
                    {p.tags.map(t=>(
                      <span key={t} style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:4,background:'var(--surface3)',color:'var(--text2)',letterSpacing:'0.03em'}}>{t}</span>
                    ))}
                  </div>
                  <button onClick={()=>applyTemplate(p.plan)}
                    style={{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:8,padding:'9px',fontSize:13,fontWeight:600,color:'var(--text)',cursor:'pointer'}}>
                    Use Template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}

const card: React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:18}
const sectionLabel: React.CSSProperties = {fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--text3)',marginBottom:14}
