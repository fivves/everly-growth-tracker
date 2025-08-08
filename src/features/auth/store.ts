import { create } from 'zustand'
import { apiLogin, fetchServerState, saveServerState } from '../../lib/api'

export type UserRecord = {
  username: string
  password: string
}

type AuthState = {
  users: UserRecord[]
  currentUser: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  addUser: (username: string, password: string) => Promise<void>
  removeUser: (username: string) => void
  changePassword: (username: string, newPassword: string) => Promise<void>
  canEdit: () => boolean
  isAdmin: () => boolean
}

const DEFAULT_ADMIN = 'eddie'
const DEFAULT_ADMIN_PASSWORD = 'eddie'

export const useAuthStore = create<AuthState>()((set, get) => ({
  users: [{ username: DEFAULT_ADMIN, password: DEFAULT_ADMIN_PASSWORD }],
  currentUser: null,
  login: async (username, password) => {
    // ask API first; if unavailable fall back to local users for dev
    let ok = false
    try {
      ok = await apiLogin(username, password)
    } catch {
      const user = get().users.find((u) => u.username === username && u.password === password)
      ok = !!user
    }
    if (!ok) return false
    // also load server users so Admin page reflects server truth
    try {
      const state = await fetchServerState()
      if (Array.isArray(state.users) && state.users.length > 0) set({ users: state.users })
      else set({ users: [{ username: 'eddie', password: 'eddie' }] })
    } catch {}
    set({ currentUser: username })
    return true
  },
  logout: () => set({ currentUser: null }),
  addUser: async (username, password) => {
    const { users } = get()
    if (users.some((u) => u.username === username)) return
    const next = [...users, { username, password }]
    set({ users: next })
    // push to server
    try {
      const server = await fetchServerState()
      await saveServerState({ ...server, users: next })
    } catch {}
  },
  removeUser: (username) => {
    if (username === DEFAULT_ADMIN) return
    const next = get().users.filter((u) => u.username !== username)
    set({ users: next })
    fetchServerState().then((server) => saveServerState({ ...server, users: next })).catch(() => {})
  },
  changePassword: async (username, newPassword) => {
    const actor = get().currentUser
    if (username === DEFAULT_ADMIN && actor !== DEFAULT_ADMIN) {
      return
    }
    const next = get().users.map((u) => (u.username === username ? { ...u, password: newPassword } : u))
    set({ users: next })
    try {
      const server = await fetchServerState()
      await saveServerState({ ...server, users: next })
    } catch {}
  },
  canEdit: () => get().currentUser != null,
  isAdmin: () => get().currentUser != null,
}))


