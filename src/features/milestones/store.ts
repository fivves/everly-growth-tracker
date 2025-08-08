import { create } from 'zustand'
import { addMonths, differenceInMonths, parseISO } from 'date-fns'
import type { BabyProfile, MilestoneItem, MilestoneLevel } from './types'
import { defaultMilestones } from './seed'
import { useAuthStore } from '../auth/store'
import { fetchServerState, saveServerState } from '../../lib/api'

interface MilestoneState {
  baby: BabyProfile
  milestones: MilestoneItem[]
  setBabyWeight: (weightLbs: number) => void
  upsertMilestone: (item: Omit<MilestoneItem, 'id' | 'createdAtIso' | 'level' | 'levelHistory'> & { id?: string }) => void
  setLevel: (id: string, level: Exclude<MilestoneLevel, 'none'>) => void
  undoLevel: (id: string) => void
  setLevelHistory: (id: string, history: { level: Exclude<MilestoneLevel, 'none'>; timestampIso: string }[]) => void
  deleteMilestone: (id: string) => void
  archive: () => MilestoneItem[]
  upcoming: (limit?: number) => MilestoneItem[]
  completed: () => MilestoneItem[]
}

const initialBaby: BabyProfile = {
  name: 'Everly',
  // Born October 27, 2024 at 5:23 PM (local time)
  birthDateIso: '2024-10-27T17:23:00',
  photoUrl: 'https://placehold.co/600x600/FFE4E6/8B5CF6?text=Everly',
  weightLbs: 7.5,
}

function scoreForUpcoming(m: MilestoneItem, ageMonths: number): number {
  // Lower score = higher priority
  if (m.level === 'mastered') return 9999
  if (ageMonths > m.ageEndMonths) return -100 + (ageMonths - m.ageEndMonths) // late: float to very top
  if (ageMonths >= m.ageStartMonths && ageMonths <= m.ageEndMonths) return -10 // currently in window
  return m.ageStartMonths - ageMonths // upcoming soonest next
}

export const useMilestoneStore = create<MilestoneState>()((set, get) => ({
  baby: initialBaby,
  milestones: defaultMilestones,
  setBabyWeight: (weightLbs) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const nextBaby = { ...state.baby, weightLbs }
      void pushStateToServer(state.milestones, nextBaby)
      return { baby: nextBaby }
    }),
  upsertMilestone: (item) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const id = item.id ?? `custom-${crypto.randomUUID()}`
      const existingIndex = state.milestones.findIndex((m) => m.id === id)
      const base: MilestoneItem = {
        id,
        title: item.title,
        description: item.description,
        ageStartMonths: item.ageStartMonths,
        ageEndMonths: item.ageEndMonths,
        category: item.category,
        isCustom: true,
        createdBy: useAuthStore.getState().currentUser ?? 'eddie',
        level: existingIndex >= 0 ? state.milestones[existingIndex].level : 'none',
        levelHistory: existingIndex >= 0 ? state.milestones[existingIndex].levelHistory : [],
        createdAtIso:
          existingIndex >= 0 ? state.milestones[existingIndex].createdAtIso : new Date().toISOString(),
      }
      const next = [...state.milestones]
      if (existingIndex >= 0) next[existingIndex] = base
      else next.push(base)
      void pushStateToServer(next, state.baby)
      return { milestones: next }
    }),
  setLevel: (id, level) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const next = state.milestones.map((m) => {
        if (m.id !== id) return m
        const now = new Date().toISOString()
        const already = m.level === level
        const history = already ? m.levelHistory : [...m.levelHistory, { level, timestampIso: now }]
        return { ...m, level, levelHistory: history }
      })
      void pushStateToServer(next, state.baby)
      return { milestones: next }
    }),
  undoLevel: (id) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const next = state.milestones.map((m) => {
        if (m.id !== id) return m
        if (m.levelHistory.length === 0) return m
        const newHistory = m.levelHistory.slice(0, -1)
        const previousLevel: MilestoneLevel = newHistory.length > 0 ? newHistory[newHistory.length - 1].level : 'none'
        return { ...m, level: previousLevel, levelHistory: newHistory }
      })
      void pushStateToServer(next, state.baby)
      return { milestones: next }
    }),
  setLevelHistory: (id, history) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const sorted = [...history].sort((a, b) => new Date(a.timestampIso).getTime() - new Date(b.timestampIso).getTime())
      const finalLevel: MilestoneLevel = sorted.length > 0 ? sorted[sorted.length - 1].level : 'none'
      const next = state.milestones.map((m) => (m.id === id ? { ...m, level: finalLevel, levelHistory: sorted } : m))
      void pushStateToServer(next, state.baby)
      return { milestones: next }
    }),
  deleteMilestone: (id) =>
    set((state) => {
      if (!useAuthStore.getState().canEdit()) return state
      const target = state.milestones.find((m) => m.id === id)
      if (!target || !target.isCustom) return state
      const next = state.milestones.filter((m) => m.id !== id)
      void pushStateToServer(next, state.baby)
      return { milestones: next }
    }),
  archive: () => get().milestones.filter((m) => m.level !== 'none'),
  completed: () => get().milestones.filter((m) => m.level === 'mastered'),
  upcoming: (limit = 10) => {
    const baby = get().baby
    const ageMonths = differenceInMonths(new Date(), parseISO(baby.birthDateIso))
    const list = get().milestones
      .filter((m) => m.level !== 'mastered')
      .slice()
      .sort((a, b) => scoreForUpcoming(a, ageMonths) - scoreForUpcoming(b, ageMonths))
    return list.slice(0, limit)
  },
}))

export function getBabyAgeMonths(baby: BabyProfile): number {
  return differenceInMonths(new Date(), parseISO(baby.birthDateIso))
}

export function nextBirthday(baby: BabyProfile): Date {
  const birth = parseISO(baby.birthDateIso)
  const now = new Date()
  let next = new Date(birth)
  while (next <= now) next = addMonths(next, 12)
  return next
}

function mergeWithSeeds(existing: MilestoneItem[]): MilestoneItem[] {
  const merged = [...existing]
  for (const seed of defaultMilestones) {
    if (!merged.some((m) => m.id === seed.id)) {
      merged.push(seed)
    }
  }
  return merged
}

async function pushStateToServer(nextMilestones: MilestoneItem[], baby: BabyProfile): Promise<void> {
  try {
    const server = await fetchServerState()
    await saveServerState({ ...server, baby, milestones: nextMilestones })
  } catch {
    // ignore network/server errors silently for now
  }
}

// hydrate from server on module load
void (async function initializeFromServer() {
  try {
    const server = await fetchServerState()
    let milestones: MilestoneItem[]
    let baby: BabyProfile = server.baby ?? initialBaby
    if (Array.isArray(server.milestones) && server.milestones.length > 0) {
      milestones = mergeWithSeeds(server.milestones as MilestoneItem[])
    } else {
      // attempt one-time migration from previous localStorage if present
      try {
        const raw = localStorage.getItem('everly-milestones-v2')
        if (raw) {
          const parsed = JSON.parse(raw)
          const stateLike = parsed?.state ?? parsed
          if (Array.isArray(stateLike?.milestones)) {
            milestones = mergeWithSeeds(stateLike.milestones as MilestoneItem[])
            if (stateLike?.baby?.birthDateIso && stateLike?.baby?.name) {
              baby = stateLike.baby as BabyProfile
            }
          } else {
            milestones = defaultMilestones
          }
        } else {
          milestones = defaultMilestones
        }
      } catch {
        milestones = defaultMilestones
      }
    }
    useMilestoneStore.setState({ baby, milestones })
    // ensure server has the merged/seeded state so other devices see the same
    try { await saveServerState({ ...server, baby, milestones }) } catch {}
  } catch {
    // server not available yet; keep defaults
  }
})()
