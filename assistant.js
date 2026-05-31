import Header from '../components/Header'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'

export default function Assistant(){
  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-6">Ask about my work</h1>
        <p className="text-gray-700 mb-6">Ask questions about projects, process, tools, or contact details.</p>
        <ChatWidget />
      </main>
      <Footer />
    </div>
  )
}
