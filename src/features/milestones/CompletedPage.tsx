import { useMilestoneStore } from './store'
import { useToast } from '../../components/toast/ToastProvider'
import { MilestoneCard } from './components/MilestoneCard'

export function CompletedPage() {
  const { completed, setLevel, undoLevel } = useMilestoneStore()
  const { toast } = useToast()
  const list = completed()

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Completed Milestones</h2>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {list.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No completed milestones yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((m) => (
              <MilestoneCard
                key={m.id}
                item={m}
                onAdvance={() => {
                  setLevel(m.id, 'mastered')
                  toast('Already mastered!', { type: 'info' })
                }}
                onUndo={() => {
                  undoLevel(m.id)
                  toast('Undone!', { type: 'info' })
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


