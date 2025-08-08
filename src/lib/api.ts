export type ServerState = {
  baby: { name: string; birthDateIso: string; photoUrl?: string; weightLbs?: number }
  milestones: any[]
  chores?: any[]
  users: { username: string; password: string }[]
}

const BASE = ''

export async function fetchServerState(): Promise<ServerState> {
  const res = await fetch(`${BASE}/api/state`, { credentials: 'same-origin' })
  if (!res.ok) throw new Error('Failed to fetch state')
  return res.json()
}

export async function saveServerState(state: ServerState): Promise<void> {
  const res = await fetch(`${BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
    credentials: 'same-origin',
  })
  if (!res.ok) throw new Error('Failed to save state')
}

export async function apiLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'same-origin',
  })
  if (!res.ok) return false
  const data = await res.json()
  return !!data?.ok
}


