export type MilestoneLevel = 'didIt' | 'learning' | 'mastered' | 'none'

export interface MilestoneLevelLogEntry {
  level: Exclude<MilestoneLevel, 'none'>
  timestampIso: string
}

export interface MilestoneItem {
  id: string
  title: string
  description?: string
  ageStartMonths: number
  ageEndMonths: number
  category: 'motor' | 'language' | 'social' | 'cognitive' | 'custom'
  level: MilestoneLevel
  levelHistory: MilestoneLevelLogEntry[]
  createdAtIso: string
  isCustom?: boolean
  createdBy?: string
}

export interface BabyProfile {
  name: string
  birthDateIso: string
}


