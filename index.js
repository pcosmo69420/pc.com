import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProjectCard from '../components/ProjectCard'
import ChatWidget from '../components/ChatWidget'
import projects from '../data/projects.json'
import profile from '../data/profile.json'

function fastScrollToSection(id){
  const target = document.getElementById(id)
  if(!target) return

  const yOffset = 16
  const startY = window.scrollY || window.pageYOffset
  const targetY = Math.max(0, target.getBoundingClientRect().top + startY - yOffset)
  const distance = targetY - startY
  const duration = 220
  const startedAt = performance.now()

  function tick(now){
    const elapsed = now - startedAt
    const progress = Math.min(1, elapsed / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo(0, startY + distance * eased)
    if(progress < 1){
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

function NowTicker({ items = [], typeSpeed = 45, pauseAfter = 5000 }){
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(true)

  function capitalizeFirst(value){
    if(!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  useEffect(() => {
    let mounted = true
    let timer = null
    const item = capitalizeFirst(items[index] || '')

    // typing phase
    let i = 0
    function doType(){
      if(!mounted) return
      if(i <= item.length){
        setText(item.slice(0, i))
        setTyping(true)
        i += 1
        timer = setTimeout(doType, typeSpeed)
        return
      }

      // finished typing
      setTyping(false)

      // wait pauseAfter, then delete gradually (backspace-like)
      timer = setTimeout(() => {
        if(!mounted) return
        setTyping(true)
        let j = item.length
        const deleteStep = () => {
          if(!mounted) return
          if(j >= 0){
            setText(item.slice(0, j))
            j -= 1
            // deletion speed slightly faster than typing
            timer = setTimeout(deleteStep, Math.max(18, Math.floor(typeSpeed * 0.6)))
            return
          }
          setTyping(false)
          setIndex(idx => (idx + 1) % items.length)
        }
        deleteStep()
      }, pauseAfter)
    }

    doType()

    return () => { mounted = false; if(timer) clearTimeout(timer) }
  }, [index, items, typeSpeed, pauseAfter])

  return (
    <div className="now-ticker mt-6">
      <div className="now-box flex items-center gap-4 p-3 rounded-md border">
        <div className="now-left flex items-center gap-3">
          <span className="now-dot" aria-hidden="true" />
          <span className="uppercase text-xs tracking-widest text-gray-400">now</span>
        </div>

        <div className="now-line text-lg font-medium flex-1 -translate-y-0.5">
          <span className="typed-text">{text}</span>
          <span className={`typing-caret ${typing ? 'is-typing' : ''}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const skillTrees = [
    {
      title: 'CAD',
      branches: [
        'Rhinoceros 3D (and Grasshopper)',
        'Autodesk Revit',
        'Altair Solidworks',
        'Altair Hyperworks',
        'Autodesk Inventor'
      ]
    },
    {
      title: 'POST PROCESSING',
      branches: [
        'Adobe Photoshop',
        'Adobe Illustrator',
        'Adobe InDesign',
        'Affinity Designer 2',
        'Procreate'
      ]
    },
    {
      title: 'RENDERING',
      branches: [
        'D5 Render',
        'Enscape',
        'TwinMotion'
      ]
    }
  ]

  function onTabClick(e){
    const href = e.currentTarget.getAttribute('href') || ''
    if(!href.startsWith('#')) return
    e.preventDefault()
    const id = href.slice(1)
    if(!id) return
    fastScrollToSection(id)
    if(window.location.hash !== href){
      window.history.replaceState(null, '', href)
    }
  }

  useEffect(() => {
    if(router.asPath.indexOf('#') === -1) return
    const id = router.asPath.split('#')[1]
    requestAnimationFrame(() => fastScrollToSection(id))
  }, [router.asPath])

  return (
    <div>
      <Head>
        <title>Peter Cosmopoulos — Architecture</title>
        <meta name="description" content="Architecture portfolio of Peter Cosmopoulos" />
      </Head>

      <Header />

      <main className="max-w-6xl mx-auto px-6 py-20">
        <section id="hero" className="scroll-mt-24 mb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8 items-start">
            <div>
              <h1 className="text-6xl md:text-8xl font-semibold leading-none mb-4 tracking-tight inline-flex items-center whitespace-nowrap">Peter Cosmopoulos <span className="title-emoji">🤘</span></h1>
              <div>
                <p className="text-sm md:text-base uppercase tracking-[0.28em] text-white flex items-center gap-3 whitespace-nowrap overflow-x-auto">
                  <span>Architecture &amp; Design</span>
                  <span>•</span>
                  <span>Tulane University '30</span>
                </p>

                <NowTicker items={[
                  'Reading Meditations by Marcus Aurelius',
                  'waiting an eternity for my renders to load',
                  'Messing around on Grasshopper',
                  'Doing freelance work',
                  'Crying myself to sleep after final review',
                  'Waiting for ANY adobe product to load (again)',
                  'Working on the Mujassam Watan Urban Sculpture Challenge',
                  'Listening to Judas by Lady Gaga',
                  'Spending 8 hours on a section right before I decide to hate it',
                  'Eating a ridiculous amount of food',
                  'Wishing I was as cool as Frank Lloyd Wright',
                  'praying my computer does not explode while im rendering'
                ]} />
              </div>
            </div>

            {/* right column removed from hero; AI box now lives below the Now box */}
            <div className="lg:pt-2" />
          </div>
        </section>

        {/* Tabs box and AI box under Now */}
        <section id="assistant" className="scroll-mt-24 mt-8 md:mt-10 mb-8 md:mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6 items-stretch">
            <div className="tabs-box p-4 h-[31rem] overflow-hidden">
              <nav className="flex flex-col h-full justify-between">
                <a className="tab-link" href="#hero" onClick={onTabClick}>
                  <span className="tab-dot" aria-hidden="true" />
                  <span className="tab-label">Home</span>
                  <span className="tab-desc">overview &amp; highlights</span>
                </a>
                <a className="tab-link" href="#projects" onClick={onTabClick}>
                  <span className="tab-dot" aria-hidden="true" />
                  <span className="tab-label">Projects</span>
                  <span className="tab-desc">case studies &amp; boards</span>
                </a>
                <a className="tab-link" href="#ikap" onClick={onTabClick}>
                  <span className="tab-dot tab-dot-ikap" aria-hidden="true" />
                  <span className="tab-label">IKAP</span>
                  <span className="tab-desc">fieldwork &amp; mapping</span>
                </a>
                <a className="tab-link" href="#skills" onClick={onTabClick}>
                  <span className="tab-dot" aria-hidden="true" />
                  <span className="tab-label">Skills</span>
                  <span className="tab-desc">tools &amp; techniques</span>
                </a>
                <a className="tab-link" href="#personal" onClick={onTabClick}>
                  <span className="tab-dot" aria-hidden="true" />
                  <span className="tab-label">About Me</span>
                  <span className="tab-desc">bio &amp; interests</span>
                </a>
                {/* Ask tab intentionally removed - use top-right Ask button */}
                <a className="tab-link" href="#contact" onClick={onTabClick}>
                  <span className="tab-dot" aria-hidden="true" />
                  <span className="tab-label">Contact</span>
                  <span className="tab-desc">email &amp; phone</span>
                </a>
              </nav>
            </div>

            <div className="ai-box h-[31rem] overflow-hidden">
              <ChatWidget />
            </div>
          </div>
        </section>

        <section id="projects" className="scroll-mt-24 space-y-8 mb-24">
          <h2 className="text-2xl font-medium mb-6">Projects</h2>
          <div className="space-y-10">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        <section id="ikap" className="scroll-mt-24 py-4 mb-24">
          <h2 className="text-2xl font-medium mb-6">Iklaina Archaeological Project</h2>
          <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0b0c11] p-5 md:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              <img
                src="/IKAP/dronephoto1.jpg"
                alt="Iklaina Archaeological Project master photo"
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr] lg:items-stretch">
              <div className="flex h-full flex-col justify-between gap-0 text-white leading-relaxed">
                <p>
                  For all eighteen years of my life, I have spent my summers in Greece, where I have gained extensive hands-on experience in archaeological fieldwork, digital documentation, and geospatial technologies. In my role as Geospatial Team Lead, I have worked with tools such as the Nikon total station, DJI drones, and 3D photogrammetric scanning systems to record, map, and visualize archaeological sites with precision. These experiences have strengthened my ability to think spatially, work with complex site data, and translate physical environments into accurate digital models. As an architecture student, I see these skills as directly applicable to architectural design, site analysis, surveying, digital modeling, and the integration of technology into the study of built environments.
                </p>

                <div className="mt-[25px] lg:w-full lg:h-[26rem] bg-white rounded-md overflow-hidden p-4">
                  <img
                    src="/IKAP/plan.jpeg"
                    alt="Iklaina Archaeological Project plan"
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-full object-cover object-center bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-start lg:justify-self-end w-full gap-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <img
                    src="/IKAP/dronephoto2.jpg"
                    alt="Iklaina Archaeological Project supporting photo 1"
                    loading="lazy"
                    decoding="async"
                    className="h-36 w-full object-cover md:h-44"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 lg:h-[26rem]">
                  <img
                    src="/IKAP/dronephoto3.jpg"
                    alt="Iklaina Archaeological Project supporting photo 2"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="scroll-mt-24 py-4 mb-24">
          <h2 className="text-2xl font-medium mb-6">Skills</h2>
          <div className="skill-tree-grid">
            {skillTrees.map(tree => (
              <article key={tree.title} className="skill-tree" aria-label={`${tree.title} tree`} tabIndex={0}>
                <div className="skill-tree-root">{tree.title}</div>
                <ul className="skill-tree-branches">
                  {tree.branches.map(branch => (
                    <li key={branch} className="skill-tree-node">{branch}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="personal" className="scroll-mt-24 py-4 mb-24">
          <h2 className="text-2xl font-medium mb-6">About Me</h2>
          <div className="about-flow">
            <figure className="about-photo about-photo-left" aria-hidden="true">
              <img src="/personal%20photos/prophoto1.jpeg" alt="studio sketches" loading="lazy" />
            </figure>

            <figure className="about-photo about-photo-right" aria-hidden="true">
              <img src="/personal%20photos/IMG_2399.jpg" alt="site photograph" loading="lazy" />
            </figure>

            <div className="about-text space-y-5 text-white leading-relaxed">
              <p>
                Hello! My name is Peter Cosmopoulos and I am a second-year architecture student at Tulane University with a passion for design, problem-solving, and the ways in which architecture shapes human experience. My work explores the relationship between form, function, and context, with an emphasis on creating spaces that are both visually compelling and responsive to the needs of their users. Through studio projects and independent design work, I continue to develop my skills in architectural visualization, digital modeling, and design communication.
              </p>
              <p>
                Beyond architecture, I compete internationally in powerlifting as a member of the Greek National Team. I hold four Greek national records and have ranked among the top lifters in my weight class worldwide. The discipline, resilience, and long-term commitment required in competitive athletics have strongly influenced my approach to design, teaching me the value of consistency, attention to detail, and continuous improvement. I am particularly interested in the intersection of architecture, technology, and visualization, and I enjoy exploring new tools that expand the possibilities of design. Whether developing conceptual ideas, creating detailed models, or producing visual presentations, I approach every project with curiosity and a commitment to thoughtful, purposeful design. My goal is to build a career that combines technical excellence, creativity, and meaningful contributions to the built environment.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 py-4">
          <h2 className="text-2xl font-medium mb-6">Contact</h2>
          <p className="text-gray-700">Email: <a className="text-accent" href={`mailto:${profile.email}`}>{profile.email}</a></p>
          {profile.phone && <p className="text-gray-700">Phone: <a className="text-accent" href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}>{profile.phone}</a></p>}
        </section>
      </main>

      <Footer />
    </div>
  )
}
