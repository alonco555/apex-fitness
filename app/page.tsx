'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard')
      else setChecking(false)
    })
  }, [router])

  if (checking) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:32,height:32,border:'2px solid var(--surface3)',borderTop:'2px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  return (
    <main style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-20%',right:'-5%',width:600,height:600,background:'radial-gradient(circle,rgba(200,255,87,0.06),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-20%',left:'-5%',width:500,height:500,background:'radial-gradient(circle,rgba(87,200,255,0.05),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.02,pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>

      <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:580,animation:'fadeUp 0.6s ease both'}}>
        <div style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-1px',marginBottom:44}}>
          apex<span style={{color:'var(--accent)'}}>.</span>
        </div>

        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--accent-dim)',border:'1px solid rgba(200,255,87,0.2)',borderRadius:100,padding:'6px 16px',fontSize:12,fontWeight:600,color:'var(--accent)',marginBottom:28}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block',animation:'pulse 2s infinite'}}/>
          Free to use · No credit card required
        </div>

        <h1 style={{fontFamily:'var(--font-head)',fontSize:'clamp(42px,7vw,80px)',fontWeight:800,letterSpacing:'-3px',lineHeight:0.92,marginBottom:24}}>
          Your elite<br/>
          <span style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>fitness OS</span>
        </h1>

        <p style={{color:'var(--text2)',fontSize:17,lineHeight:1.65,marginBottom:44,maxWidth:460,margin:'0 auto 44px'}}>
          Track workouts, nutrition, and body composition. Built for athletes who take training seriously.
        </p>

        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:56}}>
          <Link href="/signup" style={{background:'var(--accent)',color:'#07070F',padding:'15px 36px',borderRadius:100,fontWeight:700,fontSize:15,display:'inline-flex',alignItems:'center',gap:8}}>
            Get Started Free →
          </Link>
          <Link href="/login" style={{background:'transparent',color:'var(--text)',padding:'15px 36px',borderRadius:100,fontWeight:600,fontSize:15,border:'1px solid var(--border2)'}}>
            Sign In
          </Link>
        </div>

        <div style={{display:'flex',gap:32,justifyContent:'center',flexWrap:'wrap'}}>
          {['🏋️ Workouts','🍽️ Nutrition','📈 Progress','📅 Programs','🔥 Streaks'].map(f => (
            <div key={f} style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{f}</div>
          ))}
        </div>
      </div>
    </main>
  )
}
