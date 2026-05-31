import { useEffect, useState } from 'react'

export default function ApiStatusBadge(){
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function checkStatus(){
      try{
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'Ping' })
        })
        const data = await response.json()
        if(cancelled) return
        // Prefer showing Gemini availability as the default mode when present
        if(data?.geminiAvailable) setStatus('gemini')
        else setStatus(data?.mode === 'gemini' ? 'gemini' : 'fallback')
      }catch{
        if(cancelled) return
        setStatus('fallback')
      }
    }

    checkStatus()
    const intervalId = setInterval(checkStatus, 60000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  return (
      <span className={`api-status-badge status-${status}`} title={`API mode: ${status}`} aria-label={`API mode: ${status}`}>
      <span className="api-status-dot" aria-hidden="true" />
      <span className="api-status-text">API</span>
    </span>
  )
}
