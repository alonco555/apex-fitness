'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workouts',  label: 'Workouts' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/progress',  label: 'Progress' },
  { href: '/programs',  label: 'Programs' },
  { href: '/profile',   label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const initial = profile?.name?.charAt(0)?.toUpperCase() || 'A'

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>apex<span style={{color:'var(--accent)'}}>.</span></div>

      <nav style={s.nav}>
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{...s.item, ...(active ? s.itemActive : {})}}>
              {active && <div style={s.activeLine}/>}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={s.bottom}>
        <div style={s.userRow}>
          <div style={s.avatar}>{initial}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{profile?.name || 'Athlete'}</div>
            <div style={s.userSub}>Free Plan</div>
          </div>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Sign Out</button>
      </div>
    </aside>
  )
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {width:'var(--sidebar)',background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'28px 0',position:'fixed',top:0,left:0,bottom:0,zIndex:50,overflowY:'auto'},
  logo: {fontFamily:'var(--font-head)',fontSize:20,fontWeight:800,letterSpacing:'-0.5px',marginBottom:36,paddingLeft:24},
  nav: {display:'flex',flexDirection:'column',gap:1,flex:1},
  item: {display:'flex',alignItems:'center',padding:'10px 24px',fontSize:13,fontWeight:500,color:'var(--text3)',transition:'var(--transition)',textDecoration:'none',position:'relative',letterSpacing:'0.01em'},
  itemActive: {color:'var(--text)',fontWeight:600},
  activeLine: {position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:2,height:16,background:'var(--accent)',borderRadius:1},
  bottom: {borderTop:'1px solid var(--border)',paddingTop:16,marginTop:16,paddingLeft:20,paddingRight:20},
  userRow: {display:'flex',alignItems:'center',gap:10,marginBottom:10},
  avatar: {width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-head)',fontWeight:800,fontSize:11,color:'#07070F',flexShrink:0},
  userInfo: {flex:1,minWidth:0},
  userName: {fontSize:12,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'},
  userSub: {fontSize:11,color:'var(--text3)',marginTop:1},
  logoutBtn: {width:'100%',background:'transparent',border:'1px solid var(--border)',borderRadius:8,padding:'8px',fontSize:12,color:'var(--text3)',cursor:'pointer'},
}
