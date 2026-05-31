import ChatWidget from './ChatWidget'

export default function ChatPopup({ onClose }){
  return (
    <div className="chat-popup z-50">
      <button aria-label="Close chat" onClick={onClose} className="chat-close-button absolute right-3 top-3 z-10 text-gray-300 hover:text-white">✕</button>
      <div className="chat-popup-body p-0">
        <ChatWidget compact />
      </div>
    </div>
  )
}
