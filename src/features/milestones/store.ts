import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addMonths, differenceInMonths, parseISO } from 'date-fns'
import type { BabyProfile, MilestoneItem, MilestoneLevel } from './types'
import { defaultMilestones } from './seed'
import { useAuthStore } from '../auth/store'

interface MilestoneState {
  baby: BabyProfile
  milestones: MilestoneItem[]
  upsertMilestone: (item: Omit<MilestoneItem, 'id' | 'createdAtIso' | 'level' | 'levelHistory'> & { id?: string }) => void
  setLevel: (id: string, level: Exclude<MilestoneLevel, 'none'>) => void
  undoLevel: (id: string) => void
  setLevelHistory: (id: string, history: { level: Exclude<MilestoneLevel, 'none'>; timestampIso: string }[]) => void
  archive: () => MilestoneItem[]
  upcoming: (limit?: number) => MilestoneItem[]
  completed: () => MilestoneItem[]
}

const initialBaby: BabyProfile = {
  name: 'Everly',
  // Born October 27, 2024 at 5:23 PM (local time)
  birthDateIso: '2024-10-27T17:23:00',
}

function scoreForUpcoming(m: MilestoneItem, ageMonths: number): number {
  // Lower score = higher priority
  if (m.level === 'mastered') return 9999
  if (ageMonths > m.ageEndMonths) return -100 + (ageMonths - m.ageEndMonths) // late: float to very top
  if (ageMonths >= m.ageStartMonths && ageMonths <= m.ageEndMonths) return -10 // currently in window
  return m.ageStartMonths - ageMonths // upcoming soonest next
}

export const useMilestoneStore = create<MilestoneState>()(
  persist(
    (set, get) => ({
      baby: initialBaby,
      milestones: defaultMilestones,
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
            level: existingIndex >= 0 ? state.milestones[existingIndex].level : 'none',
            levelHistory: existingIndex >= 0 ? state.milestones[existingIndex].levelHistory : [],
            createdAtIso:
              existingIndex >= 0 ? state.milestones[existingIndex].createdAtIso : new Date().toISOString(),
          }
          const next = [...state.milestones]
          if (existingIndex >= 0) next[existingIndex] = base
          else next.push(base)
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
          return { milestones: next }
        }),
      setLevelHistory: (id, history) =>
        set((state) => {
          if (!useAuthStore.getState().canEdit()) return state
          const sorted = [...history].sort((a, b) => new Date(a.timestampIso).getTime() - new Date(b.timestampIso).getTime())
          const finalLevel: MilestoneLevel = sorted.length > 0 ? sorted[sorted.length - 1].level : 'none'
          const next = state.milestones.map((m) => (m.id === id ? { ...m, level: finalLevel, levelHistory: sorted } : m))
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
    }),
    {
      name: 'everly-milestones-v2',
      version: 2,
      migrate: (persisted: any, _version) => {
        try {
          const state = (persisted ?? {}) as Partial<MilestoneState>
          const existing = Array.isArray(state.milestones) ? state.milestones : []
          const merged = [...existing]
          for (const seed of defaultMilestones) {
            if (!merged.some((m) => m.id === seed.id)) {
              merged.push(seed)
            }
          }
          return {
            ...state,
            baby: state.baby ?? initialBaby,
            milestones: merged,
          }
        } catch {
          return { baby: initialBaby, milestones: defaultMilestones }
        }
      },
    }
  )
)

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


