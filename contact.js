import Header from '../components/Header'
import Footer from '../components/Footer'
import profile from '../data/profile.json'

export default function Contact(){
  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold mb-4">Contact</h1>
        <p className="text-gray-700 mb-2">Email: <a className="text-accent" href={`mailto:${profile.email}`}>{profile.email}</a></p>
        {profile.phone && <p className="text-gray-700 mb-6">Phone: <a className="text-accent" href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}>{profile.phone}</a></p>}
        <p className="text-gray-700">Or use the contact form (to be added).</p>
      </main>
      <Footer />
    </div>
  )
}
