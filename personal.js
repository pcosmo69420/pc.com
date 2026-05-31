import Header from '../components/Header'
import Footer from '../components/Footer'
import profile from '../data/profile.json'

export default function Personal(){
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-4">About</h1>
        <p className="text-gray-800 mb-4">{profile.bio}</p>

        <h2 className="text-xl font-medium mt-6 mb-2">Contact</h2>
        <p className="text-gray-700">{profile.email}</p>

        <h2 className="text-xl font-medium mt-6 mb-2">Education</h2>
        <p className="text-gray-700">{profile.education}</p>
      </main>
      <Footer />
    </div>
  )
}
