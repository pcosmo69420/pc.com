import Header from '../components/Header'
import Footer from '../components/Footer'
import profile from '../data/profile.json'

export default function Skills(){
  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-6">Skills</h1>
        <p className="mb-6 text-gray-700">A concise overview of skills and tools.</p>
        <ul className="grid sm:grid-cols-2 gap-4">
          {profile.skills.map((s, i) => (
            <li key={i} className="p-4 border rounded">{s}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  )
}
