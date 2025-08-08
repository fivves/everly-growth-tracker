import { create } from 'zustand'
import { fetchServerState, saveServerState } from '../../lib/api'

export interface ChoreItem {
  id: string
  title: string
  lastCompletedDate: string // YYYY-MM-DD when last completed
  sortOrder: number
}

interface ChoresState {
  chores: ChoreItem[]
  choresToday: () => Array<ChoreItem & { done: boolean }>
  toggleChore: (id: string) => void
  addChore: (title: string) => void
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
    { id: 'wake-baby', title: 'Wake up baby', lastCompletedDate: '', sortOrder: 1 },
    { id: 'feed-baby', title: 'Feed baby', lastCompletedDate: '', sortOrder: 2 },
    { id: 'sleep-baby', title: 'Put baby to sleep', lastCompletedDate: '', sortOrder: 3 },
  ],
  choresToday: () =>
    get()
      .chores.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ ...c, done: c.lastCompletedDate === todayStr() })),
  toggleChore: (id) =>
    set((state) => {
      const today = todayStr()
      const next = state.chores.map((c) =>
        c.id === id ? { ...c, lastCompletedDate: c.lastCompletedDate === today ? '' : today } : c
      )
      void pushChoresToServer(next)
      return { chores: next }
    }),
  addChore: (title) =>
    set((state) => {
      const clean = title.trim()
      if (!clean) return state
      const next: ChoreItem = {
        id: `chore-${crypto.randomUUID()}`,
        title: clean,
        lastCompletedDate: '',
        sortOrder: state.chores.length ? Math.max(...state.chores.map((c) => c.sortOrder)) + 1 : 1,
      }
      const updated = [...state.chores, next]
      void pushChoresToServer(updated)
      return { chores: updated }
    }),
  deleteChore: (id) =>
    set((state) => {
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


