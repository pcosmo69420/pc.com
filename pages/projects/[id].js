import Header from '../../components/Header'
import Footer from '../../components/Footer'
import projects from '../../data/projects.json'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'

const HEATBREAKER_FILES = [
  { label: 'Project Board', src: '/Sahelian%20HeatBreaker/Project%20Board.png', type: 'image' },
  { label: 'Exterior Breakdown', src: '/Sahelian%20HeatBreaker/Exterior%20Breakdown.jpg', type: 'image' },
  { label: 'Interior Breakdown', src: '/Sahelian%20HeatBreaker/Interior%20Breakdown.jpg', type: 'image' },
  { label: 'Exploded Axon', src: '/Sahelian%20HeatBreaker/Exploded%20Axon.jpg', type: 'image' },
  { label: 'Cluster Axon', src: '/Sahelian%20HeatBreaker/Cluster%20Axon.jpg', type: 'image' },
  { label: 'Cluster Diagram', src: '/Sahelian%20HeatBreaker/Cluster%20Diagram.jpg', type: 'image' },
  { label: 'Plan', src: '/Sahelian%20HeatBreaker/Plan.jpg', type: 'image' },
  { label: 'Ventilation Diagram', src: '/Sahelian%20HeatBreaker/Ventilation%20Diagram.jpg', type: 'image' },
  { label: 'Sand Filtration System', src: '/Sahelian%20HeatBreaker/Sand%20Filtration%20System.jpg', type: 'image' },
  { label: 'Courtyard Render', src: '/Sahelian%20HeatBreaker/Courtyard%20Render.png', type: 'image' },
  { label: 'Interior Render', src: '/Sahelian%20HeatBreaker/Interior%20Render.png', type: 'image' },
  { label: 'Estimated Interior Temperature Based on SR', src: '/Sahelian%20HeatBreaker/Estimated%20Interior%20Temperature%20Based%20on%20SR.png', type: 'image' },
  { label: 'SR Comparison', src: '/Sahelian%20HeatBreaker/SR%20Comparison.png', type: 'image' },
  { label: 'HeatBreaker Velocity Donut', src: '/Sahelian%20HeatBreaker/HeatBreaker%20Velocity%20Donut.png', type: 'image' },
  { label: 'SahelTyp Velocity Donut', src: '/Sahelian%20HeatBreaker/SahelTyp%20Velocity%20Donut.png', type: 'image' },
  { label: 'SahelTyp Wind Sim', src: '/Sahelian%20HeatBreaker/SahelTyp%20Wind%20Sim.png', type: 'image' },
  { label: 'Solar Radiation On Interior of HeatBreaker', src: '/Sahelian%20HeatBreaker/Solar%20Radiation%20On%20Interior%20of%20HeatBreaker.pdf', type: 'pdf' },
  { label: 'Solar Radiation on Interior of Typical Sahelian Homes', src: '/Sahelian%20HeatBreaker/Solar%20Radiation%20on%20Interior%20of%20%5Bshapes%20used%20in%5D%20Typical%20Sahelian%20Home(s).pdf', type: 'pdf' }
]

function FullscreenPreviewModal({ asset, title, onClose }){
  if(!asset) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 p-4 sm:p-6">
      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0a0b10] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Fullscreen Preview</p>
            <h3 className="truncate text-lg font-semibold text-white">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white hover:bg-white/5">X</button>
        </div>
        <div className="project-preview-scroll flex-1 overflow-auto p-4">
          {asset.type === 'pdf' ? (
            <iframe title={title} src={asset.src} className="h-[calc(100vh-9rem)] w-full rounded-2xl border border-white/10 bg-white" />
          ) : (
            <img src={asset.src} alt={title} className="h-auto w-full rounded-2xl border border-white/10 object-contain bg-black/60" />
          )}
        </div>
      </div>
    </div>
  )
}

function AssetViewer({ asset, title }){
  if(!asset) return null

  if(asset.type === 'pdf'){
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">PDF preview</p>
          <a href={asset.src} target="_blank" rel="noreferrer" className="text-sm underline">Open full size</a>
        </div>
        <iframe title={title} src={asset.src} className="w-full h-[78vh] border bg-white" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Image preview</p>
        <a href={asset.src} target="_blank" rel="noreferrer" className="text-sm underline">Open full size</a>
      </div>
      <div className="overflow-hidden border bg-gray-100">
        <img src={asset.src} alt={title} className="w-full h-auto" />
      </div>
    </div>
  )
}

function TabDetails({ tab }){
  if(!tab) return null

  return (
    <div className="mt-5 border border-white/10 rounded-lg p-4 bg-white/5">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">{tab.label}</p>
      <h3 className="text-xl font-semibold mb-2">{tab.title || tab.label}</h3>
      <p className="text-sm leading-relaxed text-gray-300">
        {tab.body || `No content has been added yet for ${tab.label}. This tab is reserved for future diagrams and notes.`}
      </p>
    </div>
  )
}

export default function ProjectCase({ project }){
  const router = useRouter()
  const tabs = useMemo(() => {
    if(project?.diagramTabs?.length) return project.diagramTabs
    return project?.gallery?.map((src, index) => ({ label: `Diagram ${index + 1}`, type: src.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image', src })) || []
  }, [project])
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreenAsset, setFullscreenAsset] = useState(null)
  const [boardZoom, setBoardZoom] = useState(1)
  const videoRef = useRef(null)

  if(router.isFallback) return <div>Loading...</div>
  if(!project) return <div>Project not found.</div>

  const isHeatbreakerProject = Number(project.id) === 1
  const isHandDrawingsProject = Number(project.id) === 3
  const heatbreakerVideo = HEATBREAKER_FILES.find(asset => asset.type === 'video') || { label: 'HeatBreaker Wind Simulation', src: '/Sahelian%20HeatBreaker/HeatBreaker%20Wind%20Simulation.mp4', type: 'video' }
  const activeAsset = tabs[activeIndex] || { type: 'image', src: project.image }

  function handleSimulate(){
    const video = videoRef.current
    if(!video) return

    video.currentTime = 0
    const playback = video.play()
    if(playback && typeof playback.catch === 'function'){
      playback.catch(() => {})
    }
  }

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className={`relative project-hero mb-8 bg-gray-200 flex items-center justify-center overflow-hidden border ${isHandDrawingsProject ? 'h-[52vh]' : ''}`} style={isHandDrawingsProject ? { height: '52vh' } : undefined}>
          {project.heroImage || project.image ? (
            <img
              src={project.heroImage || project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-200"
              style={{ transform: `scale(${boardZoom})`, transformOrigin: isHandDrawingsProject ? 'center top' : 'center center', objectPosition: isHandDrawingsProject ? 'center top' : 'center center' }}
            />
          ) : <span>Project image</span>}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button type="button" onClick={() => setBoardZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))} className="px-3 py-1 text-xs border border-white/20 bg-black/60">−</button>
            <button type="button" onClick={() => setBoardZoom(z => Math.min(2.5, +(z + 0.1).toFixed(2)))} className="px-3 py-1 text-xs border border-white/20 bg-black/60">+</button>
            <button type="button" onClick={() => setBoardZoom(1)} className="px-3 py-1 text-xs border border-white/20 bg-black/60">Reset</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-semibold mb-4">{project.title}</h1>
            {project.competition && <p className="text-gray-500 uppercase tracking-wide text-sm mb-2">{project.competition}</p>}
            <p className="text-gray-600 mb-4">{project.year} — {project.desc}</p>
            {project.summary && <p className="text-gray-800 mb-6 leading-relaxed">{project.summary}</p>}
            {project.materials && (
              <div className="mb-8">
                <h3 className="font-medium mb-2">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {project.materials.map((material, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{material}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="prose mb-8"><p>{project.details}</p></div>
            {project.sections && project.sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                <p className="text-gray-700 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
          <aside className="text-sm text-gray-700">
            <h4 className="font-medium mb-2">Project details</h4>
            <p className="mb-2">Year: {project.year}</p>
            <p className="mb-2">Type: Architecture</p>
            {project.highlights && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Highlights</h4>
                <ul className="space-y-2">
                  {project.highlights.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
        {isHeatbreakerProject ? (
          <div className="mt-12 border-t pt-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-start">
              <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm uppercase tracking-[0.22em] text-gray-500">Diagrams</h4>
                  <p className="text-xs text-gray-500">Click a file name to enlarge it</p>
                </div>
                <div className="project-preview-scroll flex max-h-[36rem] flex-col gap-2 overflow-auto pr-1">
                  {HEATBREAKER_FILES.map((asset, index) => (
                    <button
                      key={`${asset.label || asset.src}-${index}`}
                      type="button"
                      onClick={() => setFullscreenAsset(asset)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-gray-200 transition hover:border-white/20 hover:bg-white/5"
                    >
                      <div className="font-medium tracking-[0.02em]">{asset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-4 flex flex-col max-h-[36rem] overflow-hidden">
                <div className="mb-3 flex items-center justify-between gap-3 flex-shrink-0">
                  <div>
                    <h4 className="text-sm uppercase tracking-[0.22em] text-gray-500">Preview</h4>
                    <p className="text-xs text-gray-500">HeatBreaker Wind Simulation</p>
                  </div>
                </div>
                <>
                  <video
                    ref={videoRef}
                    src={heatbreakerVideo.src}
                    controls={false}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full rounded-2xl border border-white/10 bg-black flex-shrink-0"
                  />
                  <div className="flex justify-start mt-4 flex-shrink-0">
                    <button type="button" onClick={handleSimulate} className="simulate-button">
                      <span className="ask-dot" aria-hidden="true" />
                      <span className="simulate-label">Simulate</span>
                    </button>
                  </div>
                </>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 border-t pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6" role="tablist" aria-label={`${project.title} diagrams`}>
              {tabs.map((tab, index) => (
                <button
                  key={`${tab.label}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`w-full px-4 py-2 text-sm border rounded-full transition ${index === activeIndex ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div key={activeAsset?.src || activeAsset?.label || activeIndex} role="tabpanel">
              <AssetViewer asset={activeAsset} title={`${project.title} ${activeAsset.label || ''}`} />
              <TabDetails tab={tabs[activeIndex]} />
            </div>
          </div>
        )}
        <div className="mt-10 grid gap-4 grid-cols-1 md:grid-cols-3">
          {(project.gallery || []).map((src, index) => (
            <a key={index} href={src} target="_blank" rel="noreferrer" className="block h-40 bg-gray-200 overflow-hidden border">
              {src.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-600 px-4 text-center">Open PDF diagram</div>
              ) : (
                <img src={src} alt={`${project.title} ${index + 1}`} className="w-full h-full object-cover" />
              )}
            </a>
          ))}
        </div>
      </main>
      <FullscreenPreviewModal
        asset={fullscreenAsset}
        title={fullscreenAsset?.label || project.title}
        onClose={() => setFullscreenAsset(null)}
      />
      <Footer />
    </div>
  )
}

export async function getStaticPaths(){
  const paths = projects.map(p => ({ params: { id: String(p.id) } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }){
  const project = projects.find(p => String(p.id) === params.id) || null
  return { props: { project } }
}
