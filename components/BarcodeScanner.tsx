'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const detectedRef = useRef(false)

  useEffect(() => {
    let stopped = false

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()

        await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (stopped || detectedRef.current) return
          if (result) {
            detectedRef.current = true
            BrowserMultiFormatReader.releaseAllStreams()
            onDetected(result.getText())
          }
        })
      } catch {
        if (!stopped) setError('Camera access denied or not supported.')
      }
    }

    start()

    return () => {
      stopped = true
      import('@zxing/browser').then(({ BrowserMultiFormatReader }) => {
        BrowserMultiFormatReader.releaseAllStreams()
      })
    }
  }, [onDetected])

  return (
    <div style={{position:'relative',borderRadius:12,overflow:'hidden',background:'#000'}}>
      <video ref={videoRef} style={{width:'100%',display:'block',maxHeight:260,objectFit:'cover'}}/>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
        <div style={{width:220,height:120,border:'2px solid var(--accent)',borderRadius:10,boxShadow:'0 0 0 1000px rgba(0,0,0,0.45)'}}/>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px 14px',background:'linear-gradient(transparent,rgba(0,0,0,0.7))',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Point at a product barcode</span>
        <button onClick={onClose} style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,padding:'5px 12px',fontSize:12,color:'#fff',cursor:'pointer'}}>Cancel</button>
      </div>
      {error && (
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--surface)',flexDirection:'column',gap:10,padding:20}}>
          <div style={{fontSize:13,color:'var(--red)',textAlign:'center'}}>{error}</div>
          <button onClick={onClose} style={{fontSize:13,color:'var(--text2)',background:'transparent',border:'1px solid var(--border)',borderRadius:7,padding:'7px 16px',cursor:'pointer'}}>Close</button>
        </div>
      )}
    </div>
  )
}
