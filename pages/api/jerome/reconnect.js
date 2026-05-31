import jeromeState from '../../../lib/jeromeState'

export default async function handler(req, res){
  try{
    // clear provider cooldowns so next request can attempt remote providers immediately
    globalThis.__groqCooldownUntil = 0
    globalThis.__geminiCooldownUntil = 0
    const lastGroqKey = globalThis.__lastGroqKey || null
    const lastGeminiKey = globalThis.__lastGeminiKey || null
    const groqKey = process.env.GROQ_API_KEY || null
    const geminiKey = process.env.GEMINI_API_KEY || null
    const groqAvailable = Boolean(groqKey && String(groqKey).trim())
    const geminiAvailable = Boolean(geminiKey && String(geminiKey).trim())

    try{
      await jeromeState.updateState({ groqCooldownUntil: 0, geminiCooldownUntil: 0, lastGroqKey: groqKey || lastGroqKey, lastGeminiKey: geminiKey || lastGeminiKey })
    }catch(e){}

    res.status(200).json({
      ok: true,
      message: 'cleared provider cooldowns',
      groqAvailable,
      geminiAvailable,
      lastGroqKey,
      lastGeminiKey,
      currentGroqKeyPresent: !!groqKey,
      currentGeminiKeyPresent: !!geminiKey
    })
  }catch(e){
    res.status(500).json({ok:false, error: String(e)})
  }
}
