const http = require('http')

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ask',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}

const req = http.request(options, res => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log(data)
  })
})

req.on('error', err => console.error('error', err))
req.write(JSON.stringify({ question: 'Ping from ping-api.js' }))
req.end()
