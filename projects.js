import Header from '../components/Header'
import Footer from '../components/Footer'
import projects from '../data/projects.json'
import ProjectCard from '../components/ProjectCard'

export default function Projects(){
  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <h1 className="text-3xl font-semibold mb-6">Projects</h1>
        <div className="space-y-10">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
