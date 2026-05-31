import { useState } from 'react'
import ChatPopup from './ChatPopup'

export default function Header(){
  const [showChat, setShowChat] = useState(false)

  return (
    <header className="site-header">
      <button
        className="ask-button"
        onClick={() => setShowChat(s => !s)}
        aria-expanded={showChat}
      >
        <span className="ask-dot" aria-hidden="true" />
        <span className="ask-label">ASK ME ANYTHING</span>
      </button>

      {showChat && (
        <div className="ask-popup-wrapper">
          <ChatPopup onClose={() => setShowChat(false)} />
        </div>
      )}
    </header>
  )
}
