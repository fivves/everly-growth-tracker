import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, BedDouble, HeartPulse, Gamepad2, Activity, Sailboat } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { ChoreCategory } from './store'
import { useAuthStore } from '../auth/store'
import { useChoresStore } from './store'

export function ChoresPage() {
  const { choresToday, toggleChore, addChore, deleteChore } = useChoresStore()
  const list = choresToday()
  const currentUser = useAuthStore((s) => s.currentUser)
  const users = useAuthStore((s) => s.users)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ChoreCategory>('bio')
  const [minutes, setMinutes] = useState<number | ''>('')
  const [captain, setCaptain] = useState(currentUser ?? '')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!captain) {
      setCaptain(currentUser ?? (users[0]?.username ?? ''))
    }
  }, [currentUser, users])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    addChore({ title, description: description || undefined, category, estimatedMinutes: minutes === '' ? undefined : Number(minutes), captainUsername: captain || undefined })
    setTitle('')
    setCategory('bio')
    setMinutes('')
    setCaptain('')
    setDescription('')
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-brand-50 dark:from-black dark:to-gray-950">
      <header className="relative overflow-hidden border-b border-brand-100 dark:border-gray-800">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-gray-800 dark:to-gray-700 blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-gray-700 dark:to-gray-600 blur-3xl opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-pink-600 dark:from-brand-300 dark:to-pink-300 bg-clip-text text-transparent">Today's Chores</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">These reset every midnight. Check them off as you go.</p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {currentUser && (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a chore" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 px-3 py-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Short description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as ChoreCategory)} className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 px-3 py-2">
              <option value="food">Food</option>
              <option value="sleep">Sleep</option>
              <option value="bio">Bio</option>
              <option value="entertainment">Entertainment</option>
              <option value="health">Health</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Estimated minutes</span>
            <input value={minutes} onChange={(e) => setMinutes(e.target.value ? Number(e.target.value) : '')} type="number" min={0} placeholder="Min" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 px-3 py-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">Chore captain</span>
            <select value={captain} onChange={(e) => setCaptain(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 px-3 py-2">
              {users.map((u) => (
                <option key={u.username} value={u.username}>{u.username}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-6 text-right">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-4 py-2 shadow-lg shadow-brand-600/30 hover:bg-brand-700">Add chore</button>
          </div>
        </form>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((c) => (
            <motion.li
              key={c.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center size-9 rounded-xl bg-brand-50 dark:bg-gray-800 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-gray-700">
                    <CategoryIcon category={c.category} />
                  </span>
                  <div>
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${c.done ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{c.title}</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-2">
                      <span>{labelForCategory(c.category)}</span>
                      {typeof c.estimatedMinutes === 'number' && (
                        <span className="inline-flex items-center gap-1"><span className="opacity-70">•</span>{c.estimatedMinutes} min</span>
                      )}
                      {c.captainUsername && (
                        <span className="inline-flex items-center gap-1" title="Chore captain">
                          <SailorHatIcon />
                          <span>{c.captainUsername}</span>
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{c.description}</p>
                    )}
                    {c.lastCompletedBy && c.lastCompletedAtIso && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Completed by {c.lastCompletedBy} at {new Date(c.lastCompletedAtIso).toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const wasDone = c.done
                      toggleChore(c.id)
                      if (!wasDone) fireConfetti()
                    }}
                    disabled={!currentUser}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${!currentUser ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : c.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/30'}`}
                  >
                    {c.done ? 'Done' : 'Mark done'}
                  </motion.button>
                  <button onClick={() => deleteChore(c.id)} disabled={!currentUser} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${currentUser ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30' : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>Delete</button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </main>
    </div>
  )
}

function CategoryIcon({ category }: { category: ChoreCategory }) {
  const className = 'size-5'
  switch (category) {
    case 'food':
      return <Utensils className={className} />
    case 'sleep':
      return <BedDouble className={className} />
    case 'health':
      return <HeartPulse className={className} />
    case 'entertainment':
      return <Gamepad2 className={className} />
    default:
      return <Activity className={className} />
  }
}

function labelForCategory(category: ChoreCategory): string {
  switch (category) {
    case 'food':
      return 'Food'
    case 'sleep':
      return 'Sleep'
    case 'health':
      return 'Health'
    case 'entertainment':
      return 'Entertainment'
    default:
      return 'Bio'
  }
}

function fireConfetti() {
  const defaults = { spread: 60, ticks: 60, gravity: 0.9 }
  confetti({ ...defaults, particleCount: 60, origin: { y: 0.6 } })
  confetti({ ...defaults, particleCount: 120, origin: { y: 0.2 } })
}

function SailorHatIcon() {
  return <Sailboat className="size-4" />
}


