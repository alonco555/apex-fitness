'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'

const FOODS_DB = [
  {name:'Chicken Breast (grilled)',cal:165,p:31,c:0,f:4,per:'100g'},
  {name:'White Rice (cooked)',cal:130,p:3,c:28,f:0,per:'100g'},
  {name:'Whole Eggs',cal:155,p:13,c:1,f:11,per:'100g'},
  {name:'Greek Yogurt (plain)',cal:89,p:10,c:4,f:5,per:'100g'},
  {name:'Oats (dry)',cal:389,p:17,c:66,f:7,per:'100g'},
  {name:'Salmon (baked)',cal:208,p:28,c:0,f:10,per:'100g'},
  {name:'Sweet Potato',cal:86,p:2,c:20,f:0,per:'100g'},
  {name:'Whey Protein Shake',cal:120,p:25,c:3,f:2,per:'30g scoop'},
  {name:'Avocado',cal:160,p:2,c:9,f:15,per:'100g'},
  {name:'Banana',cal:89,p:1,c:23,f:0,per:'1 medium'},
  {name:'Olive Oil',cal:884,p:0,c:0,f:100,per:'100ml'},
  {name:'Cottage Cheese',cal:98,p:11,c:3,f:4,per:'100g'},
  {name:'Almonds',cal:579,p:21,c:22,f:50,per:'100g'},
  {name:'Broccoli (steamed)',cal:34,p:3,c:7,f:0,per:'100g'},
  {name:'Ground Beef 90%',cal:176,p:26,c:0,f:8,per:'100g'},
]

const MEALS = ['Breakfast','Lunch','Dinner','Snacks'] as const
type Meal = typeof MEALS[number]

interface FoodEntry { name:string; cal:number; p:number; c:number; f:number; qty:number; per:string }
type Log = Record<Meal, FoodEntry[]>

function calcMacros(entries: FoodEntry[]) {
  return entries.reduce((acc,e)=>{
    const m = e.qty/100
    return {cal:acc.cal+e.cal*m, p:acc.p+e.p*m, c:acc.c+e.c*m, f:acc.f+e.f*m}
  },{cal:0,p:0,c:0,f:0})
}

export default function Nutrition() {
  const { loading, profile } = useAuth()
  const [log, setLog]           = useState<Log>({Breakfast:[],Lunch:[],Dinner:[],Snacks:[]})
  const [activeMeal, setActiveMeal] = useState<Meal|null>(null)
  const [search, setSearch]     = useState('')
  const [qty, setQty]           = useState('100')
  const [water, setWater]       = useState(0)

  if (loading) return <Loader />

  const targetCals    = profile?.targetCalories || 2200
  const targetProtein = profile?.targetProtein  || 160
  const targetCarbs   = Math.round((targetCals*0.45)/4)
  const targetFat     = Math.round((targetCals*0.25)/9)

  const allEntries = Object.values(log).flat()
  const totals     = calcMacros(allEntries)
  const remaining  = targetCals - totals.cal
  const pct        = (v:number,t:number) => Math.min(Math.round(v/t*100),100)

  const filtered = FOODS_DB.filter(f=>!search || f.name.toLowerCase().includes(search.toLowerCase()))

  const addFood = (food: typeof FOODS_DB[0]) => {
    if (!activeMeal) return
    setLog(prev=>({...prev,[activeMeal]:[...prev[activeMeal],{...food,qty:+qty||100}]}))
    setSearch(''); setQty('100'); setActiveMeal(null)
  }

  const removeFood = (meal: Meal, idx: number) => {
    setLog(prev=>({...prev,[meal]:prev[meal].filter((_,i)=>i!==idx)}))
  }

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Nutrition</h1>
          <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
        </div>

        {/* Macro overview */}
        <div style={{...card,marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 3fr',gap:24,alignItems:'center'}}>
            <div style={{position:'relative',width:100,height:100,margin:'0 auto'}}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface3)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke={remaining>=0?'var(--accent)':'var(--red)'} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264*(1-Math.min(totals.cal/targetCals,1))}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontFamily:'var(--font-head)',fontSize:17,fontWeight:800,color:remaining>=0?'var(--accent)':'var(--red)'}}>{Math.round(totals.cal)}</div>
                <div style={{fontSize:9,color:'var(--text3)',letterSpacing:'0.05em'}}>EATEN</div>
              </div>
            </div>
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                {[
                  {l:'Target',    v:targetCals,           c:'var(--text)'},
                  {l:'Remaining', v:Math.round(remaining), c:remaining>=0?'var(--green)':'var(--red)'},
                  {l:'Eaten',     v:Math.round(totals.cal),c:'var(--accent)'},
                ].map(s=>(
                  <div key={s.l} style={{textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:'var(--text3)',letterSpacing:'0.04em',marginTop:2}}>KCAL</div>
                    <div style={{fontSize:10,color:'var(--text2)',marginTop:1}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[
                  {n:'Protein',v:totals.p,t:targetProtein,c:'var(--accent2)'},
                  {n:'Carbs',  v:totals.c,t:targetCarbs,  c:'var(--yellow)'},
                  {n:'Fat',    v:totals.f,t:targetFat,    c:'var(--accent3)'},
                ].map(m=>(
                  <div key={m.n}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
                      <span style={{color:m.c,fontWeight:600,letterSpacing:'0.03em'}}>{m.n}</span>
                      <span style={{color:'var(--text3)'}}>{Math.round(m.v)}g / {m.t}g</span>
                    </div>
                    <div style={{height:3,background:'var(--surface3)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct(m.v,m.t)}%`,background:m.c,borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {MEALS.map(meal=>{
            const entries    = log[meal]
            const mealTotals = calcMacros(entries)
            return (
              <div key={meal} style={card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>{meal}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {entries.length>0 && <span style={{fontSize:12,fontWeight:700,color:'var(--accent)'}}>{Math.round(mealTotals.cal)} kcal</span>}
                    <button onClick={()=>setActiveMeal(meal)} style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'4px 10px',fontSize:12,fontWeight:600,color:'var(--text2)',cursor:'pointer'}}>+ Add</button>
                  </div>
                </div>
                {entries.length===0 ? (
                  <div style={{textAlign:'center',padding:'16px 0',fontSize:12,color:'var(--text3)'}}>No foods logged</div>
                ) : (
                  entries.map((e,i)=>{
                    const m = e.qty/100
                    return (
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.name}</div>
                          <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{e.qty}g · P:{Math.round(e.p*m)}g · C:{Math.round(e.c*m)}g · F:{Math.round(e.f*m)}g</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:8}}>
                          <span style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:700}}>{Math.round(e.cal*m)}</span>
                          <button onClick={()=>removeFood(meal,i)} style={{background:'transparent',border:'none',fontSize:14,color:'var(--text3)',cursor:'pointer',lineHeight:1}}>×</button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>

        {/* Water */}
        <div style={{...card,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>Water</div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--accent2)'}}>{(water/1000).toFixed(1)} L / 2.5 L</div>
          </div>
          <div style={{height:4,background:'var(--surface3)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
            <div style={{height:'100%',width:`${Math.min(water/2500*100,100)}%`,background:'var(--accent2)',borderRadius:2}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            {[150,250,330,500].map(ml=>(
              <button key={ml} onClick={()=>setWater(w=>w+ml)}
                style={{flex:1,background:'var(--accent2-dim)',border:'1px solid rgba(87,200,255,0.2)',borderRadius:8,padding:'8px',fontSize:12,fontWeight:600,color:'var(--accent2)',cursor:'pointer'}}>
                +{ml} ml
              </button>
            ))}
          </div>
        </div>

        {/* Food search modal */}
        {activeMeal && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setActiveMeal(null)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth:520,maxHeight:'80vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}>
              <div style={{width:36,height:4,background:'var(--surface3)',borderRadius:2,margin:'0 auto 20px'}}/>
              <div style={{fontFamily:'var(--font-head)',fontSize:17,fontWeight:700,marginBottom:16}}>Add to {activeMeal}</div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search foods..."
                  style={{flex:1,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:9,padding:'11px 13px',color:'var(--text)',fontSize:14}}
                  autoFocus/>
                <input value={qty} onChange={e=>setQty(e.target.value)} placeholder="100"
                  style={{width:70,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:9,padding:'11px 13px',color:'var(--text)',fontSize:14,textAlign:'center'}}
                  type="number"/>
                <div style={{fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center'}}>g</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {filtered.map((f,i)=>(
                  <div key={i} onClick={()=>addFood(f)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,cursor:'pointer'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{f.per} · P:{f.p}g · C:{f.c}g · F:{f.f}g</div>
                    </div>
                    <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,color:'var(--accent)',marginLeft:12}}>{Math.round(f.cal*(+qty||100)/100)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}

const card: React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}
