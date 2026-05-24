'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError('Incorrect email or password'); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main style={p.page}>
      <div style={p.glow1}/><div style={p.glow2}/>
      <div style={p.card}>
        <Link href="/" style={p.logo}>apex<span style={{color:'var(--accent)'}}>.</span></Link>
        <h1 style={p.title}>Welcome back</h1>
        <p style={p.sub}>Sign in to continue your journey</p>
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <input style={p.input} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoFocus autoComplete="email"/>
          </Field>
          <Field label="Password">
            <input style={p.input} type="password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
          </Field>
          {error && <div style={p.err}>{error}</div>}
          <button type="submit" style={p.btn} disabled={loading}>
            {loading ? <Spin/> : 'Sign In →'}
          </button>
          <div style={p.or}>Don&apos;t have an account?</div>
          <Link href="/signup" style={p.alt}>Create free account</Link>
        </form>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:5}}>{label}</label>{children}</div>
}
function Spin() {
  return <span style={{width:17,height:17,border:'2px solid rgba(0,0,0,0.2)',borderTop:'2px solid #07070F',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/>
}

const p: Record<string,React.CSSProperties> = {
  page:{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'},
  glow1:{position:'absolute',top:'-20%',right:'-10%',width:500,height:500,background:'radial-gradient(circle,rgba(200,255,87,0.05),transparent 70%)',borderRadius:'50%',pointerEvents:'none'},
  glow2:{position:'absolute',bottom:'-20%',left:'-10%',width:400,height:400,background:'radial-gradient(circle,rgba(87,200,255,0.04),transparent 70%)',borderRadius:'50%',pointerEvents:'none'},
  card:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,padding:'40px 34px',width:'100%',maxWidth:400,position:'relative',zIndex:1,animation:'fadeUp 0.5s ease both'},
  logo:{fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,display:'block',marginBottom:28},
  title:{fontFamily:'var(--font-head)',fontSize:24,fontWeight:700,marginBottom:5},
  sub:{color:'var(--text2)',fontSize:14,marginBottom:26},
  input:{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:10,padding:'11px 13px',color:'var(--text)',fontSize:14},
  err:{background:'var(--red-dim)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:9,padding:'10px 13px',fontSize:13,color:'var(--red)',marginBottom:14},
  btn:{width:'100%',background:'var(--accent)',color:'#07070F',borderRadius:100,padding:'13px',fontWeight:700,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4,border:'none'},
  alt:{display:'block',textAlign:'center',padding:'11px',border:'1px solid var(--border2)',borderRadius:100,fontSize:13,color:'var(--text2)',marginTop:8},
  or:{textAlign:'center',fontSize:13,color:'var(--text3)',margin:'14px 0 0'},
}
