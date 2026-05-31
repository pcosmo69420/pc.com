import projects from '../../data/projects.json'
import profile from '../../data/profile.json'
import jeromeReference from '../../data/jerome_reference.json'
import jeromeState from '../../lib/jeromeState'

const ASSISTANT_NAME = 'Jerome'
const ASSISTANT_PROFILE = {
  name: ASSISTANT_NAME,
  personality: 'extremely friendly, warm, playful, concise, and super chill like two frat bros texting each other',
  activeStatus: 'always active',
  sleepStatus: 'never sleeps',
  joke: 'Many say he is Batman.'
}

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','but','by','for','from','how','i','in','is','it','me','my','of','on','or','our','tell','that','the','their','this','to','was','what','when','where','which','who','with','work','you','your'
])

function tokenize(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
}

function projectText(project){
  const sections = Array.isArray(project.sections) ? project.sections.map(section => `${section.title} ${section.body}`).join(' ') : ''
  const highlights = Array.isArray(project.highlights) ? project.highlights.join(' ') : ''
  const materials = Array.isArray(project.materials) ? project.materials.join(' ') : ''
  const referenceText = project.referenceText || ''
  return [project.title, project.competition, project.year, project.desc, project.summary, project.details, referenceText, sections, highlights, materials].filter(Boolean).join(' ')
}

function scoreProject(question, project){
  const questionWords = new Set(tokenize(question))
  const haystack = projectText(project).toLowerCase()
  let score = 0

  questionWords.forEach(word => {
    if(haystack.includes(word)) score += word.length > 5 ? 2 : 1
  })

  if(questionWords.has(String(project.id))) score += 3
  if(questionWords.has(project.title.toLowerCase())) score += 6

  return score
}

function profileSummary(){
  return {
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 8) : [],
    software: Array.isArray(profile.software) ? profile.software.slice(0, 8) : [],
    nationality: profile.nationality,
    education: profile.education,
    powerlifting: profile.powerlifting ? {
      divisions: Array.isArray(profile.powerlifting.divisions) ? profile.powerlifting.divisions : [],
      records: profile.powerlifting.records,
      rank: profile.powerlifting.rank,
      lifts: profile.powerlifting.lifts
    } : null,
    contact: {
      email: profile.email,
      phone: profile.phone
    }
  }
}

function projectSummary(project){
  return {
    id: project.id,
    title: project.title,
    year: project.year,
    competition: project.competition,
    desc: project.desc,
    summary: project.summary,
    referenceText: project.referenceText || '',
    highlights: Array.isArray(project.highlights) ? project.highlights.slice(0, 3) : [],
    sections: Array.isArray(project.sections) ? project.sections.slice(0, 2).map(section => ({ title: section.title, body: section.body })) : []
  }
}

function knowledgeBundle(){
  return {
    profile: profileSummary(),
    projects: Array.isArray(projects) ? projects.map(projectSummary) : []
  }
}

function normalizeHistory(history){
  if(!Array.isArray(history)) return []
  return history
    .slice(-8)
    .map(message => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      text: String(message?.text || '').trim()
    }))
    .filter(message => message.text)
}

function lastUserMessage(history){
  for(let index = history.length - 1; index >= 0; index -= 1){
    if(history[index]?.role === 'user') return history[index].text
  }
  return ''
}

const recentReplies = globalThis.__pccomRecentReplies || (globalThis.__pccomRecentReplies = [])
const replyCounter = globalThis.__pccomReplyCounter || (globalThis.__pccomReplyCounter = { value: 0 })

function normalizeReply(text){
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function splitSentences(text){
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)
}

function normalizeSectionTitle(title){
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isArithmeticQuestion(question){
  const q = String(question || '').toLowerCase()
  return /\b(calculate|compute|evaluate|solve|what is|what's|whats|how much is)\b/.test(q) || /[0-9][0-9\s+\-*/().^=×÷x]+[0-9)]/.test(q)
}

function extractArithmeticExpression(question){
  let expression = String(question || '').toLowerCase().replace(/,/g, ' ')
  expression = expression
    .replace(/\b(what is|what's|whats|calculate|compute|evaluate|solve|how much is|equals?|equal to)\b/g, ' ')
    .replace(/[×x]/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .replace(/[^0-9+\-*/().\s*]/g, ' ')
    .replace(/\s+/g, '')

  if(!/[0-9]/.test(expression)) return null
  if(!/^[0-9+\-*/().*]+$/.test(expression)) return null
  return expression
}

function formatArithmeticResult(value){
  if(typeof value !== 'number' || !Number.isFinite(value)) return null
  if(Math.abs(value - Math.round(value)) < 1e-10) return String(Math.round(value))
  return String(Number(value.toFixed(8)))
}

function answerArithmeticQuestion(question){
  if(!isArithmeticQuestion(question)) return null

  const expression = extractArithmeticExpression(question)
  if(!expression) return null

  try{
    const result = Function(`"use strict"; return (${expression});`)()
    return formatArithmeticResult(result)
  }catch{
    return null
  }
}

function pickRelevantSection(project, question){
  const sections = Array.isArray(project?.sections) ? project.sections : []
  if(sections.length === 0) return null

  const questionWords = tokenize(question)
  let best = null
  let bestScore = 0

  for(const section of sections){
    const haystack = `${section.title || ''} ${section.body || ''}`.toLowerCase()
    let score = 0

    questionWords.forEach(word => {
      if(haystack.includes(word)) score += word.length > 5 ? 3 : 1
    })

    const title = normalizeSectionTitle(section.title)
    if(title && questionWords.some(word => title.includes(word))) score += 6

    if(score > bestScore){
      bestScore = score
      best = section
    }
  }

  return bestScore > 0 ? best : null
}

function cleanSummaryText(text){
  return String(text || '')
    .replace(/\b(the|a|an)\s+(project|design|structure|building|system)\b/gi, match => match)
    .replace(/\b(Harmattan)\s+season\b/gi, 'Harmattan season')
    .replace(/\bVitamin D\b/gi, 'vitamin D')
    .replace(/\bBernoulli’s\b/gi, "Bernoulli's")
    .replace(/\s+/g, ' ')
    .trim()
}

function paraphraseBody(text){
  return cleanSummaryText(String(text || ''))
    .replace(/\s+/g, ' ')
    .trim()
}

function summarizeSection(section){
  if(!section) return ''

  const title = String(section.title || '').trim()
  const lowerTitle = normalizeSectionTitle(title)
  const body = paraphraseBody(section.body || '')

  if(lowerTitle.includes('daylight')){
    return `${title}: it uses three daylight zones, with a meshed courtyard for the main exposure, thatch screens for softer light, and a doum-palm layer that filters the harshest sun while still allowing useful daylight.`
  }

  if(lowerTitle.includes('ventilation') || lowerTitle.includes('sandstorm') || lowerTitle.includes('wind')){
    return `${title}: the design turns Sahel winds into controlled ventilation, facing northeast, filtering sand at the ramp, and speeding airflow through the interior to keep temperatures down.`
  }

  if(/material|earth|adobe|thatch|palm|wood/i.test(lowerTitle + ' ' + body)){
    return `${title}: it relies on local earth-based materials like adobe, wood, palm leaf, and thatch to keep the shelter climate-responsive and regionally grounded.`
  }

  if(/modular|cluster|scal|form|biomorphic/i.test(lowerTitle + ' ' + body)){
    return `${title}: it supports a modular biomorphic form that can be repeated, grouped, and adapted while staying lightweight and climate-aware.`
  }

  const sentences = splitSentences(body)
  const lead = sentences[0] || body
  const extra = sentences.slice(1).find(sentence => /daylight|vent|wind|heat|courtyard|sand|orientation|filtration|airflow|material|modular/i.test(sentence)) || ''
  const parts = [
    title ? `${title}:` : '',
    lead,
    extra && extra !== lead ? extra : ''
  ].filter(Boolean)

  return parts.join(' ')
}

function composeUniqueAnswer(parts){
  const cleaned = parts.map(part => cleanSummaryText(part)).filter(Boolean)
  return cleaned.join(' ').trim()
}

function uniqueReplyVariants(coreText, question){
  const finalText = composeUniqueAnswer([coreText])
  const signature = normalizeReply(finalText)
  replyCounter.value += 1
  recentReplies.push(signature)
  if(recentReplies.length > 30) recentReplies.shift()
  return finalText
}

function revealCoachRequested(question){
  if(!question) return false
  const q = String(question).toLowerCase()
  return /coach|powerlift|powerlifting|nick|michalopoulos/.test(q)
}

function scrubCoachName(answer, question){
  if(!answer) return answer
  if(revealCoachRequested(question)) return answer
  // remove explicit coach full-name mentions unless the question asks about coach
  return String(answer).replace(/\bNick Michalopoulos\b/gi, 'his coach').replace(/\s+,/g,',').replace(/\s+/g,' ').trim()
}

function limitWords(text, maxWords = 75){
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  if(words.length <= maxWords) return words.join(' ')
  return `${words.slice(0, maxWords).join(' ')}...`
}

function condenseText(text, maxWords = 50){
  const sentences = splitSentences(text)
  if(sentences.length === 0) return ''

  const keywords = ['heat', 'daylight', 'vitamin d', 'harmattan', 'ventilation', 'sand', 'bernoulli', 'materials', 'modular']
  const picked = [sentences[0]]

  for(const sentence of sentences.slice(1)){
    const lower = sentence.toLowerCase()
    if(keywords.some(keyword => lower.includes(keyword))){
      picked.push(sentence)
    }
    if(limitWords(picked.join(' '), maxWords).endsWith('...')) break
  }

  return limitWords(picked.join(' '), maxWords)
}

function customerify(text){
  let updated = cleanSummaryText(String(text || ''))
  updated = updated
    .replace(/\byeah\b[, ]*/gi, '')
    .replace(/\ball good\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if(!updated) return 'Absolutely! I would love to help. Please share a bit more context so I can give you a clear, cheerful answer.'
  if(!/[.!?]$/.test(updated)) updated = `${updated}.`
  return updated
}

function makeUniqueReply(baseText){
  return uniqueReplyVariants(customerify(baseText), '')
}

function buildLocalAnswer(question){
  const q = String(question || '').toLowerCase()
  const arithmeticAnswer = answerArithmeticQuestion(question)
  if(arithmeticAnswer) return arithmeticAnswer

  if(q.includes('who are you') || q.includes('what are you') || q.includes('about yourself') || q.includes('tell me about jerome') || q === 'jerome' || q.includes('your name')){
    return uniqueReplyVariants(`I’m Jerome — a friendly, playful portfolio assistant. I’m always active, I never sleep, and I answer questions about Peter, the projects, and myself.`, question)
  }

  if(q.includes('do you sleep') || q.includes('never sleep') || q.includes('always active') || q.includes('batman')){
    return uniqueReplyVariants(`I’m always active, I never sleep, and yes, many say I’m Batman.`, question)
  }

  const projectList = Array.isArray(projects) ? projects : []
  const sahelianProject = projectList.find(project => String(project.title || '').toLowerCase().includes('sahelian heatbreaker'))

  const projectMatch = projectList
    .map(project => ({ project, score: scoreProject(question, project) }))
    .sort((a, b) => b.score - a.score)[0]

  if(projectMatch && projectMatch.score > 0){
    const project = projectMatch.project
    const matchedSection = pickRelevantSection(project, question)
    const sectionSummary = summarizeSection(matchedSection)
    const base = [
      matchedSection ? sectionSummary : cleanSummaryText(project.summary || project.details || project.desc || ''),
      !matchedSection && Array.isArray(project.highlights) ? project.highlights.slice(0, 2).join('. ') : ''
    ].filter(Boolean).join(' ')

    return uniqueReplyVariants(base, question)
  }

  if(sahelianProject && (q.includes('sahel') || q.includes('heatbreaker') || q.includes('harmattan') || q.includes('daylight capture') || q.includes('vitamin d') || q.includes('trombe') || q.includes('bernoulli'))){
    const matchedSection = pickRelevantSection(sahelianProject, question)
    const base = matchedSection
      ? summarizeSection(matchedSection)
      : cleanSummaryText(sahelianProject.summary || sahelianProject.details || sahelianProject.desc || '')
    return uniqueReplyVariants(base, question)
  }

  if(q.includes('email') || q.includes('contact') || q.includes('reach') || q.includes('get in touch')){
    return uniqueReplyVariants(`${profile.name} can be reached at ${profile.email}. He’s an ${profile.title} and knows ${profile.skills.join(', ')}.`, question)
  }

  if(q.includes('who are you') || q.includes('about you') || q.includes('tell me about peter')){
    return uniqueReplyVariants(`${profile.name} is an ${profile.title}. ${profile.bio} He’s ${profile.age} and turns ${profile.turnsAge} on ${profile.birthday}. His vibe is ${profile.skills.join(', ')}.`, question)
  }

  if(q.includes('skills') || q.includes('software') || q.includes('tools')){
    return uniqueReplyVariants(`${profile.name}'s main skills are ${profile.skills.join(', ')}, plus ${profile.software.join(', ')}. He’s studying ${profile.education} and stays locked in on architecture design, sketching, and diagramming.`, question)
  }

  if(q.includes('powerlifting') || q.includes('lifting') || q.includes('squat') || q.includes('bench') || q.includes('deadlift') || q.includes('total')){
    return uniqueReplyVariants(`${profile.name} is on the Greek national team, competes in the ${profile.powerlifting.divisions.join(' and ')} divisions, has ${profile.powerlifting.records} Greek national records, and sits top 20 in the world in his division. Best lifts: ${profile.powerlifting.lifts.squat} squat, ${profile.powerlifting.lifts.pausedBench} paused bench, ${profile.powerlifting.lifts.deadlift} deadlift, for a ${profile.powerlifting.lifts.total} total.`, question)
  }

  if(q.includes('greek') || q.includes('greece') || q.includes('language')){
    return uniqueReplyVariants(`${profile.name} speaks Greek fluently and lived there when he was younger. He’s ${profile.nationality}.`, question)
  }

  if(q.includes('neoclass') || q.includes('architecture style') || q.includes('taste')){
    return uniqueReplyVariants(`He’s big on neoclassicism, especially where it meets clean structure and serious craft. Long-term goal is to own his own firm.`, question)
  }

  if(q.includes('project') || q.includes('work')){
    return uniqueReplyVariants(projectList.map(project => `${project.title}: ${cleanSummaryText(project.desc || project.summary || project.details || '')}`).filter(Boolean).join(' '), question)
  }

  return null
}

function buildGeneralFallback(question){
  const q = String(question || '').toLowerCase()

  if(q.includes('advice') || q.includes('how should') || q.includes('what should') || q.includes('opinion') || q.includes('think about') || q.includes('recommend')){
    return uniqueReplyVariants(`Start with the goal, then choose the smallest next step that moves it forward. I’ll help you make it feel easy.`, question)
  }

  if(/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)\b/i.test(String(question || '').trim())){
    return uniqueReplyVariants(`Hello — I’m Jerome. Ask me about a project, Peter, or anything else, and I’ll keep it clear and friendly.`, question)
  }

  if(q.includes('how are you') || q.includes('how’s it going') || q.includes('how is it going') || q.includes('how r you')){
    return uniqueReplyVariants(`I’m great — warm, ready, and active.`, question)
  }

  if(q.includes('thanks') || q.includes('thank you')){
    return uniqueReplyVariants(`You’re very welcome — I’m happy to help.`, question)
  }

  if(q.includes('explain') || q.includes('how does') || q.includes('why does') || q.includes('what is') || q.includes('what are')){
    return uniqueReplyVariants(`I can answer, but I need a little more detail to stay accurate. Give me the specifics and I’ll make it crisp.`, question)
  }

  return uniqueReplyVariants(`I don’t know from the site data alone. Ask about a project, Peter, Jerome, or a specific topic.`, question)
}

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { question, history } = req.body || {}
  if(!question) return res.status(400).json({ error: 'question required' })

  // ensure persisted provider state is loaded so cooldowns and keys survive restarts
  try{ await jeromeState.loadState() }catch(e){}

  const GROQ_KEY = process.env.GROQ_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  const groqAvailable = Boolean(GROQ_KEY && String(GROQ_KEY).trim())
  // Consider gemini available only when a non-empty key is provided
  const geminiAvailable = Boolean(GEMINI_KEY && String(GEMINI_KEY).trim())
  // If a new valid key appears, clear any previous cooldown so provider calls are retried immediately.
  try{
    if(groqAvailable){
      const lastGroqKey = globalThis.__lastGroqKey || ''
      if(String(lastGroqKey) !== String(GROQ_KEY)){
        globalThis.__groqCooldownUntil = 0
        globalThis.__lastGroqKey = GROQ_KEY
        try{ await jeromeState.updateState({ lastGroqKey: String(GROQ_KEY), groqCooldownUntil: globalThis.__groqCooldownUntil }) }catch(e){}
      }
    }
    if(geminiAvailable){
      const lastKey = globalThis.__lastGeminiKey || ''
      if(String(lastKey) !== String(GEMINI_KEY)){
        globalThis.__geminiCooldownUntil = 0
        globalThis.__lastGeminiKey = GEMINI_KEY
        try{ await jeromeState.updateState({ lastGeminiKey: String(GEMINI_KEY), geminiCooldownUntil: globalThis.__geminiCooldownUntil }) }catch(e){}
      }
    }
  }catch(e){}
  const chatHistory = normalizeHistory(history)
  const localAnswer = buildLocalAnswer(question)

  // Arithmetic stays deterministic and local.
  const arithmeticAnswer = answerArithmeticQuestion(question)
  if(arithmeticAnswer) return res.status(200).json({ answer: arithmeticAnswer, mode: 'local', groqAvailable, geminiAvailable })

  // If no remote provider key is configured, answer locally.
  if(!groqAvailable && !geminiAvailable){
    if(localAnswer) return res.status(200).json({ answer: localAnswer, mode: 'local', groqAvailable, geminiAvailable })
    return res.status(200).json({ answer: buildGeneralFallback(question), mode: 'local', groqAvailable, geminiAvailable })
  }

  const knowledge = knowledgeBundle()
  const knowledgeText = [
    `Profile: ${knowledge.profile.name} is ${knowledge.profile.title}. ${knowledge.profile.bio}`,
    `Site owner: Peter is an architecture student and a second-year student at Tulane University.`,
    `Assistant: ${ASSISTANT_PROFILE.name} is a ${ASSISTANT_PROFILE.personality} assistant who is ${ASSISTANT_PROFILE.activeStatus}, ${ASSISTANT_PROFILE.sleepStatus}, and ${ASSISTANT_PROFILE.joke}`,
    `Reference: ${Object.keys(jeromeReference).map(k=> `${k}: ${JSON.stringify(jeromeReference[k])}`).join(' | ')}`,
    `Skills: ${Array.isArray(knowledge.profile.skills) ? knowledge.profile.skills.join(', ') : ''}`,
    `Software: ${Array.isArray(knowledge.profile.software) ? knowledge.profile.software.join(', ') : ''}`,
    ...knowledge.projects.map(project => {
      const sections = Array.isArray(project.sections) && project.sections.length > 0
        ? project.sections.map(section => `${section.title}: ${section.body}`).join(' | ')
        : ''
      const highlights = Array.isArray(project.highlights) ? project.highlights.join('; ') : ''
      return [`Project: ${project.title}`, project.competition ? `Competition: ${project.competition}` : '', project.summary ? `Summary: ${project.summary}` : '', sections ? `Sections: ${sections}` : '', highlights ? `Highlights: ${highlights}` : ''].filter(Boolean).join(' | ')
    })
  ].filter(Boolean).join('\n')

  const prompt = `Answer the user's question using the knowledge below.
- Be extremely friendly, warm, and lightly playful.
- Speak as Jerome.
- Use the knowledge as background, but do not copy it verbatim.
- Reason from the facts when the answer is not stated directly.
- If the question is about Peter, the portfolio, Jerome, or the projects, stay grounded in the provided knowledge and synthesize your own wording.
- If a site-specific fact is missing, say "I don't know".
- For general questions, answer normally.

Additional constraints:
- Never use hyphens (the '-' character) in your responses; avoid hyphenation.
- Treat the person asking questions as a site visitor, not Peter, unless they clearly say they are Peter.
- Speak to visitors in a neutral way without assuming personal identity.

Memorize the reference sheet below and use it as background knowledge. Do not quote the reference verbatim; paraphrase and synthesize so Jerome rarely quotes directly. Use the facts to reason and support your answers.

Knowledge:\n${knowledgeText}\n\nQuestion: ${question}`

  const groqCooldownUntil = globalThis.__groqCooldownUntil || 0
  const geminiCooldownUntil = globalThis.__geminiCooldownUntil || 0
  let groqError = null

  if(groqAvailable && Date.now() >= groqCooldownUntil){
    try{
      const maxAttempts = 3
      let attempt = 0
      while(attempt < maxAttempts){
        attempt += 1
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

        try{
          const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
          const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GROQ_KEY}`
            },
            signal: controller.signal,
            body: JSON.stringify({
              model,
              temperature: 0.2,
              max_tokens: 240,
              messages: [
                {
                  role: 'system',
                  content: 'You are Jerome, a super chill, extremely friendly, warm, playful, concise portfolio assistant. Sound like two frat bros texting each other: relaxed, casual, and friendly. Answer directly and do not add filler. Treat the person asking questions as a site visitor, not Peter, unless they clearly say they are Peter. Speak to visitors in a neutral way and do not assume they are the site owner. Use the provided knowledge as background, but do not copy it verbatim. For questions about Peter, the portfolio, Jerome, or the projects, synthesize your own wording from the facts. If a site-specific fact is missing, say "I don\'t know". For general questions, answer normally. For arithmetic, calculate exactly. Never use hyphens in your responses.'
                },
                ...chatHistory.map(message => ({
                  role: message.role,
                  content: message.text
                })),
                { role: 'user', content: prompt }
              ]
            })
          })

          clearTimeout(timeout)
          const data = await r.json()

          if(!r.ok){
            const message = data?.error?.message || `Groq request failed with status ${r.status}`
            groqError = message

            if(/quota|rate limit|rate-limit|exceeded|too many requests|429/i.test(message) || r.status === 429){
              globalThis.__groqCooldownUntil = Date.now() + 2 * 60 * 1000
              try{ await jeromeState.updateState({ groqCooldownUntil: globalThis.__groqCooldownUntil }) }catch(e){}
              break
            }

            if(r.status >= 500 && attempt < maxAttempts){
              await new Promise(resolve => setTimeout(resolve, 600 * attempt))
              continue
            }
            break
          }

          const answerText = data?.choices?.[0]?.message?.content || ''
          let answer = answerText ? customerify(answerText) : (localAnswer || buildGeneralFallback(question))
          answer = scrubCoachName(answer, question)
          return res.status(200).json({ answer, mode: 'groq', groqAvailable, geminiAvailable })
        }catch(err){
          groqError = String(err)
          if(attempt < maxAttempts){
            await new Promise(resolve => setTimeout(resolve, 500 * attempt))
            continue
          }
          break
        }
      }
    }catch(err){
      groqError = String(err)
    }
  }

  // Respect an in-memory cooldown when Gemini reports quota or rate-limit errors.
  if(geminiAvailable && Date.now() < geminiCooldownUntil){
    if(localAnswer) return res.status(200).json({ answer: localAnswer, mode: 'local', groqAvailable, geminiAvailable, error: groqError || 'gemini cooldown active' })
    return res.status(200).json({ answer: buildGeneralFallback(question), mode: 'local', groqAvailable, geminiAvailable, error: groqError || 'gemini cooldown active' })
  }

  try{
    const maxAttempts = 3
    let attempt = 0
    let lastError = null

    while(attempt < maxAttempts){
      attempt += 1
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      try{
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: 'You are Jerome, a super chill, extremely friendly, warm, playful, concise portfolio assistant. Sound like two frat bros texting each other: relaxed, casual, and friendly. Answer directly and do not add filler. Treat the person asking questions as a site visitor, not Peter, unless they clearly say they are Peter. Speak to visitors in a neutral way and do not assume they are the site owner. Use the provided knowledge as background, but do not copy it verbatim. For questions about Peter, the portfolio, Jerome, or the projects, synthesize your own wording from the facts. If a site-specific fact is missing, say "I don\'t know". For general questions, answer normally. For arithmetic, calculate exactly. Never use hyphens in your responses.' }]
            },
            contents: [
              ...chatHistory.map(message => ({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: message.text }]
              })),
              { role: 'user', parts: [{ text: prompt }] }
            ],
            generationConfig: {
              maxOutputTokens: 140,
              temperature: 0.2
            }
          })
        })

        clearTimeout(timeout)

        const data = await r.json()

        if(!r.ok){
          const message = data?.error?.message || ''
          // For quota/rate-limit errors, set a long cooldown and do not retry
            if(/quota|rate limit|rate-limit|rate limit exceeded|exceeded your current quota/i.test(message)){
              globalThis.__geminiCooldownUntil = Date.now() + 5 * 60 * 1000 // 5 minute cooldown
              try{ await jeromeState.updateState({ geminiCooldownUntil: globalThis.__geminiCooldownUntil }) }catch(e){}
              return res.status(200).json({ answer: localAnswer || buildGeneralFallback(question), mode: 'fallback', groqAvailable, geminiAvailable, error: groqError || message })
            }

          // For server errors (5xx) treat as transient and retry
          if(r.status >= 500 && attempt < maxAttempts){
            lastError = message || `server error ${r.status}`
            await new Promise(r => setTimeout(r, 600 * attempt))
            continue
          }

          // Otherwise fall back
          return res.status(200).json({ answer: localAnswer || buildGeneralFallback(question), mode: 'fallback', groqAvailable, geminiAvailable, error: groqError || message || `Gemini request failed with status ${r.status}` })
        }

        const answerText = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('') || ''
        let answer = answerText ? customerify(answerText) : (localAnswer || buildGeneralFallback(question))
        answer = scrubCoachName(answer, question)
        return res.status(200).json({ answer, mode: 'gemini', groqAvailable, geminiAvailable })
      }catch(err){
        lastError = String(err)
        // transient network error: retry with backoff unless last attempt
        if(attempt < maxAttempts){
          await new Promise(r => setTimeout(r, 500 * attempt))
          continue
        }
        return res.status(200).json({ answer: localAnswer || buildGeneralFallback(question), mode: 'fallback', groqAvailable, geminiAvailable, error: groqError || lastError })
      }
    }
    // if we exit loop without returning, fall back
    return res.status(200).json({ answer: localAnswer || buildGeneralFallback(question), mode: 'fallback', groqAvailable, geminiAvailable, error: groqError || lastError || 'unknown' })
  }catch(err){
    const fallback = localAnswer || buildGeneralFallback(question)
    return res.status(200).json({ answer: fallback, mode: 'fallback', groqAvailable, geminiAvailable, error: groqError || String(err) })
  }
}
