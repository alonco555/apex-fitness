'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Nav scroll effect
    const nav = document.getElementById('navbar')
    const handleScroll = () => {
      nav?.classList.toggle('scrolled', window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    // Reveal on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    // Count-up animation
    function animateCount(el: Element, target: number) {
      const suffix = target >= 1000000 ? 'M+' : target >= 1000 ? 'k+' : '+'
      const display = target >= 1000000 ? parseFloat((target / 1000000).toFixed(1)) : target >= 1000 ? Math.round(target / 1000) : target
      let current = 0
      const step = display / (1500 / 16)
      const timer = setInterval(() => {
        current += step
        if (current >= display) {
          el.textContent = display + suffix
          clearInterval(timer)
        } else {
          el.textContent = Math.round(current) + suffix
        }
      }, 16)
    }

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const el = e.target as HTMLElement
        if (e.isIntersecting && el.dataset.count) {
          animateCount(el, parseInt(el.dataset.count))
          countObserver.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el))

    // Smooth scroll
    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href')
        if (!href) return
        const target = document.querySelector(href)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
      countObserver.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080810;--bg2:#0E0E18;--bg3:#13131E;
          --surface:#1A1A28;--surface2:#222234;--surface3:#2A2A40;
          --accent:#C8FF57;--accent2:#57C8FF;--accent3:#FF6B57;--accent4:#B457FF;
          --text:#F2F2FA;--text2:#9090B0;--text3:#50506A;
          --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
          --green:#4ADE80;--red:#F87171;--yellow:#FBBF24;
          --r:16px;--r2:12px;--r3:24px;
          --font-head:'Syne',sans-serif;--font:'DM Sans',sans-serif;
          --max:1280px;--gutter:clamp(20px,5vw,80px);
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:16px;line-height:1.6;overflow-x:hidden}
        ::selection{background:rgba(200,255,87,0.3);color:var(--text)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:2px}
        img{display:block;max-width:100%}
        a{color:inherit;text-decoration:none}
        .container{max-width:var(--max);margin:0 auto;padding:0 var(--gutter)}
        .section{padding:clamp(64px,8vw,120px) 0}
        .display{font-family:var(--font-head);font-weight:800;letter-spacing:-2px;line-height:0.95}
        .display-xl{font-size:clamp(52px,8vw,96px)}
        .display-lg{font-size:clamp(40px,5vw,64px)}
        .display-md{font-size:clamp(28px,3.5vw,44px)}
        h1,h2,h3,h4{font-family:var(--font-head)}
        .eyebrow{font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
        .lead{font-size:clamp(17px,1.5vw,20px);color:var(--text2);line-height:1.65;max-width:600px}
        .gradient-text{background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px var(--gutter);display:flex;align-items:center;justify-content:space-between;transition:background 0.3s}
        nav.scrolled{background:rgba(8,8,16,0.85);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
        .nav-logo{font-family:var(--font-head);font-size:22px;font-weight:800;letter-spacing:-0.5px}
        .nav-logo span{color:var(--accent)}
        .nav-links{display:flex;align-items:center;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--text2);transition:color 0.2s}
        .nav-links a:hover{color:var(--text)}
        .nav-cta{display:flex;align-items:center;gap:12px}
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font);font-weight:600;cursor:pointer;transition:all 0.2s;border:none;text-decoration:none;white-space:nowrap}
        .btn-primary{background:var(--accent);color:#080810;padding:12px 24px;border-radius:100px;font-size:14px}
        .btn-primary:hover{background:#d4ff6e;transform:translateY(-1px);box-shadow:0 8px 30px rgba(200,255,87,0.3)}
        .btn-ghost{background:transparent;color:var(--text);padding:12px 24px;border-radius:100px;font-size:14px;border:1px solid var(--border2)}
        .btn-ghost:hover{background:var(--surface)}
        .btn-xl{padding:20px 48px;font-size:17px;border-radius:100px}
        .hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;overflow:hidden}
        .hero-bg{position:absolute;inset:0;pointer-events:none}
        .hero-glow{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.4}
        .hero-glow-1{width:600px;height:600px;background:radial-gradient(circle,rgba(200,255,87,0.25),transparent);top:-100px;right:-100px}
        .hero-glow-2{width:500px;height:500px;background:radial-gradient(circle,rgba(87,200,255,0.2),transparent);bottom:0;left:-100px}
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,5vw,80px);align-items:center}
        .hero-left{position:relative;z-index:1}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(200,255,87,0.08);border:1px solid rgba(200,255,87,0.2);border-radius:100px;padding:6px 16px;font-size:13px;font-weight:600;color:var(--accent);margin-bottom:28px}
        .hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);animation:blink 2s ease-in-out infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .hero-title{margin-bottom:24px;font-family:var(--font-head);font-weight:800;letter-spacing:-2px;line-height:0.95;font-size:clamp(52px,8vw,96px)}
        .hero-desc{color:var(--text2);font-size:18px;line-height:1.65;margin-bottom:36px;max-width:520px;animation:fadeIn 1s 0.5s both}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hero-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap;animation:fadeIn 1s 0.7s both}
        .hero-social-proof{margin-top:36px;display:flex;align-items:center;gap:20px;animation:fadeIn 1s 0.9s both}
        .avatar-stack{display:flex}
        .avatar-stack .av{width:32px;height:32px;border-radius:50%;border:2px solid var(--bg);background:linear-gradient(135deg,var(--accent),var(--accent2));margin-right:-8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#080810}
        .av-2{background:linear-gradient(135deg,var(--accent2),var(--accent4))!important}
        .av-3{background:linear-gradient(135deg,var(--accent4),var(--accent3))!important}
        .av-4{background:linear-gradient(135deg,var(--accent3),var(--accent))!important}
        .proof-text{font-size:13px;color:var(--text2)}
        .proof-text strong{color:var(--text)}
        .stars{color:var(--yellow);font-size:14px;display:block;margin-bottom:2px}
        .hero-right{display:flex;justify-content:center;align-items:center;position:relative;animation:fadeIn 1s 0.4s both}
        .phone-frame{width:280px;height:560px;background:var(--surface);border:1.5px solid rgba(255,255,255,0.12);border-radius:44px;overflow:hidden;position:relative;box-shadow:0 40px 120px rgba(0,0,0,0.6);flex-shrink:0}
        .phone-notch{width:100px;height:28px;background:var(--bg);border-radius:0 0 18px 18px;margin:0 auto;position:relative;z-index:2}
        .phone-screen{background:var(--bg);padding:0 12px 12px;height:calc(100% - 28px);overflow:hidden}
        .stats-bar{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:24px 0}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .stat-item{text-align:center;padding:0 16px}
        .stat-num{font-family:var(--font-head);font-size:clamp(28px,3vw,44px);font-weight:800;color:var(--accent);letter-spacing:-1px}
        .stat-label{font-size:13px;color:var(--text2);margin-top:4px}
        .features-header{text-align:center;margin-bottom:clamp(48px,6vw,80px)}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .feature-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);padding:clamp(24px,3vw,36px);transition:border-color 0.3s,transform 0.3s}
        .feature-card:hover{border-color:var(--border2);transform:translateY(-4px)}
        .feature-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:20px}
        .feature-card h3{font-family:var(--font-head);font-size:20px;font-weight:700;margin-bottom:10px}
        .feature-card p{color:var(--text2);font-size:15px;line-height:1.6}
        .feature-tag{display:inline-block;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-top:16px}
        .split-section{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,100px);align-items:center}
        .split-left p{color:var(--text2);font-size:16px;line-height:1.7;margin-bottom:28px}
        .feature-list{display:flex;flex-direction:column;gap:14px}
        .feature-item{display:flex;align-items:flex-start;gap:14px}
        .fi-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .fi-text h4{font-size:14px;font-weight:600;margin-bottom:3px}
        .fi-text p{font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:0}
        .demo-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden}
        .demo-card-header{background:var(--surface2);padding:16px 20px;border-bottom:1px solid var(--border)}
        .demo-card-header h3{font-family:var(--font-head);font-size:16px;font-weight:700}
        .demo-card-header p{font-size:12px;color:var(--text2);margin-top:3px}
        .demo-table{width:100%;border-collapse:collapse}
        .demo-table th{font-size:11px;color:var(--text3);text-align:center;padding:12px 8px 8px;font-weight:500;border-bottom:1px solid var(--border)}
        .demo-table td{text-align:center;padding:10px 8px;font-size:13px;border-bottom:1px solid var(--border)}
        .demo-table tr:last-child td{border-bottom:none}
        .set-badge{width:22px;height:22px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
        .db-section{background:var(--bg2);padding:clamp(64px,8vw,100px) 0}
        .db-table-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
        .db-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:16px}
        .db-card .table-name{font-family:'Courier New',monospace;font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px}
        .db-card .field{font-size:11px;color:var(--text2);padding:2px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between}
        .db-card .field:last-child{border-bottom:none}
        .db-card .field .type{color:var(--text3);font-size:10px;font-family:'Courier New',monospace}
        .testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .testimonial-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);padding:28px}
        .testi-stars{color:var(--yellow);font-size:14px;margin-bottom:14px}
        .testi-quote{font-size:15px;line-height:1.65;color:var(--text2);margin-bottom:20px;font-style:italic}
        .testi-author{display:flex;align-items:center;gap:12px}
        .testi-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:14px;flex-shrink:0}
        .testi-name{font-size:14px;font-weight:600}
        .testi-role{font-size:12px;color:var(--text2)}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:920px;margin:0 auto}
        .pricing-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);padding:clamp(24px,3vw,36px);position:relative}
        .pricing-card.featured{border-color:rgba(200,255,87,0.4);background:linear-gradient(135deg,rgba(200,255,87,0.06),rgba(87,200,255,0.03))}
        .pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:#080810;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;white-space:nowrap}
        .pricing-name{font-family:var(--font-head);font-size:18px;font-weight:700;margin-bottom:8px}
        .pricing-price{margin-bottom:20px}
        .pricing-price .amount{font-family:var(--font-head);font-size:40px;font-weight:800;letter-spacing:-1px}
        .pricing-price .period{font-size:14px;color:var(--text2)}
        .pricing-desc{font-size:14px;color:var(--text2);margin-bottom:24px;line-height:1.5}
        .pricing-features{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .pf-item{display:flex;align-items:center;gap:10px;font-size:14px}
        .pf-icon{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
        .pf-icon.yes{background:rgba(74,222,128,0.15);color:var(--green)}
        .pf-icon.no{background:rgba(255,255,255,0.05);color:var(--text3)}
        .cta-section{text-align:center;padding:clamp(80px,10vw,140px) 0;position:relative;overflow:hidden}
        .cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(200,255,87,0.07),transparent 70%);pointer-events:none}
        .store-badges{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:32px}
        .store-badge{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px 24px;transition:all 0.2s;cursor:pointer}
        .store-badge:hover{border-color:var(--accent);background:rgba(200,255,87,0.05)}
        .sb-text .small{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:1px}
        .sb-text .big{font-size:16px;font-weight:700}
        footer{background:var(--bg2);border-top:1px solid var(--border);padding:clamp(48px,6vw,80px) 0 32px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
        .footer-brand .logo{font-family:var(--font-head);font-size:22px;font-weight:800;margin-bottom:12px}
        .footer-brand .logo span{color:var(--accent)}
        .footer-brand p{font-size:14px;color:var(--text2);line-height:1.6;max-width:300px}
        .footer-col h4{font-size:13px;font-weight:700;margin-bottom:16px}
        .footer-col a{display:block;font-size:14px;color:var(--text2);margin-bottom:10px;transition:color 0.2s}
        .footer-col a:hover{color:var(--accent)}
        .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:28px;border-top:1px solid var(--border);flex-wrap:wrap;gap:16px}
        .footer-bottom p{font-size:13px;color:var(--text3)}
        .ticker-wrap{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:12px 0;overflow:hidden}
        .ticker{display:flex;animation:scroll-x 20s linear infinite;white-space:nowrap}
        .ticker-item{display:flex;align-items:center;gap:8px;padding:0 32px;font-size:13px;font-weight:600;color:var(--text2)}
        .ticker-dot{width:4px;height:4px;border-radius:50%;background:var(--accent);flex-shrink:0}
        @keyframes scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .reveal{opacity:0;transform:translateY(32px);transition:opacity 0.7s,transform 0.7s}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-delay-1{transition-delay:0.1s}
        .reveal-delay-2{transition-delay:0.2s}
        .reveal-delay-3{transition-delay:0.3s}
        @media(max-width:1024px){
          .hero-grid{grid-template-columns:1fr}
          .hero-right{display:none}
          .features-grid{grid-template-columns:1fr 1fr}
          .split-section{grid-template-columns:1fr}
          .testimonials-grid{grid-template-columns:1fr 1fr}
          .pricing-grid{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          .db-table-cards{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          .nav-links{display:none}
          .features-grid{grid-template-columns:1fr}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .testimonials-grid{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr}
          .db-table-cards{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav id="navbar">
        <div className="nav-logo">apex<span>.</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#app">App</a>
          <a href="#pricing">Pricing</a>
          <a href="#database">Database</a>
          <a href="#testimonials">Reviews</a>
        </div>
        <div className="nav-cta">
          <a href="#" className="btn btn-ghost">Sign In</a>
          <a href="#pricing" className="btn btn-primary">Get Started →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
        </div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <div className="hero-badge">🔥 Version 2.0 now available</div>
              <h1 className="hero-title">
                Your Elite<br />
                <span className="gradient-text">Fitness OS</span><br />
                <span style={{fontSize:'0.5em',opacity:0.5,fontWeight:400}}>Built for the serious.</span>
              </h1>
              <p className="hero-desc">
                Track workouts, nutrition, and body composition with military precision.
                AI-powered insights, premium analytics, and the cleanest UI in fitness.
              </p>
              <div className="hero-actions">
                <a href="#pricing" className="btn btn-primary btn-xl">Start for Free →</a>
                <a href="#app" className="btn btn-ghost btn-xl">See the App</a>
              </div>
              <div className="hero-social-proof">
                <div className="avatar-stack">
                  <div className="av">JK</div>
                  <div className="av av-2">MR</div>
                  <div className="av av-3">TS</div>
                  <div className="av av-4">AL</div>
                </div>
                <div className="proof-text">
                  <span className="stars">★★★★★</span>
                  <strong>12,400+</strong> athletes already training with Apex
                </div>
              </div>
            </div>
            <div className="hero-right">
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div style={{background:'var(--bg)',padding:'12px 8px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:700}}>Good morning 👋</div>
                      <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',fontSize:9,fontWeight:700,color:'#080810',display:'flex',alignItems:'center',justifyContent:'center'}}>AJ</div>
                    </div>
                    <div style={{position:'relative',width:80,height:80,margin:'0 auto 12px'}}>
                      <svg width="80" height="80" viewBox="0 0 80 80" style={{transform:'rotate(-90deg)'}}>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#C8FF57" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="52"/>
                      </svg>
                      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                        <div style={{fontFamily:'var(--font-head)',fontSize:16,fontWeight:800}}>1,835</div>
                        <div style={{fontSize:8,color:'var(--text2)'}}>eaten</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                      <div style={{background:'var(--surface)',borderRadius:8,padding:8,textAlign:'center'}}>
                        <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700,color:'var(--green)'}}>7,842</div>
                        <div style={{fontSize:8,color:'var(--text2)'}}>Steps</div>
                      </div>
                      <div style={{background:'var(--surface)',borderRadius:8,padding:8,textAlign:'center'}}>
                        <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700,color:'var(--accent4)'}}>12 🔥</div>
                        <div style={{fontSize:8,color:'var(--text2)'}}>Streak</div>
                      </div>
                    </div>
                    <div style={{background:'var(--surface)',borderRadius:8,padding:8,display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:24,height:24,borderRadius:6,background:'rgba(200,255,87,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>🏋️</div>
                      <div>
                        <div style={{fontSize:10,fontWeight:600}}>Push Day A</div>
                        <div style={{fontSize:9,color:'var(--green)'}}>✓ Completed — 48 min</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          {['Workout Logging','Calorie Tracking','PR Detection','Weight Trends','AI Insights','Step Tracking','Macro Tracking','Cardio Logging','Body Composition','Progress Photos','Rest Timer','Streak System',
            'Workout Logging','Calorie Tracking','PR Detection','Weight Trends','AI Insights','Step Tracking','Macro Tracking','Cardio Logging'].map((item, i) => (
            <span key={i} className="ticker-item"><span className="ticker-dot"></span>{item}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item reveal"><div className="stat-num" data-count="12400">0</div><div className="stat-label">Active Athletes</div></div>
            <div className="stat-item reveal reveal-delay-1"><div className="stat-num" data-count="840000">0</div><div className="stat-label">Workouts Logged</div></div>
            <div className="stat-item reveal reveal-delay-2"><div className="stat-num" data-count="4800000">0</div><div className="stat-label">Meals Tracked</div></div>
            <div className="stat-item reveal reveal-delay-3"><div className="stat-num">4.9★</div><div className="stat-label">App Store Rating</div></div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="features-header reveal">
            <div className="eyebrow">Everything you need</div>
            <h2 className="display display-lg">Built different.<br /><span className="gradient-text">Built for results.</span></h2>
            <p className="lead" style={{margin:'20px auto 0'}}>Every feature designed around one goal: helping you make consistent, measurable progress.</p>
          </div>
          <div className="features-grid">
            {[
              {icon:'🏋️',bg:'rgba(200,255,87,0.1)',title:'Workout Tracking',desc:'Log sets, reps, and weight with auto-suggested loads based on previous sessions. Full exercise database with 500+ movements.',tag:'PR Detection',tagBg:'rgba(200,255,87,0.1)',tagColor:'var(--accent)'},
              {icon:'🍽️',bg:'rgba(87,200,255,0.1)',title:'Precision Nutrition',desc:'Barcode scanner, macro tracking, custom foods, and saved meals. Smart deficit/surplus calculation tied to your goals.',tag:'TDEE Auto-calc',tagBg:'rgba(87,200,255,0.1)',tagColor:'var(--accent2)'},
              {icon:'📈',bg:'rgba(180,87,255,0.1)',title:'AI Insights',desc:'Plateau detection, strength trend analysis, recovery recommendations. Get smarter coaching without the expensive trainer.',tag:'Smart Alerts',tagBg:'rgba(180,87,255,0.1)',tagColor:'var(--accent4)'},
              {icon:'⚖️',bg:'rgba(74,222,128,0.1)',title:'Body Composition',desc:'Daily weigh-ins with trend smoothing to filter noise. Body fat tracking, measurements, and goal projection.',tag:'Trend Smoothing',tagBg:'rgba(74,222,128,0.1)',tagColor:'var(--green)'},
              {icon:'👟',bg:'rgba(251,191,36,0.1)',title:'Step & Cardio',desc:'Manual and GPS-tracked cardio. Running, cycling, HIIT and 15+ sport types. Full integration with Apple Health.',tag:'GPS Tracking',tagBg:'rgba(251,191,36,0.1)',tagColor:'var(--yellow)'},
              {icon:'🔥',bg:'rgba(248,113,113,0.1)',title:'Streaks & Habits',desc:'Daily streak tracking, achievement badges, weekly reports. Stay accountable with push notifications.',tag:'20+ Badges',tagBg:'rgba(248,113,113,0.1)',tagColor:'var(--red)'},
            ].map((f, i) => (
              <div key={i} className={`feature-card reveal${i%3===1?' reveal-delay-1':i%3===2?' reveal-delay-2':''}`}>
                <div className="feature-icon" style={{background:f.bg}}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-tag" style={{background:f.tagBg,color:f.tagColor}}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKOUT SECTION */}
      <section className="section" id="app" style={{background:'var(--bg2)'}}>
        <div className="container">
          <div className="split-section">
            <div className="split-left reveal">
              <div className="eyebrow">Workout Logging</div>
              <h2 className="display display-md" style={{marginBottom:20}}>Strength tracking that<br /><span className="gradient-text">actually works</span></h2>
              <p>Built by lifters, for lifters. Every detail of the logging flow is designed to be fast enough to use between sets.</p>
              <div className="feature-list">
                {[
                  {icon:'⚡',bg:'rgba(200,255,87,0.1)',title:'Auto-load suggestions',desc:'Suggests your previous weight and reps. One tap to copy the last set.'},
                  {icon:'🏆',bg:'rgba(87,200,255,0.1)',title:'Instant PR detection',desc:'Highlights new personal records in real-time. Tracks 1RM, 3RM, 5RM, and volume PRs.'},
                  {icon:'⏱️',bg:'rgba(251,191,36,0.1)',title:'Rest timer',desc:'Auto-starts after each set. Configurable per exercise. Counts up and down.'},
                  {icon:'📊',bg:'rgba(180,87,255,0.1)',title:'Volume analytics',desc:'Weekly volume per muscle group, strength curves, training frequency heat maps.'},
                ].map((item, i) => (
                  <div key={i} className="feature-item">
                    <div className="fi-icon" style={{background:item.bg}}>{item.icon}</div>
                    <div className="fi-text"><h4>{item.title}</h4><p>{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="demo-card">
                <div className="demo-card-header">
                  <h3>🏋️ Bench Press — Push Day A</h3>
                  <p>Chest · Anterior Deltoid · Triceps · <span style={{color:'var(--accent)'}}>NEW PR</span></p>
                </div>
                <table className="demo-table">
                  <thead><tr><th>Set</th><th>Previous</th><th>kg</th><th>Reps</th><th></th></tr></thead>
                  <tbody>
                    <tr>
                      <td><span className="set-badge" style={{background:'rgba(200,255,87,0.15)',color:'var(--accent)'}}>1</span></td>
                      <td style={{color:'var(--text3)',fontSize:12}}>97.5 × 5</td>
                      <td><strong>100</strong></td><td>5</td>
                      <td><span style={{color:'var(--green)',fontSize:18}}>✓</span></td>
                    </tr>
                    <tr>
                      <td><span className="set-badge" style={{background:'rgba(200,255,87,0.15)',color:'var(--accent)'}}>2</span></td>
                      <td style={{color:'var(--text3)',fontSize:12}}>97.5 × 5</td>
                      <td><strong>100</strong></td><td>4</td>
                      <td><span style={{color:'var(--green)',fontSize:18}}>✓</span></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,color:'var(--text2)'}}>Total: <strong style={{color:'var(--text)'}}>2,700 kg volume</strong></span>
                  <span style={{background:'rgba(251,191,36,0.1)',color:'var(--yellow)',fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:20}}>⏱ 1:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DATABASE */}
      <section className="db-section" id="database">
        <div className="container">
          <div className="features-header reveal" style={{textAlign:'center',marginBottom:48}}>
            <div className="eyebrow">Supabase + PostgreSQL</div>
            <h2 className="display display-lg">Production-ready<br /><span className="gradient-text">database schema</span></h2>
            <p className="lead" style={{margin:'20px auto 0'}}>25 tables, row-level security, real-time subscriptions, auto-TDEE calculation.</p>
          </div>
          <div className="db-table-cards reveal">
            {[
              {name:'profiles',fields:[['id','uuid PK'],['email','text'],['weight_kg','numeric'],['target_calories','int'],['fitness_goal','text'],['tdee_kcal','int']]},
              {name:'workout_logs',fields:[['id','uuid PK'],['user_id','uuid FK'],['name','text'],['started_at','timestamptz'],['total_volume_kg','numeric'],['duration_seconds','int']]},
              {name:'nutrition_logs',fields:[['id','uuid PK'],['user_id','uuid FK'],['food_name','text'],['calories','numeric'],['protein_g','numeric'],['meal_type','text']]},
              {name:'weight_logs',fields:[['id','uuid PK'],['user_id','uuid FK'],['log_date','date'],['weight_kg','numeric'],['body_fat_pct','numeric'],['time_of_day','text']]},
              {name:'exercises',fields:[['id','uuid PK'],['name','text'],['muscle_primary','text'],['equipment','text'],['difficulty','text'],['instructions','text']]},
              {name:'set_logs',fields:[['id','uuid PK'],['exercise_log_id','uuid FK'],['weight_kg','numeric'],['reps','int'],['rpe','numeric'],['is_pr','boolean']]},
              {name:'cardio_logs',fields:[['id','uuid PK'],['activity_type','text'],['distance_m','numeric'],['avg_pace_sec_km','int'],['calories_burned','int'],['source','text']]},
              {name:'+ 18 more tables',fields:[['foods','25 macros'],['personal_records','PR tracking'],['achievements','16 badges'],['streaks','5 types'],['progress_photos','storage'],['weekly_reports','cached']]},
            ].map((table, i) => (
              <div key={i} className="db-card">
                <div className="table-name">{table.name}</div>
                {table.fields.map(([name, type], j) => (
                  <div key={j} className="field">{name}<span className="type">{type}</span></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="features-header reveal" style={{textAlign:'center',marginBottom:48}}>
            <div className="eyebrow">Testimonials</div>
            <h2 className="display display-lg">Real athletes. <span className="gradient-text">Real results.</span></h2>
          </div>
          <div className="testimonials-grid">
            {[
              {quote:'"Switched from Strong + MFP. Having everything in one app with the deficit tracker is a game changer. Down 8kg in 12 weeks."',name:'Jake K.',role:'Powerlifter · 3 years training',init:'JK',grad:'linear-gradient(135deg,var(--accent),var(--accent2))',color:'#080810'},
              {quote:'"The TDEE auto-calculation finally got my bulking macros right. Gained 4kg in 8 weeks with minimal fat — best recomp I\'ve ever done."',name:'Marcus R.',role:'Bodybuilder · 6 years training',init:'MR',grad:'linear-gradient(135deg,var(--accent2),var(--accent4))',color:'#080810'},
              {quote:'"The weight trend smoothing is genius. I stopped freaking out about daily fluctuations and finally see the actual trend. Lost 12kg so far."',name:'Sophie L.',role:'Runner · Fitness enthusiast',init:'SL',grad:'linear-gradient(135deg,var(--accent4),var(--accent3))',color:'white'},
            ].map((t, i) => (
              <div key={i} className={`testimonial-card reveal${i===1?' reveal-delay-1':i===2?' reveal-delay-2':''}`}>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-quote">{t.quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{background:t.grad,color:t.color}}>{t.init}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" style={{background:'var(--bg2)'}}>
        <div className="container">
          <div className="features-header reveal" style={{textAlign:'center',marginBottom:48}}>
            <div className="eyebrow">Pricing</div>
            <h2 className="display display-lg">Serious training, <span className="gradient-text">serious value</span></h2>
            <p className="lead" style={{margin:'20px auto 0'}}>Less than a protein shake a week. Cancel anytime.</p>
          </div>
          <div className="pricing-grid reveal">
            <div className="pricing-card">
              <div className="pricing-name">Free</div>
              <div className="pricing-price"><span className="amount">$0</span><span className="period"> / forever</span></div>
              <div className="pricing-desc">Everything you need to start tracking. No credit card required.</div>
              <div className="pricing-features">
                {['Workout logging (3 templates)','Calorie tracking (basic)','Weight logging','Step tracking'].map((f,i)=>(
                  <div key={i} className="pf-item"><span className="pf-icon yes">✓</span>{f}</div>
                ))}
                {['AI Insights','Advanced analytics','Progress photos'].map((f,i)=>(
                  <div key={i} className="pf-item"><span className="pf-icon no">—</span><span style={{color:'var(--text3)'}}>{f}</span></div>
                ))}
              </div>
              <a href="#" className="btn btn-ghost" style={{width:'100%',justifyContent:'center',borderRadius:100,padding:14}}>Get Started Free</a>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price"><span className="amount" style={{color:'var(--accent)'}}>$9</span><span className="period"> / month</span></div>
              <div className="pricing-desc">Everything serious athletes need. Unlock the full Apex experience.</div>
              <div className="pricing-features">
                {['Unlimited workouts & templates','Full nutrition suite + barcode scan','AI Insights & recommendations','Advanced analytics & charts','Progress photos','Apple Health / Google Fit sync','Weekly PDF reports'].map((f,i)=>(
                  <div key={i} className="pf-item"><span className="pf-icon yes">✓</span>{f}</div>
                ))}
              </div>
              <a href="#" className="btn btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:100,padding:14}}>Start Pro — $9/mo</a>
            </div>
            <div className="pricing-card">
              <div className="pricing-name">Annual</div>
              <div className="pricing-price"><span className="amount">$6</span><span className="period"> / month </span><span style={{color:'var(--green)',fontSize:12}}>Save 33%</span></div>
              <div className="pricing-desc">All Pro features billed annually. Best value for committed athletes.</div>
              <div className="pricing-features">
                {['Everything in Pro','Priority support','Early access to new features','Garmin sync (when available)','Custom achievement badges','Data export (CSV + JSON)','$72/year (vs $108)'].map((f,i)=>(
                  <div key={i} className="pf-item"><span className="pf-icon yes">✓</span>{f}</div>
                ))}
              </div>
              <a href="#" className="btn btn-ghost" style={{width:'100%',justifyContent:'center',borderRadius:100,padding:14}}>Go Annual — $72/yr</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="reveal">
            <h2 className="display display-lg">Stop guessing.<br /><span className="gradient-text">Start progressing.</span></h2>
            <p className="lead" style={{color:'var(--text2)',margin:'20px auto 0',maxWidth:560}}>Join 12,400+ athletes who track their training with Apex. Free to start, powerful enough to grow with.</p>
            <div className="store-badges">
              <div className="store-badge"><span style={{fontSize:28}}>🍎</span><div className="sb-text"><div className="small">Download on the</div><div className="big">App Store</div></div></div>
              <div className="store-badge"><span style={{fontSize:28}}>📱</span><div className="sb-text"><div className="small">Get it on</div><div className="big">Google Play</div></div></div>
              <a href="#" className="btn btn-primary btn-xl">Try Web App →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">apex<span>.</span></div>
              <p>The premium fitness tracking ecosystem built for athletes who take training seriously. Track everything. Miss nothing.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              {['Features','Pricing','Changelog','Roadmap','API Docs'].map(l=><a key={l} href="#">{l}</a>)}
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              {['Blog','Help Center','Community','Exercise Database','Calculators'].map(l=><a key={l} href="#">{l}</a>)}
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              {['About','Careers','Privacy Policy','Terms of Service','Contact'].map(l=><a key={l} href="#">{l}</a>)}
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Apex Fitness Inc. All rights reserved.</p>
            <p>Built with ❤️ for athletes everywhere</p>
          </div>
        </div>
      </footer>
    </>
  )
}
