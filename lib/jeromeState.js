import fs from 'fs'
import path from 'path'

const STATE_FILE = path.join(process.cwd(), 'data', 'jerome_state.json')

let cached = null

async function ensureFile(){
  try{
    await fs.promises.access(STATE_FILE)
  }catch(e){
    const initial = {
      groqCooldownUntil: 0,
      geminiCooldownUntil: 0,
      lastGroqKey: null,
      lastGeminiKey: null,
      updatedAt: Date.now()
    }
    await fs.promises.mkdir(path.dirname(STATE_FILE), { recursive: true })
    await fs.promises.writeFile(STATE_FILE, JSON.stringify(initial, null, 2), 'utf8')
    cached = initial
  }
}

async function loadState(){
  try{
    await ensureFile()
    const raw = await fs.promises.readFile(STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw || '{}')
    cached = Object.assign({ groqCooldownUntil: 0, geminiCooldownUntil: 0, lastGroqKey: null, lastGeminiKey: null }, parsed)
    // reflect into globalThis for older code paths
    try{ globalThis.__groqCooldownUntil = Number(cached.groqCooldownUntil) || 0 }catch(e){}
    try{ globalThis.__geminiCooldownUntil = Number(cached.geminiCooldownUntil) || 0 }catch(e){}
    try{ globalThis.__lastGroqKey = cached.lastGroqKey || '' }catch(e){}
    try{ globalThis.__lastGeminiKey = cached.lastGeminiKey || '' }catch(e){}
    return cached
  }catch(err){
    cached = { groqCooldownUntil: 0, geminiCooldownUntil: 0, lastGroqKey: null, lastGeminiKey: null }
    return cached
  }
}

async function saveState(state){
  const toWrite = Object.assign({ groqCooldownUntil: 0, geminiCooldownUntil: 0, lastGroqKey: null, lastGeminiKey: null }, state)
  toWrite.updatedAt = Date.now()
  cached = toWrite
  await fs.promises.mkdir(path.dirname(STATE_FILE), { recursive: true })
  await fs.promises.writeFile(STATE_FILE, JSON.stringify(toWrite, null, 2), 'utf8')
  // reflect into globalThis for compatibility
  try{ globalThis.__groqCooldownUntil = Number(toWrite.groqCooldownUntil) || 0 }catch(e){}
  try{ globalThis.__geminiCooldownUntil = Number(toWrite.geminiCooldownUntil) || 0 }catch(e){}
  try{ globalThis.__lastGroqKey = toWrite.lastGroqKey || '' }catch(e){}
  try{ globalThis.__lastGeminiKey = toWrite.lastGeminiKey || '' }catch(e){}
  return toWrite
}

async function updateState(partial){
  const base = cached || (await loadState())
  const merged = Object.assign({}, base, partial)
  return await saveState(merged)
}

function getStateSync(){
  if(cached) return cached
  try{
    const raw = fs.readFileSync(STATE_FILE, 'utf8')
    cached = JSON.parse(raw || '{}')
    return cached
  }catch(e){
    return { groqCooldownUntil: 0, geminiCooldownUntil: 0, lastGroqKey: null, lastGeminiKey: null }
  }
}

export default { loadState, saveState, updateState, getStateSync }
