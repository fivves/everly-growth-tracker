import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const dataDir = '/data'
const stateFile = path.join(dataDir, 'state.json')
const defaultStatePath = path.join(process.cwd(), 'default-state.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
}

function readState() {
  ensureDataDir()
  if (!fs.existsSync(stateFile)) {
    const fallback = JSON.parse(fs.readFileSync(defaultStatePath, 'utf8'))
    fs.writeFileSync(stateFile, JSON.stringify(fallback, null, 2))
    return fallback
  }
  try {
    const raw = fs.readFileSync(stateFile, 'utf8')
    return JSON.parse(raw)
  } catch {
    const fallback = JSON.parse(fs.readFileSync(defaultStatePath, 'utf8'))
    fs.writeFileSync(stateFile, JSON.stringify(fallback, null, 2))
    return fallback
  }
}

function writeState(next) {
  ensureDataDir()
  fs.writeFileSync(stateFile, JSON.stringify(next, null, 2))
}

app.get('/health', (_req, res) => {
  res.type('text/plain').send('ok')
})

// Simple username/password auth stored with state
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {}
  const state = readState()
  const user = state.users.find(u => u.username === username)
  if (!user || user.password !== password) return res.status(401).json({ ok: false })
  res.set('Cache-Control', 'no-store')
  res.json({ ok: true })
})

// Fetch entire state (baby + milestones + users)
app.get('/api/state', (_req, res) => {
  const state = readState()
  res.set('Cache-Control', 'no-store')
  res.json(state)
})

// Replace entire state (idempotent sync)
app.put('/api/state', (req, res) => {
  const incoming = req.body
  if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error: 'invalid' })
  // very light validation
  if (!Array.isArray(incoming.milestones) || !incoming.baby) return res.status(400).json({ error: 'invalid' })
  writeState(incoming)
  res.set('Cache-Control', 'no-store')
  res.json({ ok: true })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`)
})


