import { create } from 'zustand'
import { fetchServerState, saveServerState } from '../../lib/api'
import { useAuthStore } from '../auth/store'

export type ChoreCategory = 'food' | 'sleep' | 'bio' | 'entertainment' | 'health'

export interface ChoreItem {
  id: string
  title: string
  description?: string
  lastCompletedDate: string // YYYY-MM-DD when last completed
  sortOrder: number
  category: ChoreCategory
  estimatedMinutes?: number
  captainUsername?: string
  lastCompletedBy?: string
  lastCompletedAtIso?: string
}

interface ChoresState {
  chores: ChoreItem[]
  choresToday: () => Array<ChoreItem & { done: boolean }>
  toggleChore: (id: string) => void
  addChore: (input: { title: string; description?: string; category?: ChoreCategory; estimatedMinutes?: number; captainUsername?: string }) => void
  deleteChore: (id: string) => void
}

function todayStr(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const useChoresStore = create<ChoresState>()((set, get) => ({
  chores: [
    { id: 'wake-baby', title: 'Wake up baby', lastCompletedDate: '', sortOrder: 1, category: 'sleep', estimatedMinutes: 5, captainUsername: 'eddie' },
    { id: 'feed-baby', title: 'Feed baby', lastCompletedDate: '', sortOrder: 2, category: 'food', estimatedMinutes: 20, captainUsername: 'eddie' },
    { id: 'sleep-baby', title: 'Put baby to sleep', lastCompletedDate: '', sortOrder: 3, category: 'sleep', estimatedMinutes: 15, captainUsername: 'eddie' },
  ],
  choresToday: () =>
    get()
      .chores.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ ...c, done: c.lastCompletedDate === todayStr() })),
  toggleChore: (id) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const today = todayStr()
      const currentUser = useAuthStore.getState().currentUser ?? undefined
      const nowIso = new Date().toISOString()
      const next = state.chores.map((c) => {
        if (c.id !== id) return c
        const isUndo = c.lastCompletedDate === today
        if (isUndo) return { ...c, lastCompletedDate: '', lastCompletedBy: undefined, lastCompletedAtIso: undefined }
        return { ...c, lastCompletedDate: today, lastCompletedBy: currentUser, lastCompletedAtIso: nowIso }
      })
      void pushChoresToServer(next)
      return { chores: next }
    }),
  addChore: (input) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const clean = input.title.trim()
      if (!clean) return state
      const next: ChoreItem = {
        id: `chore-${crypto.randomUUID()}`,
        title: clean,
        description: input.description,
        lastCompletedDate: '',
        sortOrder: state.chores.length ? Math.max(...state.chores.map((c) => c.sortOrder)) + 1 : 1,
        category: input.category ?? 'bio',
        estimatedMinutes: input.estimatedMinutes,
        captainUsername: input.captainUsername,
      }
      const updated = [...state.chores, next]
      void pushChoresToServer(updated)
      return { chores: updated }
    }),
  deleteChore: (id) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const updated = state.chores.filter((c) => c.id !== id)
      void pushChoresToServer(updated)
      return { chores: updated }
    }),
}))

async function pushChoresToServer(nextChores: ChoreItem[]): Promise<void> {
  try {
    const server = await fetchServerState()
    await saveServerState({ ...server, chores: nextChores })
  } catch {
    // ignore network errors for now
  }
}

// hydrate from server on module load
void (async function initializeFromServer() {
  try {
    const server = await fetchServerState()
    const chores: ChoreItem[] = Array.isArray(server.chores) ? (server.chores as ChoreItem[]) : []
    if (chores.length > 0) useChoresStore.setState({ chores })
    // ensure server has chores (if empty, keep whatever server had)
    try {
      await saveServerState({ ...server, chores: chores.length > 0 ? chores : (useChoresStore.getState().chores) })
    } catch {}
  } catch {
    // server not available yet; keep defaults
  }
})()


