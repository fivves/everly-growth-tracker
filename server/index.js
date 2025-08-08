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
const DEFAULT_ADMIN = { username: 'eddie', password: 'eddie' }

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
}

function normalizeState(state) {
  const next = {
    baby: { name: 'Everly', birthDateIso: '2024-10-27T17:23:00', photoUrl: 'https://placehold.co/600x600/FFE4E6/8B5CF6?text=Everly', weightLbs: 7.5 },
    milestones: [],
    chores: [],
    users: [DEFAULT_ADMIN],
  }
  if (state && typeof state === 'object') {
    next.baby = state.baby ? { ...next.baby, ...state.baby } : next.baby
    next.milestones = Array.isArray(state.milestones) ? state.milestones : []
    next.chores = Array.isArray(state.chores)
      ? state.chores.map(c => ({ category: 'bio', ...c }))
      : []
    const incomingUsers = Array.isArray(state.users) ? state.users : []
    const hasDefault = incomingUsers.some(u => u.username === DEFAULT_ADMIN.username)
    next.users = hasDefault ? incomingUsers : [DEFAULT_ADMIN, ...incomingUsers]
  }
  return next
}

function readState() {
  ensureDataDir()
  if (!fs.existsSync(stateFile)) {
    const fallback = JSON.parse(fs.readFileSync(defaultStatePath, 'utf8'))
    const normalized = normalizeState(fallback)
    fs.writeFileSync(stateFile, JSON.stringify(normalized, null, 2))
    return normalized
  }
  try {
    const raw = fs.readFileSync(stateFile, 'utf8')
    const normalized = normalizeState(JSON.parse(raw))
    // persist normalization (ensures default admin exists)
    fs.writeFileSync(stateFile, JSON.stringify(normalized, null, 2))
    return normalized
  } catch {
    const fallback = JSON.parse(fs.readFileSync(defaultStatePath, 'utf8'))
    const normalized = normalizeState(fallback)
    fs.writeFileSync(stateFile, JSON.stringify(normalized, null, 2))
    return normalized
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

const port = process.env.PORT || 9379
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`)
})


