import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { PartyPopper, Activity, MessageCircle, Users, Brain, Star, PencilLine, Trash2 } from 'lucide-react'
import type { MilestoneItem, MilestoneLevel } from '../types'
import { useAuthStore } from '../../auth/store'
import type { ReactNode } from 'react'

function levelLabel(level: MilestoneLevel): string {
  switch (level) {
    case 'didIt':
      return 'I Did It!'
    case 'learning':
      return "I'm learning!"
    case 'mastered':
      return 'Mastered'
    default:
      return 'Not started'
  }
}

function CategoryIcon({ category }: { category: MilestoneItem['category'] }) {
  const className = 'size-4'
  switch (category) {
    case 'motor':
      return <Activity className={className} />
    case 'language':
      return <MessageCircle className={className} />
    case 'social':
      return <Users className={className} />
    case 'cognitive':
      return <Brain className={className} />
    default:
      return <Star className={className} />
  }
}

export function MilestoneCard({ item, onAdvance, onUndo, onEditLogs, onDelete, showAdvance = true, statusAside }: { item: MilestoneItem; onAdvance: () => void; onUndo: () => void; onEditLogs?: () => void; onDelete?: () => void; showAdvance?: boolean; statusAside?: ReactNode }) {
  const canEdit = useAuthStore((s) => s.canEdit())
  const windowText = `${item.ageStartMonths}-${item.ageEndMonths} mo`
  const pill = levelLabel(item.level)
  const colors: Record<MilestoneLevel, string> = {
    none: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    didIt: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    learning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }
  const canUndo = item.levelHistory.length > 0

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-4 box-border flex flex-col h-full"
    >
        <div className="flex items-start justify-between gap-4 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center size-6 rounded-full bg-brand-50 dark:bg-gray-800 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-gray-700">
                <CategoryIcon category={item.category} />
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{item.title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{windowText}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center min-w-0">
            <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', colors[item.level])}>{pill}</span>
            {statusAside && (
              <span className="ml-2 text-xs italic text-gray-600 dark:text-gray-300 truncate">{statusAside}</span>
            )}
          </div>
          <div className="flex items-center">
            {showAdvance && (
              <button
                onClick={onAdvance}
                disabled={!canEdit}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
                  canEdit ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:shadow-brand-600/30' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                )}
              >
                <PartyPopper className="size-4" /> Mark next level
              </button>
            )}
            <button
              onClick={onUndo}
              disabled={!canUndo || !canEdit}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                showAdvance && 'ml-2',
                canUndo && canEdit ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800' : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
              title={canUndo ? 'Undo last level change' : 'Nothing to undo yet'}
            >
              Undo
            </button>
            {onEditLogs && (
              <button
                onClick={onEditLogs}
                disabled={!canEdit}
                className={clsx(
                  'ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                  canEdit ? 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800' : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                )}
                title="Edit logs"
              >
                <PencilLine className="size-4"/> Edit logs
              </button>
            )}
            {onDelete && item.isCustom && (
              <button
                onClick={onDelete}
                disabled={!canEdit}
                className={clsx(
                  'ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                  canEdit ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30' : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                )}
                title="Delete custom milestone"
              >
                <Trash2 className="size-4"/>
              </button>
            )}
          </div>
        </div>
    </motion.div>
  )
}


