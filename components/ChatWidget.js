import { useEffect, useRef, useState } from 'react'

export default function ChatWidget({ compact = false }){
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const transcriptRef = useRef(null)
  const inputRef = useRef(null)

  function scrollTranscript(behavior = 'smooth'){
    const transcript = transcriptRef.current
    if(!transcript) return

    requestAnimationFrame(() => {
      transcript.scrollTo({ top: transcript.scrollHeight, behavior })
    })
  }

  useEffect(() => {
    scrollTranscript('smooth')
  }, [messages, loading])

  useEffect(() => {
    const typingIndex = messages.findIndex(message => message.role === 'assistant' && message.status === 'typing')
    if(typingIndex === -1) return

    const typingMessage = messages[typingIndex]
    const fullText = typingMessage.text || ''
    const visibleText = typingMessage.displayText || ''

    if(visibleText.length >= fullText.length){
      setMessages(prev => prev.map((message, index) => index === typingIndex ? { ...message, displayText: fullText, status: 'done' } : message))
      return
    }

    const chunkSize = visibleText.length < 40 ? 1 : visibleText.length < 110 ? 2 : 3
    const delay = visibleText.length < 24 ? 18 : visibleText.length < 80 ? 14 : 10
    const timer = setTimeout(() => {
      setMessages(prev => prev.map((message, index) => {
        if(index !== typingIndex) return message
        const nextLength = Math.min(message.text.length, (message.displayText || '').length + chunkSize)
        return { ...message, displayText: message.text.slice(0, nextLength) }
      }))
    }, delay)

    return () => clearTimeout(timer)
  }, [messages])

  const hasTypingAssistant = messages.some(message => message.role === 'assistant' && message.status === 'typing')

  async function send(e){
    e && e.preventDefault()
    const question = inputRef.current?.value?.trim() || ''
    if(!question) return
    const history = messages.slice(-8)
    const startedAt = Date.now()
    const minimumLoadingMs = 1350
    const userMsg = { role: 'user', text: question }
    const request = fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history })
    })
    setMessages(m => [...m, userMsg])
    if(inputRef.current){
      inputRef.current.value = ''
    }
    setLoading(true)
    try{
      const res = await request
      const data = await res.json()
      const reply = data.answer || 'No answer returned.'
      const elapsed = Date.now() - startedAt
      if(elapsed < minimumLoadingMs){
        await new Promise(resolve => setTimeout(resolve, minimumLoadingMs - elapsed))
      }
      setMessages(m => [...m, { role: 'assistant', text: reply, displayText: '', status: 'typing' }])
      scrollTranscript('smooth')
    }catch(err){
      const elapsed = Date.now() - startedAt
      if(elapsed < minimumLoadingMs){
        await new Promise(resolve => setTimeout(resolve, minimumLoadingMs - elapsed))
      }
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry! I could not reach the AI endpoint right now.', displayText: '', status: 'typing' }])
      scrollTranscript('smooth')
    }finally{ setLoading(false) }
  }

  const outerClass = compact ? 'w-80 h-full flex-shrink-0 flex flex-col' : 'w-full max-w-none flex flex-1 min-h-0 flex-col'
  const innerPadding = compact ? 'p-3' : 'p-4 md:p-5'
  const widgetScaleClass = compact ? 'chat-widget--compact' : 'chat-widget--full'

  return (
    <div className={outerClass}>
      <div className={`chat-widget ${widgetScaleClass} flex h-full flex-col rounded ${innerPadding}`}>
          <div className="jerome-main-header mb-0 flex items-start gap-2 border-b border-white/6 pb-0.5">
            <img
              src="/jerome-robot.svg"
              alt="Jerome robot contact photo"
              className={`jerome-avatar ${compact ? 'h-8 w-8' : 'h-10 w-10'} shrink-0 rounded-full border border-white/10 bg-[#0b1020] object-cover shadow-lg shadow-black/30`}
            />
            <div className="min-w-0 flex-1 pt-0 flex flex-col items-start">
              <div className={`${compact ? 'text-[15px]' : 'text-[18px]'} font-semibold tracking-wide text-white leading-none mb-0`}>Jerome</div>
              <div className={`jerome-status-row mt-0 flex items-center gap-x-2 ${compact ? 'text-[10px]' : 'text-[12px]'} text-white/80`}>
                <span className="jerome-status-pill inline-flex items-center gap-1.5">
                  <span className="jerome-status-dot" aria-hidden="true" />
                  <span className={`font-semibold uppercase tracking-[0.18em] text-emerald-300 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Active</span>
                  </span>
                  <span className={`jerome-status-note ${compact ? 'text-[9px]' : 'text-[10px]'}`}>(Jerome is always active...He never sleeps. Many say he is Batman.)</span>
              </div>
            </div>
          </div>

        <div ref={transcriptRef} className="chat-transcript flex-1 min-h-0 overflow-y-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`chat-row ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              {m.role === 'user' ? (
                <div className="chat-bubble user-bubble">{m.text}</div>
              ) : (
                <div className={`chat-bubble assistant-bubble ${m.status === 'typing' ? 'is-typing' : ''}`}>
                  {m.displayText || ''}
                  {m.status === 'typing' && <span className="typing-cursor" aria-hidden="true">|</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`chat-prompt-area relative ${compact ? 'mt-2' : 'mt-3'} shrink-0`}>
          {loading && !hasTypingAssistant && (
            <div className="pointer-events-none absolute -top-7 left-3 z-10" aria-live="polite" aria-busy="true">
              <div className="typing-row rounded-full border border-violet-500/20 bg-[#0a0b10] px-3 py-1.5 shadow-lg shadow-black/20">
                <span className="typing-dot" />
                <span className="typing-text">typing<span className="typing-period period-1">.</span><span className="typing-period period-2">.</span><span className="typing-period period-3">.</span></span>
              </div>
            </div>
          )}

          <form onSubmit={send} className="w-full">
            <div className="chat-prompt-shell flex w-full items-center gap-2 overflow-hidden rounded-2xl border border-violet-500/15 bg-[#0a0b10] px-3 py-2.5" onPointerDown={e => {
              if(e.target === e.currentTarget){
                inputRef.current?.focus()
              }
            }}>
              <input
                ref={inputRef}
                defaultValue=""
                placeholder="ask Jerome anything..."
                className="chat-prompt-input min-w-0 flex-1 bg-transparent p-0 text-white placeholder:text-white/45 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Send message"
                className={`chat-send-button grid ${compact ? 'h-6 w-6' : 'h-7 w-7'} shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 disabled:opacity-60`}
              >
                <svg className="chat-send-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 19V6" />
                  <path d="M6.5 11.5L12 6l5.5 5.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
