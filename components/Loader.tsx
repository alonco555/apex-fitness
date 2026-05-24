export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:14}}>
      <div style={{width:34,height:34,border:'2px solid var(--surface4)',borderTop:'2px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <div style={{fontSize:13,color:'var(--text3)'}}>{text}</div>
    </div>
  )
}
