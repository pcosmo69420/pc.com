const http = require('http')
const { spawn } = require('child_process')
const fs = require('fs')

const URL = process.env.WATCHDOG_URL || 'http://localhost:3000/api/ask'
const INTERVAL_MS = Number(process.env.WATCHDOG_INTERVAL_MS) || 8000
const LOGFILE = process.env.WATCHDOG_LOG || 'watchdog.log'

function log(...args){
  const line = `[${new Date().toISOString()}] ` + args.join(' ') + '\n'
  try{ fs.appendFileSync(LOGFILE, line) }catch(e){}
  console.log(...args)
}

function checkAlive(){
  return new Promise(resolve => {
    const req = http.request(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => resolve(res.statusCode === 200))
    })
    req.on('error', () => resolve(false))
    req.write(JSON.stringify({ question: 'watchdog ping' }))
    req.end()
  })
}

let restarting = false

async function ensure(){
  try{
    const alive = await checkAlive()
    if(alive){
      log('watchdog: api healthy')
      return
    }
    if(restarting){
      log('watchdog: already restarting')
      return
    }
    restarting = true
    log('watchdog: api not responding, starting dev server')
    const child = spawn('npm run dev', { shell: true, detached: true, stdio: 'ignore' })
    child.unref()
    // give some time for server to boot
    await new Promise(r => setTimeout(r, 5000))
    const ok = await checkAlive()
    if(ok) log('watchdog: server started successfully')
    else log('watchdog: failed to start server')
  }catch(err){
    log('watchdog: error', String(err))
  }finally{ restarting = false }
}

log('watchdog: starting, will poll', URL, 'every', INTERVAL_MS, 'ms')
ensure()
setInterval(ensure, INTERVAL_MS)
