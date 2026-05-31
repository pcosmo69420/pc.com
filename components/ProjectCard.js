import { useMemo, useRef, useState } from 'react'

const HEATBREAKER_ASSETS = [
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
  { label: 'HeatBreaker Wind Simulation', src: '/Sahelian%20HeatBreaker/HeatBreaker%20Wind%20Simulation.mp4', type: 'video' },
  { label: 'Solar Radiation On Interior of HeatBreaker', src: '/Sahelian%20HeatBreaker/Solar%20Radiation%20On%20Interior%20of%20HeatBreaker.pdf', type: 'pdf' },
  { label: 'Solar Radiation on Interior of Typical Sahelian Homes', src: '/Sahelian%20HeatBreaker/Solar%20Radiation%20on%20Interior%20of%20%5Bshapes%20used%20in%5D%20Typical%20Sahelian%20Home(s).pdf', type: 'pdf' }
]

function PreviewModal({ asset, title, onClose }){
  if(!asset) return null

  const groupedImages = asset.type === 'group' ? (asset.images || []).filter(Boolean) : []
  const isGrouped = asset.type === 'group' && groupedImages.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8" onClick={onClose}>
      <div className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10] shadow-2xl ${isGrouped ? 'max-w-3xl' : 'max-w-6xl'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Preview</p>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white hover:bg-white/5">Close</button>
        </div>
        <div className={`project-preview-scroll max-h-[82vh] overflow-auto p-4 ${isGrouped ? 'mx-auto max-w-4xl' : ''}`}>
          {asset.type === 'pdf' ? (
            <iframe title={title} src={asset.src} className="h-[78vh] w-full rounded-lg border border-white/10 bg-white" />
          ) : isGrouped ? (
            <div className="grid grid-cols-2 gap-3">
              {groupedImages.map((imageSrc, index) => (
                <img
                  key={`${imageSrc}-${index}`}
                  src={imageSrc}
                  alt={`${title} ${index + 1}`}
                  className="h-auto max-h-[52vh] w-full rounded-lg border border-white/10 object-contain bg-black/60"
                />
              ))}
            </div>
          ) : (
            <img src={asset.src} alt={title} className="h-auto w-full rounded-lg border border-white/10" />
          )}
        </div>
      </div>
    </div>
  )
}

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

export default function ProjectCard({ project }){
  const [previewAsset, setPreviewAsset] = useState(null)
  const [fullscreenAsset, setFullscreenAsset] = useState(null)
  const videoRef = useRef(null)

  const assets = useMemo(() => {
    if(project?.diagramTabs?.length){
      return project.diagramTabs
    }
    return (project?.gallery || []).map((src, index) => ({
      label: `Diagram ${index + 1}`,
      title: `Diagram ${index + 1}`,
      src,
      type: src.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
    }))
  }, [project])

  if(!project) return null

  const cover = project.heroImage || project.image
  const projectLabelClass = 'text-violet-300'
  const isKalamosProject = project.title?.toLowerCase().includes('kalamos project')
  const isHeatbreakerProject = Number(project.id) === 1
  const heatbreakerVideoAsset = HEATBREAKER_ASSETS.find(asset => asset.type === 'video')
  const heatbreakerFileAssets = HEATBREAKER_ASSETS.filter(asset => asset.type !== 'video')

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
    <>
      <article className="project-card rounded-3xl overflow-hidden border border-white/10 bg-[#0b0c11] shadow-[0_18px_60px_rgba(0,0,0,0.25)]" style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
        <div className="p-5 md:p-7 card-body space-y-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.32em] ${projectLabelClass}`}>Project {String(project.id).padStart(2, '0')}</p>
                <h3 className="mt-3 text-3xl md:text-5xl font-semibold text-white">{project.title}</h3>
              </div>
              {project.yearLabel || project.year ? (
                <div className="text-xs uppercase tracking-[0.25em] text-gray-500">{project.yearLabel || project.year}</div>
              ) : null}
            </div>

            {project.id === 1 ? null : project.competition ? (
              <p className="text-sm uppercase tracking-[0.22em] text-gray-400">{project.competition}</p>
            ) : null}

            {project.highlights?.length ? (
              project.id === 1 ? (
                <div className="sahel-bubbles-grid">
                  {project.highlights.slice(0, 6).map((item, index) => (
                    <span key={index} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.12em] text-gray-300">{item}</span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.highlights.slice(0, 6).map((item, index) => (
                    <span key={index} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-300">{item}</span>
                  ))}
                </div>
              )
            ) : null}

            <p className="text-base md:text-lg leading-relaxed text-gray-300">
              {project.summary || project.desc}
            </p>

            {project.id !== 1 && project.details ? <p className="text-sm leading-relaxed text-gray-400">{project.details}</p> : null}
          </div>

          <div className={`overflow-hidden rounded-3xl border border-white/10 bg-black/40 ${isKalamosProject ? 'h-[20rem] md:h-[24rem]' : ''}`}>
            {cover ? (
              <img
                src={cover}
                alt={project.title}
                loading={project.id === 1 ? 'eager' : 'lazy'}
                decoding="async"
                className={isKalamosProject ? 'h-full w-full object-cover' : 'h-auto w-full object-contain'}
              />
            ) : (
              <div className="flex min-h-[18rem] items-center justify-center text-gray-500">Image</div>
            )}
          </div>

          {assets.length ? (
            <div className="pt-1">
              {isHeatbreakerProject ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
                  <div className="rounded-3xl border border-white/10 bg-black/35 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm uppercase tracking-[0.22em] text-gray-500">Diagrams</h4>
                      <p className="text-xs text-gray-500">Click a file name to enlarge it</p>
                    </div>
                    <div className="project-preview-scroll flex max-h-[36rem] flex-col gap-2 overflow-auto pr-1">
                      {heatbreakerFileAssets.map((asset, index) => {
                        return (
                          <button
                            key={`${asset.label || asset.src}-${index}`}
                            type="button"
                            onClick={() => setFullscreenAsset(asset)}
                            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-gray-200 transition hover:border-white/20 hover:bg-white/5"
                          >
                            <div className="font-medium tracking-[0.02em]">{asset.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/35 p-4 flex flex-col max-h-[36rem] overflow-hidden">
                    <div className="mb-3 flex items-center justify-between gap-3 flex-shrink-0">
                      <div>
                        <h4 className="text-sm uppercase tracking-[0.22em] text-gray-500">Preview</h4>
                        <p className="text-xs text-gray-500">{heatbreakerVideoAsset?.label || 'HeatBreaker Wind Simulation'}</p>
                      </div>
                    </div>

                    {heatbreakerVideoAsset ? (
                      <>
                        <video
                          ref={videoRef}
                          src={heatbreakerVideoAsset.src}
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
                    ) : (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-auto w-full rounded-2xl border border-white/10 bg-black/40 object-contain"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm uppercase tracking-[0.22em] text-gray-500">Diagrams</h4>
                    <p className="text-xs text-gray-500">Click any thumbnail to enlarge</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {assets.map((asset, index) => (
                      <button
                        key={`${asset.label || asset.src}-${index}`}
                        type="button"
                        onClick={() => setPreviewAsset(asset)}
                        className="group small-thumb-button overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition hover:border-white/20 hover:bg-white/5"
                      >
                        <div className="thumb-frame overflow-hidden bg-[#0a0b10]">
                          {asset.type === 'pdf' ? (
                            <div className="flex h-full items-center justify-center px-3 text-center text-xs uppercase tracking-[0.2em] text-gray-400">
                              Open PDF
                            </div>
                          ) : asset.type === 'group' ? (
                            <img
                              src={asset.thumbnail || asset.src}
                              alt={asset.title || asset.label || project.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <img
                              src={asset.src}
                              alt={asset.title || asset.label || project.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                            />
                          )}
                        </div>
                        <div className="px-2 py-1">
                          <div className="text-xs uppercase tracking-[0.12em] text-gray-300">{asset.label || `Diagram ${index + 1}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </article>

      <PreviewModal
        asset={previewAsset}
        title={previewAsset?.title || previewAsset?.label || project.title}
        onClose={() => setPreviewAsset(null)}
      />

      <FullscreenPreviewModal
        asset={fullscreenAsset}
        title={fullscreenAsset?.title || fullscreenAsset?.label || project.title}
        onClose={() => setFullscreenAsset(null)}
      />
    </>
  )
}
